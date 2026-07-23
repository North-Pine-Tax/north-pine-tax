import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { ensureCurrentUser } from '../../util/data';
import { createBillingPortalSession } from '../../util/api';
import {
  isProviderUser,
  showCreateListingLinkForUser,
  showPaymentDetailsForUser,
} from '../../util/userHelpers';
import { isCurrentUserSubscribedSelector } from '../../ducks/user.duck';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import {
  H3,
  NamedLink,
  NamedRedirect,
  Page,
  PrimaryButton,
  UserNav,
  LayoutSideNavigation,
} from '../../components';

import TopbarContainer from '../../containers/TopbarContainer/TopbarContainer';
import FooterContainer from '../../containers/FooterContainer/FooterContainer';

import css from './SubscriptionManagementPage.module.css';

/**
 * SubscriptionManagementPage
 *
 * Account settings page for providers to review their subscription status and either open the
 * Stripe Billing Portal (active subscription) or head to the pricing page (no active
 * subscription) to subscribe. Not relevant for customers, so they're redirected home.
 *
 * @component
 * @returns {JSX.Element}
 */
const SubscriptionManagementPage = () => {
  const [manageInProgress, setManageInProgress] = useState(false);
  const [manageError, setManageError] = useState(false);
  const config = useConfiguration();
  const intl = useIntl();

  const currentUser = useSelector(state => state.user.currentUser);
  const isSubscribed = useSelector(isCurrentUserSubscribedSelector);
  const scrollingDisabled = useSelector(isScrollingDisabled);

  const user = ensureCurrentUser(currentUser);
  const isProvider = isProviderUser(currentUser);

  // Fetch a Stripe Billing Portal URL for the current user and send them there (same tab)
  // to manage or cancel their subscription.
  const handleManageSubscription = () => {
    setManageError(false);
    setManageInProgress(true);

    createBillingPortalSession()
      .then(({ url }) => {
        if (url) {
          window.location.href = url;
        } else {
          setManageInProgress(false);
        }
      })
      .catch(() => {
        setManageInProgress(false);
        setManageError(true);
      });
  };

  const title = intl.formatMessage({ id: 'SubscriptionManagementPage.title' });

  const showManageListingsLink = showCreateListingLinkForUser(config, currentUser);
  const { showPayoutDetails, showPaymentMethods } = showPaymentDetailsForUser(config, currentUser);
  const accountSettingsNavProps = {
    currentPage: 'SubscriptionManagementPage',
    showPaymentMethods,
    showPayoutDetails,
  };

  // This page is only meant for providers - customers are sent back home.
  if (user.id && !isProvider) {
    return <NamedRedirect name="LandingPage" />;
  }

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSideNavigation
        topbar={
          <>
            <TopbarContainer
              desktopClassName={css.desktopTopbar}
              mobileClassName={css.mobileTopbar}
            />
            <UserNav
              currentPage="SubscriptionManagementPage"
              showManageListingsLink={showManageListingsLink}
            />
          </>
        }
        sideNav={null}
        useAccountSettingsNav
        accountSettingsNavProps={accountSettingsNavProps}
        footer={<FooterContainer />}
        intl={intl}
      >
        <div className={css.content}>
          <H3 as="h1">
            <FormattedMessage id="SubscriptionManagementPage.heading" />
          </H3>

          {user.id ? (
            <div className={css.statusCard}>
              <div className={css.statusRow}>
                <span
                  className={classNames(
                    css.statusDot,
                    isSubscribed ? css.statusDotActive : css.statusDotInactive
                  )}
                />
                <span className={css.statusLabel}>
                  <FormattedMessage
                    id={
                      isSubscribed
                        ? 'SubscriptionManagementPage.statusActive'
                        : 'SubscriptionManagementPage.statusInactive'
                    }
                  />
                </span>
              </div>

              <p className={css.statusDescription}>
                <FormattedMessage
                  id={
                    isSubscribed
                      ? 'SubscriptionManagementPage.activeDescription'
                      : 'SubscriptionManagementPage.inactiveDescription'
                  }
                />
              </p>

              {manageError ? (
                <p className={css.error}>
                  <FormattedMessage id="SubscriptionManagementPage.manageError" />
                </p>
              ) : null}

              {isSubscribed ? (
                <PrimaryButton
                  type="button"
                  className={css.actionButton}
                  onClick={handleManageSubscription}
                  inProgress={manageInProgress}
                  disabled={manageInProgress}
                >
                  <FormattedMessage id="SubscriptionManagementPage.manageButton" />
                </PrimaryButton>
              ) : (
                <NamedLink name="PricingPage" className={css.actionButtonLink}>
                  <FormattedMessage id="SubscriptionManagementPage.viewPricingButton" />
                </NamedLink>
              )}
            </div>
          ) : null}
        </div>
      </LayoutSideNavigation>
    </Page>
  );
};

export default SubscriptionManagementPage;
