import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../../../util/reactIntl';
import { NamedLink } from '../../../../components';

import Field, { hasDataInFields } from '../../Field';

import SectionContainer from '../SectionContainer';
import css from './SectionHero.module.css';

/**
 * @typedef {Object} FieldComponentConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

const IconBriefcase = ({ className }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9.5 8.5V7.5C9.5 5.84315 10.8431 4.5 12.5 4.5H15.5C17.1569 4.5 18.5 5.84315 18.5 7.5V8.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <rect
      x="4.5"
      y="8.5"
      width="19"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path d="M4.5 14.5H23.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const IconProfessional = ({ className }) => (
  <svg
    className={className}
    width="28"
    height="28"
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="14" cy="14" r="10.25" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="14" cy="11.5" r="3.25" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M7.5 21.5C8.6 18.9 11 17.25 14 17.25C17 17.25 19.4 18.9 20.5 21.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconShieldCheck = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 3L4.5 6.5V11.5C4.5 16.25 7.7 20.55 12 21.5C16.3 20.55 19.5 16.25 19.5 11.5V6.5L12 3Z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11.2 14.2L15.5 9.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconLock = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="5.5"
      y="10.5"
      width="13"
      height="10"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path
      d="M8.5 10.5V7.5C8.5 5.567 10.067 4 12 4C13.933 4 15.5 5.567 15.5 7.5V10.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const IconPeople = ({ className }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="9" cy="8" r="2.75" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="16" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M3.5 18.5C4.4 15.8 6.6 14.25 9 14.25C11.4 14.25 13.6 15.8 14.5 18.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M14.25 14.5C15.5 14.1 16.9 14.35 17.9 15.35C18.9 16.35 19.25 17.75 19.25 18.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
);

const HeroCtaCard = ({ to, variant, icon: Icon, titleId, subtitleId }) => {
  const cardClass = classNames(css.ctaCard, {
    [css.ctaCardPrimary]: variant === 'primary',
    [css.ctaCardSecondary]: variant === 'secondary',
  });

  return (
    <NamedLink name={to.name} params={to.params} className={cardClass}>
      <span className={css.ctaIcon}>
        <Icon />
      </span>
      <span className={css.ctaText}>
        <span className={css.ctaTitle}>
          <FormattedMessage id={titleId} />
        </span>
        <span className={css.ctaSubtitle}>
          <FormattedMessage id={subtitleId} />
        </span>
      </span>
    </NamedLink>
  );
};

const TrustItem = ({ icon: Icon, titleId, subtitleId }) => (
  <div className={css.trustItem}>
    <span className={css.trustIcon}>
      <Icon />
    </span>
    <span className={css.trustText}>
      <span className={css.trustTitle}>
        <FormattedMessage id={titleId} />
      </span>
      <span className={css.trustSubtitle}>
        <FormattedMessage id={subtitleId} />
      </span>
    </span>
  </div>
);

/**
 * Landing-hero CTAs and trust indicators (North Pine brand).
 *
 * @returns {JSX.Element}
 */
const LandingHeroExtras = () => (
  <div className={css.heroExtras}>
    <div className={css.ctaRow}>
      <HeroCtaCard
        to={{ name: 'NewListingPage' }}
        variant="primary"
        icon={IconBriefcase}
        titleId="SectionHero.postJobTitle"
        subtitleId="SectionHero.postJobSubtitle"
      />
      <HeroCtaCard
        to={{ name: 'SearchPage' }}
        variant="secondary"
        icon={IconProfessional}
        titleId="SectionHero.professionalTitle"
        subtitleId="SectionHero.professionalSubtitle"
      />
    </div>
    <div className={css.trustRow}>
      <TrustItem
        icon={IconShieldCheck}
        titleId="SectionHero.trustProfessionalsTitle"
        subtitleId="SectionHero.trustProfessionalsSubtitle"
      />
      <TrustItem
        icon={IconLock}
        titleId="SectionHero.trustSecureTitle"
        subtitleId="SectionHero.trustSecureSubtitle"
      />
      <TrustItem
        icon={IconPeople}
        titleId="SectionHero.trustJobsTitle"
        subtitleId="SectionHero.trustJobsSubtitle"
      />
    </div>
  </div>
);

/**
 * Section component for a website's hero section
 * The Section Hero doesn't have any Blocks by default, all the configurations are made in the Section Hero settings
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
 * @param {'hero'} props.sectionType
 * @param {Object?} props.title
 * @param {Object?} props.description
 * @param {Object?} props.appearance
 * @param {Object?} props.callToAction
 * @param {Object} props.options extra options for the section component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentConfig>?} props.options.fieldComponents custom fields
 * @returns {JSX.Element} Section for article content
 */
const SectionHero = props => {
  const {
    sectionId,
    className,
    rootClassName,
    defaultClasses,
    title,
    description,
    appearance,
    callToAction,
    options,
  } = props;

  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const fieldComponents = options?.fieldComponents;
  const fieldOptions = { fieldComponents };

  const hasHeaderFields = hasDataInFields([title, description, callToAction], fieldOptions);
  const isLandingHero = sectionId === 'landing-hero';

  return (
    <SectionContainer
      id={sectionId}
      className={className}
      rootClassName={classNames(rootClassName || css.root)}
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
      {isLandingHero ? <LandingHeroExtras /> : null}
    </SectionContainer>
  );
};

export default SectionHero;
