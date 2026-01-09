/**
 * Application-wide constants
 */

/**
 * Minimum GitHub stars required to show the "full" stats presentation.
 * Below this threshold, the UI optimizes for early-stage optics:
 * - Progress bars are hidden
 * - Metrics are reordered (downloads first)
 * - Correlation analysis is hidden
 *
 * Once stars >= this value, the full Sequoia framework presentation is shown.
 */
export const STARS_VISIBILITY_THRESHOLD = 10
