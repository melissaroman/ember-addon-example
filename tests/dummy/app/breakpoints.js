/**
 * Breakpoint threshold measurements in pixels.
 */
const THRESHOLDS = {
  mobile: 414,
  tablet: 768,
  desktop: 1023,
  largeDesktop: 1440
};

/**
 * Breakpoint mapping
 *
 *  - In rendered markup, these are converted to dasherized element classes
 *    and prefaced with "media-".
 *  - In interpolated HTMLBars contexts, these are prefaced with "is",
 *    camelized, and available on the `media` object
 *      - for example, "{{#if media.isMobile}}"
 */
export default {
  mobile: `(max-width: ${THRESHOLDS.mobile}px)`,
  tablet: `(min-width: ${THRESHOLDS.mobile + 1}px) and (max-width: ${THRESHOLDS.tablet}px)`,
  desktop: `(min-width: ${THRESHOLDS.tablet + 1}px) and (max-width: ${THRESHOLDS.desktop}px)`,
  largeDesktop: `(min-width: ${THRESHOLDS.desktop + 1}px)`,  // AKA "monitor"

  // more-meta semantic helpers
  greaterThanMobile: `(min-width: ${THRESHOLDS.mobile + 1}px)`,
  greaterThanTablet: `(min-width: ${THRESHOLDS.tablet + 1}px)`,
  greaterThanDesktop: `(min-width: ${THRESHOLDS.desktop + 1}px)`,
  greaterThanLargeDesktop: `(min-width: ${THRESHOLDS.largeDesktop + 1}px)`,

  lessThanTablet: `(max-width: ${THRESHOLDS.tablet}px)`,
  lessThanDesktop: `(max-width: ${THRESHOLDS.tablet}px)`,
  lessThanLargeDesktop: `(max-width: ${THRESHOLDS.desktop}px)`
};
