const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const DAYS_BEFORE_FALLBACK_TO_DATE = 30;

/**
 * Compact relative time string for a job listing's post date, e.g. "2h ago", "3d ago".
 * Falls back to a formatted date once the listing is more than 30 days old.
 *
 * @param {Date} date - the listing's createdAt date
 * @param {Object} intl - React Intl instance
 * @param {Date} [now] - reference "now" (injectable for tests)
 * @returns {String} formatted relative time
 */
export const formatCompactTimeAgo = (date, intl, now = new Date()) => {
  const diffMs = Math.max(0, now.getTime() - date.getTime());

  if (diffMs < MINUTE_MS) {
    return intl.formatMessage({ id: 'JobListingCard.justNow' });
  }
  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return intl.formatMessage({ id: 'JobListingCard.minutesAgo' }, { minutes });
  }
  if (diffMs < DAY_MS) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return intl.formatMessage({ id: 'JobListingCard.hoursAgo' }, { hours });
  }
  const days = Math.floor(diffMs / DAY_MS);
  if (days < DAYS_BEFORE_FALLBACK_TO_DATE) {
    return intl.formatMessage({ id: 'JobListingCard.daysAgo' }, { days });
  }
  return intl.formatDate(date, { month: 'short', day: 'numeric', year: 'numeric' });
};
