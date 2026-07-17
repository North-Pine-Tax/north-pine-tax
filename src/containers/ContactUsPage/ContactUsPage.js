import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useConfiguration } from '../../context/configurationContext';
import { FormattedMessage, useIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/ui.duck';

import { Page, LayoutSingleColumn, Heading } from '../../components';

import TopbarContainer from '../TopbarContainer/TopbarContainer';
import FooterContainer from '../FooterContainer/FooterContainer';

import ContactUsForm from './ContactUsForm/ContactUsForm';
import ContactUsTree from '../../assets/Contact us Tree.jpg';
import css from './ContactUsPage.module.css';

const IconEmail = () => (
  <svg className={css.contactIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconPhone = () => (
  <svg className={css.contactIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <path
      d="M8.5 3.5h3.2l1.1 4.2-2 1.2a12.5 12.5 0 0 0 5.3 5.3l1.2-2 4.2 1.1v3.2c0 .9-.7 1.7-1.6 1.8-7.4.8-13.6-5.4-12.8-12.8.1-.9.9-1.6 1.8-1.6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const IconAddress = () => (
  <svg className={css.contactIcon} viewBox="0 0 24 24" aria-hidden="true" fill="none">
    <path
      d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const PineIllustration = () => (
 <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px" viewBox="0 0 200.867 200.867" style={{enableBackground:'new 0 0 296.867 296.867'}}  width="200.867" height="200.867"><path d="m198.963 145.96 -14.208 -14.207c2.428 1.194 5.443 0.785 7.461 -1.231 2.538 -2.54 2.538 -6.657 0 -9.193l-14.994 -14.992c2.545 1.88 6.145 1.675 8.45 -0.629 2.537 -2.538 2.537 -6.653 0 -9.191l-14.78 -14.78c2.52 1.654 5.938 1.374 8.154 -0.842 2.537 -2.537 2.537 -6.651 0 -9.189L165.488 58.148c2.377 1.033 5.242 0.583 7.184 -1.361 2.538 -2.538 2.538 -6.653 0 -9.189l-9.683 -9.683q-0.014 -0.015 -0.03 -0.028l-0.035 -0.039c-2.539 -2.536 -6.65 -2.536 -9.191 0l-9.747 9.749c-2.537 2.534 -2.537 6.651 0 9.19 1.943 1.943 4.811 2.393 7.186 1.36l-13.557 13.557c-2.537 2.538 -2.537 6.652 0 9.189 2.217 2.217 5.634 2.497 8.155 0.842l-14.78 14.78a6.496 6.496 0 0 0 -1.65 6.394l-10.164 -10.162c2.546 1.878 6.145 1.675 8.45 -0.629 2.537 -2.539 2.537 -6.655 0 -9.191l-14.782 -14.78c2.52 1.653 5.939 1.374 8.155 -0.842 2.537 -2.538 2.537 -6.653 0 -9.189l-13.557 -13.558c2.376 1.031 5.242 0.583 7.184 -1.361 2.537 -2.538 2.537 -6.651 0 -9.192L104.944 24.327c-0.008 -0.012 -0.019 -0.019 -0.028 -0.028 -0.012 -0.014 -0.022 -0.028 -0.036 -0.038 -2.538 -2.539 -6.65 -2.539 -9.19 0l-9.747 9.746c-2.537 2.54 -2.537 6.653 0 9.191 1.942 1.944 4.808 2.393 7.183 1.361l-13.554 13.557c-2.538 2.536 -2.538 6.651 0 9.189 2.214 2.216 5.632 2.495 8.155 0.842l-14.782 14.78c-2.539 2.536 -2.539 6.652 0 9.191 2.304 2.303 5.905 2.507 8.448 0.629l-13.273 13.273 -12.875 -12.875c2.52 1.654 5.939 1.374 8.154 -0.842a6.496 6.496 0 0 0 0 -9.19l-13.557 -13.555c2.378 1.03 5.242 0.582 7.184 -1.363a6.496 6.496 0 0 0 0 -9.19L47.348 49.325l-0.032 -0.028c-0.014 -0.011 -0.024 -0.025 -0.036 -0.037 -2.538 -2.539 -6.651 -2.539 -9.191 0L28.342 59.008a6.496 6.496 0 0 0 0 9.189c1.945 1.945 4.809 2.394 7.184 1.363l-13.557 13.555c-2.537 2.538 -2.537 6.652 0 9.19 2.217 2.217 5.634 2.497 8.157 0.842L15.346 107.928c-2.539 2.536 -2.539 6.65 0 9.189 2.304 2.304 5.903 2.509 8.446 0.629l-14.991 14.994c-2.54 2.537 -2.54 6.65 0 9.19 2.017 2.019 5.035 2.425 7.462 1.232L2.788 156.636C1.104 157.809 0 159.912 0 162.119c0 3.589 2.908 6.653 6.5 6.653h29.43v3.235c0 3.592 2.837 6.501 6.425 6.501 3.59 0 6.431 -2.909 6.431 -6.501v-3.235h29.558c0.062 0 0.12 -0.16 0.183 -0.162 1.73 0.05 3.471 -0.654 4.79 -1.972 2.54 -2.539 2.54 -6.554 0 -9.094l-13.904 -13.806h24.03v28.27c0 3.592 2.839 6.501 6.427 6.501 3.59 0 6.429 -2.909 6.429 -6.501v-28.27h13.894l-1.759 1.623a6.563 6.563 0 0 0 -2.788 5.372c0 3.589 2.908 6.538 6.499 6.538h29.488v14.738c0 3.592 2.84 6.501 6.427 6.501 3.589 0 6.429 -2.909 6.429 -6.501v-14.738h29.501c0.064 0 0.12 -0.116 0.183 -0.117 1.729 0.053 3.472 -0.629 4.792 -1.946 2.537 -2.539 2.537 -6.708 -0.002 -9.246"/></svg>
);

/**
 * Public Contact Us page with marketplace contact details and a Final Form contact form.
 *
 * @returns {JSX.Element}
 */
const ContactUsPage = () => {
  const config = useConfiguration();
  const intl = useIntl();
  const scrollingDisabled = useSelector(isScrollingDisabled);

  const [inProgress, setInProgress] = useState(false);
  const [submitReady, setSubmitReady] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const title = intl.formatMessage(
    { id: 'ContactUsPage.schemaTitle' },
    { marketplaceName: config.marketplaceName }
  );

  const handleSubmit = values => {
    setInProgress(true);
    setSubmitError(null);
    setSubmitReady(false);

    // Placeholder submit until a contact API endpoint is wired up.
    return new Promise(resolve => {
      window.setTimeout(() => resolve(values), 600);
    })
      .then(() => {
        setSubmitReady(true);
        window.setTimeout(() => setSubmitReady(false), 2000);
      })
      .catch(() => {
        setSubmitError(true);
      })
      .finally(() => {
        setInProgress(false);
      });
  };

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn
        mainColumnClassName={css.layoutWrapperMain}
        topbar={<TopbarContainer />}
        footer={<FooterContainer />}
      >
        <div className={css.root}>
          <div className={css.content}>
            <section className={css.infoColumn}>
              <Heading as="h1" rootClassName={css.heading}>
                <FormattedMessage id="ContactUsPage.heading" />
              </Heading>
              <p className={css.subheading}>
                <FormattedMessage id="ContactUsPage.subheading" />
              </p>

              <ul className={css.contactList}>
                <li className={css.contactItem}>
                  <IconEmail />
                  <div className={css.contactText}>
                    <span className={css.contactLabel}>
                      <FormattedMessage id="ContactUsPage.emailLabel" />
                    </span>
                    <a className={css.contactValue} href="mailto:Rkreider@northpinetax.com">
                      <FormattedMessage id="ContactUsPage.emailValue" />
                    </a>
                  </div>
                </li>
                <li className={css.contactItem}>
                  <IconPhone />
                  <div className={css.contactText}>
                    <span className={css.contactLabel}>
                      <FormattedMessage id="ContactUsPage.phoneLabel" />
                    </span>
                    <a className={css.contactValue} href="tel:+18143962151">
                      <FormattedMessage id="ContactUsPage.phoneValue" />
                    </a>
                  </div>
                </li>
                <li className={css.contactItem}>
                  <IconAddress />
                  <div className={css.contactText}>
                    <span className={css.contactLabel}>
                      <FormattedMessage id="ContactUsPage.addressLabel" />
                    </span>
                    <span className={css.contactValue}>
                      <FormattedMessage id="ContactUsPage.addressLine1" />
                    </span>
                    <span className={css.contactMeta}>
                      <FormattedMessage id="ContactUsPage.addressLine2" />
                    </span>
                    <span className={css.contactMeta}>
                      <FormattedMessage id="ContactUsPage.addressLine3" />
                    </span>
                  </div>
                </li>
              </ul>
              {/* <img src={ContactUsTree} alt="Contact us tree" className={css.pineIllustration} /> */}

              <PineIllustration />
            </section>

            <section className={css.formColumn}>
              {submitReady ? (
                <div className={css.successMessage} role="status">
                  <FormattedMessage id="ContactUsPage.successMessage" />
                </div>
              ) : null}
              {submitError ? (
                <div className={css.errorMessage} role="alert">
                  <FormattedMessage id="ContactUsPage.errorMessage" />
                </div>
              ) : null}
              <ContactUsForm
                formId="ContactUsForm"
                onSubmit={handleSubmit}
                inProgress={inProgress}
                submitReady={submitReady}
              />
            </section>
          </div>
        </div>
      </LayoutSingleColumn>
    </Page>
  );
};

export default ContactUsPage;
