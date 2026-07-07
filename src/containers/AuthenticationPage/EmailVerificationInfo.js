import React from 'react';

import { FormattedMessage } from '../../util/reactIntl';
import { PROVIDER_LISTING_TYPE } from '../../util/urlHelpers';

import { Heading, NamedLink, IconEmailSent, InlineTextButton, IconClose } from '../../components';

import css from './AuthenticationPage.module.css';

const EmailVerificationInfo = props => {
  const {
    name,
    userType,
    email,
    onResendVerificationEmail,
    resendErrorMessage,
    sendVerificationEmailInProgress,
  } = props;

  const isProvider = userType === 'provider';
  const closeLinkName = isProvider ? 'NewListingPage' : 'ProfileSettingsPage';
  const closeLinkToMaybe = isProvider
    ? { to: { search: `?listingType=${PROVIDER_LISTING_TYPE}` } }
    : {};

  const resendEmailLink = (
    <InlineTextButton rootClassName={css.modalHelperLink} onClick={onResendVerificationEmail}>
      <FormattedMessage id="AuthenticationPage.resendEmailLinkText" />
    </InlineTextButton>
  );

  const fixEmailLink = (
    <NamedLink className={css.modalHelperLink} name="ContactDetailsPage">
      <FormattedMessage id="AuthenticationPage.fixEmailLinkText" />
    </NamedLink>
  );

  return (
    <div className={css.content}>
      <NamedLink className={css.verifyClose} name={closeLinkName} {...closeLinkToMaybe}>
        <span className={css.closeText}>
          <FormattedMessage id="AuthenticationPage.verifyEmailClose" />
        </span>
        <IconClose rootClassName={css.closeIcon} />
      </NamedLink>
      <IconEmailSent className={css.modalIcon} />
      <Heading as="h1" rootClassName={css.modalTitle}>
        <FormattedMessage id="AuthenticationPage.verifyEmailTitle" values={{ name }} />
      </Heading>
      <p className={css.modalMessage}>
        <FormattedMessage id="AuthenticationPage.verifyEmailText" values={{ email }} />
      </p>
      {resendErrorMessage}

      <div className={css.bottomWrapper}>
        <p className={css.modalHelperText}>
          {sendVerificationEmailInProgress ? (
            <FormattedMessage id="AuthenticationPage.sendingEmail" />
          ) : (
            <FormattedMessage id="AuthenticationPage.resendEmail" values={{ resendEmailLink }} />
          )}
        </p>
        <p className={css.modalHelperText}>
          <FormattedMessage id="AuthenticationPage.fixEmail" values={{ fixEmailLink }} />
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationInfo;
