/**
 * Export runtime configuration settings stored in the global CONFIG variable.
 */
export default {
    ...(window.CONFIG || {}),

    // These are the screen size breakpoints in the USWDS style sheet
    USWDS_SMALL_SCREEN: 481,
    USWDS_MEDIUM_SCREEN: 641,
    USWDS_LARGE_SCREEN:  1025,
    USWDS_SITE_MAX_WIDTH: 1024,

    // Indicate a NWIS 'variable' has been modified in the application, such as a conversion from Celsius to Fahrenheit
    CALCULATED_TEMPERATURE_VARIABLE_CODE: 'F',

    CELSIUS_TEMPERATURE_PARAMETERS: ['72329', '00010', '00020', '81029', '85583', '99229',
        '99230', '45589', '81027 ', '72176', '50011', '45587']
};
