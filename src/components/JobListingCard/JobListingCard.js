import React from 'react';
import classNames from 'classnames';

import { useIntl } from '../../util/reactIntl';
import { createSlug } from '../../util/urlHelpers';

// import { AvatarMedium } from '../../components';
import { NamedLink } from '../../components';

import { formatCompactTimeAgo } from './JobListingCard.helpers';

import css from './JobListingCard.module.css';

/**
 * JobListingCard
 *
 * Compact row-style card for "jobs" listings: poster avatar on the left, and on the right a
 * single-line title, location, a 2-line clamped description, and a relative post time.
 * Rendered by ListingCard when the listing's listingType is "jobs".
 *
 * @component
 * @param {Object} props
 * @param {string?} props.className add more style rules in addition to component's own css.root
 * @param {string?} props.rootClassName overwrite component's own css.root
 * @param {Object} props.listing API entity: listing or ownListing
 * @param {Function?} props.setActiveListing
 * @returns {JSX.Element}
 */
export const JobListingCard = props => {
  const intl = props.intl || useIntl();
  const { className, rootClassName, listing, setActiveListing } = props;

  const classes = classNames(rootClassName || css.root, className);

  const id = listing?.id?.uuid;
  const { title = '', description = '', publicData, createdAt } = listing?.attributes || {};
  const slug = createSlug(title);
  const location = publicData?.location?.address;
  // const author = listing?.author;

  const timeAgo = createdAt ? formatCompactTimeAgo(createdAt, intl) : null;

  const setActivePropsMaybe = setActiveListing
    ? {
        onMouseEnter: () => setActiveListing(listing?.id),
        onMouseLeave: () => setActiveListing(null),
      }
    : null;

  return (
    <NamedLink
      className={classes}
      name="ListingPage"
      params={{ id, slug }}
      ariaLabel={title}
      {...setActivePropsMaybe}
    >
      {/* <AvatarMedium className={css.avatar} user={author} disableProfileLink /> */}
      <div className={css.content}>
        <div className={css.headerRow}>
          <div className={css.title}>{title}</div>
          {timeAgo ? <div className={css.timeAgo}>{timeAgo}</div> : null}
        </div>
        {location ? <div className={css.location}>{location}</div> : null}
        {description ? <div className={css.description}>{description}</div> : null}
      </div>
    </NamedLink>
  );
};

export default JobListingCard;
