const { denormalisedResponseEntities } = require('../../api-util/data');
const { getIntegrationSdk } = require('../../api-util/sdk');
const log = require('../../log');

// Find the marketplace user tied to a Stripe customer. customerId is stored in (queryable)
// profile.metadata on subscribe, so later subscription events can look the user up by it.
const findUserByCustomerId = async (iSdk, customer) => {
  const userRes = await iSdk.users.query({ meta_customerId: customer });
  return denormalisedResponseEntities(userRes)[0];
};

/**
 * Persist subscription state onto the marketplace user, keyed off Stripe events.
 *
 * Writes to profile.metadata (Integration-API-only, so a user can't fake their own
 * entitlement) - the frontend reads metadata.isSubscriptionActive to toggle Subscribe vs Manage.
 *
 * Lets unexpected errors throw so the webhook can 500 and have Stripe retry. Returns early
 * (no throw) for un-retryable situations like "no matching user".
 *
 * There is a single paid plan, so we only track whether a subscription is active - no plan
 * identification (no payment-link map, no price lookup_key).
 */
const updateUserProfile = async (data, eventType) => {
  const iSdk = getIntegrationSdk();

  if (eventType === 'checkout.session.completed') {
    const { mode, subscription, customer, client_reference_id } = data;

    // Only the recurring plan is sold here; ignore any non-subscription checkout.
    if (mode !== 'subscription') {
      return;
    }
    if (!client_reference_id) {
      log.error(new Error('client_reference_id missing on checkout.session.completed'), 'stripe-no-client-ref');
      return;
    }

    const userRes = await iSdk.users.show({ id: client_reference_id });
    const user = denormalisedResponseEntities(userRes)[0];
    if (!user) {
      log.error(new Error(`No user for client_reference_id ${client_reference_id}`), 'stripe-user-not-found');
      return;
    }

    await iSdk.users.updateProfile({
      id: user.id,
      metadata: {
        isSubscriptionActive: true,
        customerId: customer,
        subscriptionId: subscription,
        // A fresh subscribe clears any prior scheduled cancellation.
        cancelAtPeriodEnd: false,
        subscriptionEndsAt: null,
      },
    });
    // Grant read access now that the user has an active subscription.
    await iSdk.users.updatePermissions({
      id: user.id,
      read: 'permission/allow',
    });
    return;
  }

  if (eventType === 'customer.subscription.updated') {
    // The user cancelling "not now" arrives here with cancel_at_period_end=true; the
    // subscription stays active until it ends (then customer.subscription.deleted fires).
    const { customer, cancel_at_period_end, cancel_at, items } = data;

    const user = await findUserByCustomerId(iSdk, customer);
    if (!user) {
      log.error(new Error(`No user for customer ${customer}`), 'stripe-user-not-found');
      return;
    }

    // As of Stripe API 2025-03-31, the billing period lives on the item, not the subscription.
    const itemPeriodEnd = items?.data?.[0]?.current_period_end;
    const endsAtUnix = cancel_at || itemPeriodEnd || null;

    await iSdk.users.updateProfile({
      id: user.id,
      metadata: {
        cancelAtPeriodEnd: !!cancel_at_period_end,
        subscriptionEndsAt: endsAtUnix ? endsAtUnix * 1000 : null, // ms, for JS Date
      },
    });
    return;
  }

  if (eventType === 'customer.subscription.deleted') {
    // Subscription has actually ended (immediate cancel, or reached the scheduled period end).
    const { customer } = data;

    const user = await findUserByCustomerId(iSdk, customer);
    if (!user) {
      log.error(new Error(`No user for customer ${customer}`), 'stripe-user-not-found');
      return;
    }

    await iSdk.users.updateProfile({
      id: user.id,
      metadata: {
        isSubscriptionActive: false,
        subscriptionId: null,
        cancelAtPeriodEnd: false,
        subscriptionEndsAt: null,
      },
    });
    // Subscription has ended - revoke read access.
    await iSdk.users.updatePermissions({
      id: user.id,
      read: 'permission/deny',
    });
  }
};

module.exports = {
  updateUserProfile,
};
