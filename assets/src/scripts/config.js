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

    // Indicates the number digits that we allow users to enter when selecting a custom 'days before today' time span.
    MAX_DIGITS_FOR_DAYS_FROM_TODAY: 5,

    // Indicate a NWIS 'variable' has been modified in the application, such as a conversion from Celsius to Fahrenheit
    CALCULATED_TEMPERATURE_VARIABLE_CODE: 'F',

    TEMPERATURE_PARAMETERS: {
        celsius: [
            '00010',
            '00020',
            '45587',
            '45589',
            '50011',
            '72176',
            '72282',
            '72283',
            '72329',
            '81027',
            '81029',
            '85583',
            '99229',
            '99230'
        ],
        fahrenheit: [
            '00011',
            '00021',
            '45590'
        ]
    },

    // Below is a listing of the known temperature codes and counterparts
    // '00020': '00021' - air temperature C:F
    // '00010': '00011' - water temperature C:F
    // '45589': '45590' - Temperature, internal, within equipment shelter C:F
    CELSIUS_CODES_WITH_FAHRENHEIT_COUNTERPARTS: ['00020', '00010', '45589'],

    WATER_ALERT_PARAMETER_CODES: [
        '00060',
        '00055',
        '72321',
        '00062',
        '00065',
        '62610',
        '62614',
        '62615',
        '62616',
        '62617',
        '62619',
        '62620',
        '63160',
        '72020',
        '00095',
        '62611',
        '72019',
        '72020',
        '72147',
        '72150',
        '72192',
        '72322',
        '72255',
        '72279',
        '00010',
        '00011',
        '00095',
        '00300',
        '00400',
        '00480',
        '63680',
        '72213',
        '99133',
        '31720',
        '31721',
        '31722',
        '31723',
        '31724',
        '31725',
        '31726',
        '31727',
        '31728',
        '31729',
        '32319',
        '32321',
        '00045',
        '99064',
        '99067']
};

