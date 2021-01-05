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
        '99230', '45589', '81027 ', '72176', '50011', '45587'],

    ALL_TEMPERATURE_PARAMETERS: ['00010', '00020', '85583', '99229', '99230', '45589', '81027',
        '72176 ', '50011', '45587'],

    WATER_ALERT_PARAMETER_CODES: ['00060', '00055', '72321', '00062', '00065', '62610', '62614',
        '62615', '62616','62617', '62619', '62620', '63160', '72020','00095', '62611', '72019', '72020',
        '72147', '72150', '72192', '72322', '72255','72279', '00010', '00011', '00095', '00300', '00400',
        '00480', '63680', '72213', '99133','31720', '31721', '31722', '31723', '31724', '31725', '31726',
        '31727', '31728', '31729','32319','32321', '00045', '99064', '99067']
};
