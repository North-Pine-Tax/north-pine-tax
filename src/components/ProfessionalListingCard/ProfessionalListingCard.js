import React from 'react';
import classNames from 'classnames';

import { FormattedMessage } from '../../util/reactIntl';
import { createSlug } from '../../util/urlHelpers';

import { AvatarMedium, NamedLink, ReviewRating } from '../../components';

import css from './ProfessionalListingCard.module.css';

// Review aggregation isn't wired up yet, so the rating and review count are static placeholders.
const STATIC_RATING = 5;
const STATIC_REVIEW_COUNT = 100;

/**
 * ProfessionalListingCard
 *
 * Row-style card for provider/professional listings: avatar on the left, business name,
 * location, and a (static, for now) rating row in the middle, and a "View Profile" CTA on the
 * right. The CTA is purely visual - the whole row is already a NamedLink to the listing, so
 * clicking the button triggers the same navigation as clicking anywhere else on the card.
 * Rendered by ListingCard when the listing's listingType is the provider listing type.
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.rootClassName overwrite component's own css.root
 * @param {Object} props.listing API entity: listing or ownListing
 * @returns {JSX.Element}
 */
export const ProfessionalListingCard = props => {
  const { className, rootClassName, listing } = props;

  const classes = classNames(rootClassName || css.root, className);

  const id = listing?.id?.uuid;
  const { title = '', publicData } = listing?.attributes || {};
  const slug = createSlug(title);
  const location = publicData?.location?.address;
  const author = listing?.author;

  return (
    <NamedLink className={classes} name="ListingPage" params={{ id, slug }} ariaLabel={title}>
      <AvatarMedium className={css.avatar} user={author} disableProfileLink />
      <div className={css.content}>
        <div className={css.title}>{title}</div>
        {location ? <div className={css.location}>{location}</div> : null}
        <div className={css.ratingRow}>
          <span className={css.ratingValue}>{STATIC_RATING.toFixed(1)}</span>
          <ReviewRating
            className={css.reviewStars}
            rating={STATIC_RATING}
            reviewStarClassName={css.reviewStar}
          />
          <span className={css.reviewCount}>
            <FormattedMessage
              id="ProfessionalListingCard.reviewCount"
              values={{ count: STATIC_REVIEW_COUNT }}
            />
          </span>
        </div>
      </div>
      <span className={css.ctaButton}>
        <FormattedMessage id="ProfessionalListingCard.viewProfile" />
      </span>
    </NamedLink>
  );
};

export default ProfessionalListingCard;
