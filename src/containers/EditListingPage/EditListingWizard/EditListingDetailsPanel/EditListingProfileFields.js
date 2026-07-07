import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { useConfiguration } from '../../../../context/configurationContext';
import { ensureCurrentUser } from '../../../../util/data';
import { isUploadImageOverLimitError } from '../../../../util/errors';
import { required } from '../../../../util/validators';
import { getCurrentUserTypeConfig } from '../../../../util/userHelpers';
import { uploadImage } from '../../../ProfileSettingsPage/ProfileSettingsPage.duck';
import { DisplayNameMaybe } from '../../../ProfileSettingsPage/ProfileSettingsForm/ProfileSettingsForm';

import { Avatar, FieldTextInput, IconSpinner, ImageFromFile } from '../../../../components';

// Reuse ProfileSettingsForm's avatar/input styling so those look identical here.
// Layout/spacing is local though (EditListingDetailsForm has a tighter rhythm than
// the standalone ProfileSettingsPage, and there are no section headings in this context).
import profileCss from '../../../ProfileSettingsPage/ProfileSettingsForm/ProfileSettingsForm.module.css';
import css from './EditListingProfileFields.module.css';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // Show spinner so that browser has time to load img srcset

/**
 * Renders the same "avatar + name + display name + bio" fields as ProfileSettingsForm,
 * so that a user who hasn't filled in their profile yet can do so while creating their
 * first listing. It reads/writes redux state directly (current user, image upload state)
 * instead of receiving them as props, and it registers plain Fields (firstName, lastName,
 * displayName, bio) on whichever Final Form instance it's rendered inside of - in this case
 * EditListingDetailsForm's form.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.formId] - The form id, used to namespace field ids
 * @returns {JSX.Element}
 */
