const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } = process.env;

const stripe = require('stripe')(STRIPE_SECRET_KEY);
const log = require('../../log');
const { updateUserProfile } = require('./helper');

// Events we act on. Everything else is acknowledged with 200 so Stripe stops retrying it.
const RELEVANT_EVENTS = [
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',
];

const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  // Signature verification needs the untouched raw body:
  // - CSP on:  server/index.js's json `verify` hook stashes it on req.rawBody
  // - CSP off: this route's express.raw() leaves the Buffer on req.body
  const payload = req.rawBody || req.body;

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    log.error(err, 'stripe-webhook-signature-verification-failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (!RELEVANT_EVENTS.includes(event.type)) {
    return res.status(200).send();
  }

  try {
    await updateUserProfile(event.data.object, event.type);
    return res.status(200).send();
  } catch (err) {
    // Transient failure - return 500 so Stripe retries the delivery.
    log.error(err, 'stripe-webhook-processing-failed', { eventType: event.type });
    return res.status(500).send();
  }
};

module.exports = stripeWebhooks;
