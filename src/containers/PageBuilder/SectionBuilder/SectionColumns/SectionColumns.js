import React, { useState } from 'react';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../../util/reactIntl';
import { NamedLink } from '../../../../components';

import Field, { hasDataInFields } from '../../Field';
import BlockBuilder from '../../BlockBuilder';

import SectionContainer from '../SectionContainer';
import css from './SectionColumns.module.css';

// The number of columns (numColumns) affects styling and responsive images
const COLUMN_CONFIG = [
  { css: css.oneColumn, responsiveImageSizes: '(max-width: 767px) 100vw, 1200px' },
  { css: css.twoColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 600px' },
  { css: css.threeColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 400px' },
  { css: css.fourColumns, responsiveImageSizes: '(max-width: 767px) 100vw, 265px' },
];
const getIndex = numColumns => numColumns - 1;
const getColumnCSS = numColumns => {
  const config = COLUMN_CONFIG[getIndex(numColumns)];
  return config ? config.css : COLUMN_CONFIG[0].css;
};
const getResponsiveImageSizes = numColumns => {
  const config = COLUMN_CONFIG[getIndex(numColumns)];
  return config ? config.responsiveImageSizes : COLUMN_CONFIG[0].responsiveImageSizes;
};

/**
 * User silhouette icon (matches design: circular badge with person outline).
 *
 * @param {Object} props
 * @param {string?} props.className
 * @returns {JSX.Element}
 */
const IconUser = ({ className }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 12.75C14.4853 12.75 16.5 10.7353 16.5 8.25C16.5 5.76472 14.4853 3.75 12 3.75C9.51472 3.75 7.5 5.76472 7.5 8.25C7.5 10.7353 9.51472 12.75 12 12.75Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.875 20.25C4.875 16.7982 8.06472 14 12 14C15.9353 14 19.125 16.7982 19.125 20.25"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Briefcase icon (matches design: circular badge with briefcase outline).
 *
 * @param {Object} props
 * @param {string?} props.className
 * @returns {JSX.Element}
 */
const IconBriefcase = ({ className }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M8.25 7.5V6.75C8.25 5.50736 9.25736 4.5 10.5 4.5H13.5C14.7426 4.5 15.75 5.50736 15.75 6.75V7.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 9.75C4.5 8.50736 5.50736 7.5 6.75 7.5H17.25C18.4926 7.5 19.5 8.50736 19.5 9.75V17.25C19.5 18.4926 18.4926 19.5 17.25 19.5H6.75C5.50736 19.5 4.5 18.4926 4.5 17.25V9.75Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.5 12.75H19.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CLIENT_STEPS = [
  { titleId: 'SectionColumns.howItWorks.clientStep1Title', bodyId: 'SectionColumns.howItWorks.clientStep1Body' },
  { titleId: 'SectionColumns.howItWorks.clientStep2Title', bodyId: 'SectionColumns.howItWorks.clientStep2Body' },
  { titleId: 'SectionColumns.howItWorks.clientStep3Title', bodyId: 'SectionColumns.howItWorks.clientStep3Body' },
  { titleId: 'SectionColumns.howItWorks.clientStep4Title', bodyId: 'SectionColumns.howItWorks.clientStep4Body' },
];

const PRO_STEPS = [
  { titleId: 'SectionColumns.howItWorks.proStep1Title', bodyId: 'SectionColumns.howItWorks.proStep1Body' },
  { titleId: 'SectionColumns.howItWorks.proStep2Title', bodyId: 'SectionColumns.howItWorks.proStep2Body' },
  { titleId: 'SectionColumns.howItWorks.proStep3Title', bodyId: 'SectionColumns.howItWorks.proStep3Body' },
  { titleId: 'SectionColumns.howItWorks.proStep4Title', bodyId: 'SectionColumns.howItWorks.proStep4Body' },
];

/**
 * Numbered step list with vertical timeline connector.
 *
 * @param {Object} props
 * @param {Array<{titleId: string, bodyId: string}>} props.steps
 * @param {'primary' | 'supporting'} props.tone
 * @returns {JSX.Element}
 */
const StepList = ({ steps, tone }) => (
  <ol className={classNames(css.stepList, tone === 'supporting' ? css.stepListSupporting : null)}>
    {steps.map((step, index) => (
      <li key={step.titleId} className={css.stepItem}>
        <span className={css.stepNumber} aria-hidden="true">
          {index + 1}
        </span>
        <span className={css.stepCopy}>
          <span className={css.stepTitle}>
            <FormattedMessage id={step.titleId} />
          </span>
          <span className={css.stepBody}>
            <FormattedMessage id={step.bodyId} />
          </span>
        </span>
      </li>
    ))}
  </ol>
);

/**
 * Path card for clients or professionals.
 *
 * @param {Object} props
 * @param {'primary' | 'supporting'} props.tone
 * @param {React.ComponentType} props.icon
 * @param {string} props.titleId
 * @param {string} props.descriptionId
 * @param {Array} props.steps
 * @param {string} props.ctaId
 * @param {{ name: string, params?: Object }} props.to
 * @returns {JSX.Element}
 */
const PathCard = ({ tone, icon: Icon, titleId, descriptionId, steps, ctaId, to }) => {
  const isSupporting = tone === 'supporting';
  return (
    <div className={classNames(css.pathCard, isSupporting ? css.pathCardSupporting : css.pathCardPrimary)}>
      <div className={css.pathCardContent}>
        <div className={css.pathIconBadge}>
          <Icon className={css.pathIcon} />
        </div>
        <div>
          <h3 className={css.pathTitle}>
            <FormattedMessage id={titleId} />
          </h3>
          <p className={css.pathDescription}>
            <FormattedMessage id={descriptionId} />
          </p>
          <br/>
          <p className={css.pathDescription}>
           {descriptionId == "SectionColumns.howItWorks.clientDescription" ? <FormattedMessage id="SectionColumns.howItWorks.clientDescription2" /> : <FormattedMessage id="SectionColumns.howItWorks.proDescription2" />} 
          
          </p>
          
          <hr className={css.pathDivider} />

        </div>
      </div>
   
      <StepList steps={steps} tone={tone} />
      <NamedLink
        name={to.name}
        params={to.params}
        className={classNames(css.pathCta, isSupporting ? css.pathCtaSupporting : css.pathCtaPrimary)}
      >
        <FormattedMessage id={ctaId} />
      </NamedLink>
    </div>
  );
};

/**
 * Custom "How It Works" layout: side photos + two path cards.
 *
 * @returns {JSX.Element}
 */
const HowItWorksSection = () => (
  <div className={css.howItWorks}>


    <div className={css.howItWorksGrid}>
      <div className={css.sideImageWrap}>
        <img
          className={css.sideImage}
          src="/static/how-it-works/client-demo.jpg"
          alt=""
          loading="lazy"
        />
      </div>

      <PathCard
        tone="primary"
        icon={IconUser}
        titleId="SectionColumns.howItWorks.clientTitle"
        descriptionId="SectionColumns.howItWorks.clientDescription"
        steps={CLIENT_STEPS}
        ctaId="SectionColumns.howItWorks.clientCta"
        to={{ name: 'NewListingPage' }}
      />

      <PathCard
        tone="supporting"
        icon={IconBriefcase}
        titleId="SectionColumns.howItWorks.proTitle"
        descriptionId="SectionColumns.howItWorks.proDescription"
        steps={PRO_STEPS}
        ctaId="SectionColumns.howItWorks.proCta"
        to={{ name: 'SignupPage' }}
      />

      <div className={css.sideImageWrap}>
        <img
          className={css.sideImage}
          src="/static/how-it-works/pro-demo.jpg"
          alt=""
          loading="lazy"
        />
      </div>
    </div>
  </div>
);

/**
 * Envelope icon for the newsletter section badge.
 *
 * @param {Object} props
 * @param {string?} props.className
 * @returns {JSX.Element}
 */
const IconEnvelope = ({ className }) => (
  <svg
    className={className}
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="3.5"
      y="5.5"
      width="17"
      height="13"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M4.5 7.5L12 13L19.5 7.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Newsletter signup bar: messaging on the left, email form on the right.
 *
 * @returns {JSX.Element}
 */
const NewsletterSection = () => {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | invalid | success

  const handleSubmit = event => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus('invalid');
      return;
    }
    setStatus('success');
    setEmail('');
  };

  return (
    <div className={css.newsletter}>
      <div className={css.newsletterInner}>
        <div className={css.newsletterIntro}>
          <div className={css.newsletterIconBadge}>
            <IconEnvelope className={css.newsletterIcon} />
          </div>
          <div className={css.newsletterCopy}>
            <h2 className={css.newsletterTitle}>
              <FormattedMessage id="SectionColumns.newsletter.title" />
            </h2>
            <p className={css.newsletterDescription}>
              <FormattedMessage id="SectionColumns.newsletter.description" />
            </p>
          </div>
        </div>

        <form className={css.newsletterForm} onSubmit={handleSubmit} noValidate>
          <label className={css.newsletterLabel} htmlFor="newsletter-email">
            <FormattedMessage id="SectionColumns.newsletter.emailLabel" />
          </label>
          <input
            id="newsletter-email"
            className={css.newsletterInput}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={event => {
              setEmail(event.target.value);
              if (status !== 'idle') {
                setStatus('idle');
              }
            }}
            placeholder={intl.formatMessage({ id: 'SectionColumns.newsletter.placeholder' })}
            aria-invalid={status === 'invalid'}
          />
          <button className={css.newsletterButton} type="submit">
            <FormattedMessage id="SectionColumns.newsletter.subscribe" />
          </button>
          {status === 'invalid' ? (
            <p className={css.newsletterFeedback} role="alert">
              <FormattedMessage id="SectionColumns.newsletter.invalidEmail" />
            </p>
          ) : null}
          {status === 'success' ? (
            <p className={css.newsletterFeedback} role="status">
              <FormattedMessage id="SectionColumns.newsletter.success" />
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
};

/**
 * @typedef {Object} BlockConfig
 * @property {string} blockId
 * @property {string} blockName
 * @property {'defaultBlock' | 'footerBlock' | 'socialMediaLink'} blockType
 */

/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * Section component that's able to show blocks in multiple different columns (defined by "numColumns" prop)
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {Object} props.defaultClasses
 * @param {string} props.defaultClasses.sectionDetails
 * @param {string} props.defaultClasses.title
 * @param {string} props.defaultClasses.description
 * @param {string} props.defaultClasses.ctaButton
 * @param {string} props.sectionId id of the section
 * @param {'columns'} props.sectionType
 * @param {Object?} props.title
 * @param {Object?} props.description
 * @param {Object?} props.appearance
 * @param {Object?} props.callToAction
 * @param {Array<BlockConfig>?} props.blocks array of block configs
 * @param {boolean?} props.isInsideContainer
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionColumns = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    numColumns,
    title,
    description,
    appearance,
    callToAction,
    blocks = [],
    isInsideContainer = false,
    options,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const isHowItWorks = sectionId === 'how-it-works';
  const isNewsletter = sectionId === 'newsletter';
  const hasHeaderFields =
    !isNewsletter && hasDataInFields([title, description, callToAction], fieldOptions);
  const hasBlocks = !isNewsletter && blocks?.length > 0;

  return (
    <SectionContainer
      id={sectionId}
      className={className}
      rootClassName={rootClassName}
      appearance={appearance}
      options={fieldOptions}
    >
      {hasHeaderFields ? (
        <header className={defaultClasses.sectionDetails}>
          <Field data={title} className={defaultClasses.title} options={fieldOptions} />
          <Field data={description} className={defaultClasses.description} options={fieldOptions} />
          <Field data={callToAction} className={defaultClasses.ctaButton} options={fieldOptions} />
        </header>
      ) : null}
      {hasBlocks ? (
        <div
          className={classNames(defaultClasses.blockContainer, getColumnCSS(numColumns), {
            [css.noSidePaddings]: isInsideContainer,
          })}
        >
          <BlockBuilder
            ctaButtonClass={defaultClasses.ctaButton}
            blocks={blocks}
            sectionId={sectionId}
            responsiveImageSizes={getResponsiveImageSizes(numColumns)}
            options={options}
          />
        </div>
      ) : null}
      {isHowItWorks ? <HowItWorksSection /> : null}
      {isNewsletter ? <NewsletterSection /> : null}
    </SectionContainer>
  );
};

export default SectionColumns;