const EditListingProfileFields = props => {
  const { formId } = props;
  const intl = useIntl();
  const dispatch = useDispatch();
  const config = useConfiguration();

  const currentUser = useSelector(state => state.user?.currentUser);
  const { image, uploadInProgress, uploadImageError } = useSelector(
    state => state.ProfileSettingsPage
  );

  const [uploadDelay, setUploadDelay] = useState(false);
  const uploadDelayTimeoutId = useRef(null);
  const wasUploadInProgress = useRef(uploadInProgress);

  useEffect(() => {
    // Upload delay is an additional time window during which the Avatar is in the DOM,
    // but not yet visible (time to load the image URL from srcset).
    if (wasUploadInProgress.current && !uploadInProgress) {
      setUploadDelay(true);
      uploadDelayTimeoutId.current = window.setTimeout(() => {
        setUploadDelay(false);
      }, UPLOAD_CHANGE_DELAY);
    }
    wasUploadInProgress.current = uploadInProgress;
  }, [uploadInProgress]);

  useEffect(() => {
    return () => window.clearTimeout(uploadDelayTimeoutId.current);
  }, []);

  const user = ensureCurrentUser(currentUser);
  const userTypeConfig = getCurrentUserTypeConfig(config, currentUser);

  const profileImage = image || { imageId: user.profileImage ? user.profileImage.id : null };
  const transientUserProfileImage = profileImage.uploadedImage || user.profileImage;
  const transientUser = { ...user, profileImage: transientUserProfileImage };

  const hasUploadError = !!uploadImageError && !uploadInProgress;
  const errorClasses = classNames({ [profileCss.avatarUploadError]: hasUploadError });

  const fileExists = !!profileImage.file;
  const fileUploadInProgress = uploadInProgress && fileExists;
  const delayAfterUpload = profileImage.imageId && uploadDelay;

  const uploadingOverlay =
    uploadInProgress || uploadDelay ? (
      <div className={profileCss.uploadingImageOverlay}>
        <IconSpinner />
      </div>
    ) : null;

  const imageFromFile =
    fileExists && (fileUploadInProgress || delayAfterUpload) ? (
      <ImageFromFile
        id={profileImage.id}
        className={errorClasses}
        rootClassName={profileCss.uploadingImage}
        aspectWidth={1}
        aspectHeight={1}
        file={profileImage.file}
      >
        {uploadingOverlay}
      </ImageFromFile>
    ) : null;

  const avatarClasses = classNames(errorClasses, profileCss.avatar, {
    [profileCss.avatarInvisible]: uploadDelay,
  });
  const avatarComponent =
    !fileUploadInProgress && profileImage.imageId ? (
      <Avatar
        className={avatarClasses}
        renderSizes="(max-width: 767px) 96px, 240px"
        user={transientUser}
        disableProfileLink
      />
    ) : null;

  const chooseAvatarLabel =
    profileImage.imageId || fileUploadInProgress ? (
      <div className={profileCss.avatarContainer}>
        {imageFromFile}
        {avatarComponent}
        <div className={profileCss.changeAvatar}>
          <FormattedMessage id="ProfileSettingsForm.changeAvatar" />
        </div>
      </div>
    ) : (
      <div className={profileCss.avatarPlaceholder}>
        <div className={profileCss.avatarPlaceholderText}>
          <FormattedMessage id="ProfileSettingsForm.addYourProfilePicture" />
        </div>
        <div className={profileCss.avatarPlaceholderTextMobile}>
          <FormattedMessage id="ProfileSettingsForm.addYourProfilePictureMobile" />
        </div>
      </div>
    );

  const onAvatarChange = e => {
    const file = e.target.files[0];
    if (file != null) {
      const tempId = `${file.name}_${Date.now()}`;
      dispatch(uploadImage({ id: tempId, file }));
    }
  };

  let avatarError = null;
  if (isUploadImageOverLimitError(uploadImageError)) {
    avatarError = (
      <div className={profileCss.error}>
        <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
      </div>
    );
  } else if (uploadImageError) {
    avatarError = (
      <div className={profileCss.error}>
        <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
      </div>
    );
  }

  const avatarInputId = formId ? `${formId}.profileImage` : 'profileImage';

  return (
    <>
      <div className={css.section}>
        <div className={css.avatarWrapper}>
          <label className={profileCss.label} htmlFor={avatarInputId}>
            {chooseAvatarLabel}
          </label>
          <input
            accept={ACCEPT_IMAGES}
            id={avatarInputId}
            name="profileImage"
            className={profileCss.uploadAvatarInput}
            disabled={uploadInProgress}
            onChange={onAvatarChange}
            type="file"
          />
          {avatarError}
        </div>
        <div className={profileCss.tip}>
          <FormattedMessage id="ProfileSettingsForm.tip" />
        </div>
        <div className={profileCss.fileInfo}>
          <FormattedMessage id="ProfileSettingsForm.fileInfo" />
        </div>
      </div>

      <div className={css.section}>
        <div className={css.nameRow}>
          <FieldTextInput
            className={profileCss.firstName}
            type="text"
            id={formId ? `${formId}.firstName` : 'firstName'}
            name="firstName"
            label={intl.formatMessage({ id: 'ProfileSettingsForm.firstNameLabel' })}
            placeholder={intl.formatMessage({ id: 'ProfileSettingsForm.firstNamePlaceholder' })}
            validate={required(
              intl.formatMessage({ id: 'ProfileSettingsForm.firstNameRequired' })
            )}
          />
          <FieldTextInput
            className={profileCss.lastName}
            type="text"
            id={formId ? `${formId}.lastName` : 'lastName'}
            name="lastName"
            label={intl.formatMessage({ id: 'ProfileSettingsForm.lastNameLabel' })}
            placeholder={intl.formatMessage({ id: 'ProfileSettingsForm.lastNamePlaceholder' })}
            validate={required(intl.formatMessage({ id: 'ProfileSettingsForm.lastNameRequired' }))}
          />
        </div>
      </div>

      <DisplayNameMaybe
        userTypeConfig={userTypeConfig}
        intl={intl}
        hideLabel
        sectionClassName={css.section}
      />

      <div className={css.section}>
        <FieldTextInput
          type="textarea"
          id={formId ? `${formId}.bio` : 'bio'}
          name="bio"
          label={intl.formatMessage({ id: 'ProfileSettingsForm.bioLabel' })}
          placeholder={intl.formatMessage({ id: 'ProfileSettingsForm.bioPlaceholder' })}
        />
      </div>
    </>
  );
};

export default EditListingProfileFields;
