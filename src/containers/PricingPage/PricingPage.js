import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';
import {
  currentUserTypeSelector,
  isCurrentUserSubscribedSelector,
  currentUserEmailSelector,
  currentUserIdSelector,
} from '../../ducks/user.duck';

import {
  Page,
  LayoutSingleColumn,
  Heading,
  NamedLink,
  NamedRedirect,
  PrimaryButton,
} from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import css from './PricingPage.module.css';

const STRIPE_PRO_LINK = process.env.REACT_APP_STRIPE_PRO_PAYMENT_LINK;

/**
 * Builds a Stripe payment link with prefilled user params.
 */
const buildStripeLink = (baseLink, userEmail, userId) => {
  if (!baseLink) return null;
  const params = new URLSearchParams({
    prefilled_email: userEmail,
    client_reference_id: userId,
  });
  return `${baseLink}?${params.toString()}`;
};

// Small inline checkmark used in the feature lists.
const IconCheck = () => (
  <svg className={css.checkIcon} width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M13.5 4.5 6.5 11.5 3 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FeatureList = props => {
  const { features } = props;
  return (
    <ul className={css.featureList}>
      {features.map((feature, i) => (
        <li key={i} className={css.featureItem}>
          <IconCheck />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
};

/**
 * Pricing page (provider subscription plans).
 *
 * Public page, but only relevant to providers:
 * - logged out visitors can view the plans, but must sign up before subscribing
 * - logged-in providers can subscribe / manage their subscription
 * - logged-in customers are redirected back to the landing page (this page isn't for them)
 *
 * @returns {JSX.Element}
 */
const PricingPage = () => {
  const config = useConfiguration();
  const intl = useIntl();

  const scrollingDisabled = useSelector(isScrollingDisabled);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const userType = useSelector(currentUserTypeSelector);
  const isSubscribed = useSelector(isCurrentUserSubscribedSelector);
  const userEmail = useSelector(currentUserEmailSelector);
  const userId = useSelector(currentUserIdSelector);

  // A logged-in user's type is undefined until their profile loads, then a string
  // ('provider' | 'customer'). So the string itself means "loaded, and this is the type".
  const isProvider = userType === 'provider';
  const isCustomer = userType === 'customer';

  // Customers shouldn't land on the provider pricing page - send them home. isCustomer is
  // only true once the profile has loaded, so a provider is never redirected by mistake.
  if (isAuthenticated && isCustomer) {
    return <NamedRedirect name="LandingPage" />;
  }

  const title = intl.formatMessage(
    { id: 'PricingPage.schemaTitle' },
    { marketplaceName: config.marketplaceName }
  );

  // While an authenticated user's profile is still loading, avoid flashing the plans (a
  // customer would otherwise briefly see this page before the redirect above kicks in).
  // userType is only a string once loaded, so an undefined type means "still resolving".
  const isResolvingUser = isAuthenticated && typeof userType !== 'string';

  // Send the provider to the Stripe Payment Link for the $29/mo Pro plan, prefilled with
  // their email and tagged with their user id (client_reference_id) so the payment can be
  // reconciled back to this account later. Navigates in the same tab.
  const handleSubscribe = () => {
    const stripeLink = buildStripeLink(STRIPE_PRO_LINK, userEmail, userId);
    if (stripeLink) {
      window.location.href = stripeLink;
    } else if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('REACT_APP_STRIPE_PRO_PAYMENT_LINK is not set - subscribe is a no-op.');
    }
  };
  // Free plan CTA: it's the current plan only for a provider who isn't subscribed to Pro;
  // a subscribed provider has the Free plan included as part of Pro, not as their own plan.
  // Logged-out visitors are pointed at signup to get started.
  const freePlanCta =
    isProvider && isSubscribed ? (
      <PrimaryButton type="button" className={css.planButton} disabled>
        <FormattedMessage id="PricingPage.free.includedWithPro" />
      </PrimaryButton>
    ) : isProvider ? (
      <PrimaryButton type="button" className={css.planButton} disabled>
        <FormattedMessage id="PricingPage.free.currentPlan" />
      </PrimaryButton>
    ) : (
      <NamedLink name="SignupPage" className={css.planButtonLink}>
        <FormattedMessage id="PricingPage.free.getStarted" />
      </NamedLink>
    );

  // Pro plan CTA: providers can subscribe or manage; logged-out visitors must sign up first
  // (you can't subscribe while logged out).
  const proPlanCta = !isAuthenticated ? (
    <NamedLink name="SignupPage" className={css.planButtonLinkPrimary}>
      <FormattedMessage id="PricingPage.pro.subscribe" />
    </NamedLink>
  ) : isSubscribed ? (
    <NamedLink name="SubscriptionManagementPage" className={css.planButtonLinkPrimary}>
      <FormattedMessage id="PricingPage.pro.manage" />
    </NamedLink>
  ) : (
    <PrimaryButton type="button" className={css.planButton} onClick={handleSubscribe}>
      <FormattedMessage id="PricingPage.pro.subscribe" />
    </PrimaryButton>
  );

  const freeFeatures = [
    intl.formatMessage({ id: 'PricingPage.free.feature1' }),
    intl.formatMessage({ id: 'PricingPage.free.feature2' }),
    intl.formatMessage({ id: 'PricingPage.free.feature3' }),
  ];
  const proFeatures = [
    intl.formatMessage({ id: 'PricingPage.pro.feature1' }),
    intl.formatMessage({ id: 'PricingPage.pro.feature2' }),
    intl.formatMessage({ id: 'PricingPage.pro.feature3' }),
  ];

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        mainColumnClassName={css.layoutWrapperMain}
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <div className={css.root}>
          <header className={css.header}>
            <Heading as="h1" rootClassName={css.heading}>
              <FormattedMessage id="PricingPage.heading" />
            </Heading>
            <p className={css.subheading}>
              <FormattedMessage id="PricingPage.subheading" />
            </p>
          </header>

          {isResolvingUser ? null : (
            <div className={css.plans}>
              {/* Free / current plan */}
              <section className={css.plan}>
                <Heading as="h2" rootClassName={css.planName}>
                  <FormattedMessage id="PricingPage.free.name" />
                </Heading>
                <div className={css.planPrice}>
                  <span className={css.priceAmount}>
                    <FormattedMessage id="PricingPage.free.price" />
                  </span>
                </div>
                <p className={css.planTagline}>
                  <FormattedMessage id="PricingPage.free.tagline" />
                </p>
                <FeatureList features={freeFeatures} />
                {freePlanCta}
              </section>

              {/* Pro / paid plan */}
              <section className={classNames(css.plan, css.planFeatured)}>
                <span className={css.popularBadge}>
                  <FormattedMessage id="PricingPage.mostPopular" />
                </span>
                <Heading as="h2" rootClassName={css.planName}>
                  <FormattedMessage id="PricingPage.pro.name" />
                </Heading>
                <div className={css.planPrice}>
                  <span className={css.priceAmount}>
                    <FormattedMessage id="PricingPage.pro.price" />
                  </span>
                  <span className={css.pricePeriod}>
                    <FormattedMessage id="PricingPage.pro.period" />
                  </span>
                </div>
                <p className={css.planTagline}>
                  <FormattedMessage id="PricingPage.pro.tagline" />
                </p>
                <FeatureList features={proFeatures} />
                {proPlanCta}
              </section>
            </div>
          )}

          <p className={css.footnote}>
            <FormattedMessage id="PricingPage.footnote" />
          </p>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default PricingPage;
