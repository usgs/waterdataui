/**
 * Export runtime configuration settings stored in the global CONFIG variable.
 */
export default {
    ...(window.CONFIG || {}),

    // These are the screen size breakpoints in the USWDS style sheet
    USWDS_SMALL_SCREEN: 481,
    USWDS_MEDIUM_SCREEN: 600,
    USWDS_LARGE_SCREEN:  1201,
    USWDS_SITE_MAX_WIDTH: 1040
};
