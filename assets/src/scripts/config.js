/**
 * Export runtime configuration settings stored in the global CONFIG variable.
 */
module.exports = window.CONFIG || {};

// These are the screen size breakpoints in the USWDS style sheet
window.CONFIG.USWDS_SMALL_SCREEN = 481;
window.CONFIG.USWDS_MEDIUM_SCREEN = 600;
