export const TEST_CURRENT_TIME_RANGE = {
    start: 1582560900000,
    end: 1600620300000
};
export const TEST_PRIMARY_IV_DATA = {
    parameter: {
        parameterCode: '72019',
        name: 'Depth to water level'
    },
    values: {
        '90649': {
            points: [
                {value: 24.2, qualifiers: ['A'], dateTime: 1582560900000},
                {value: 24.1, qualifiers: ['A'], dateTime: 1582561800000},
                {value: null, qualifiers: ['A', 'ICE'], dateTime: 1582562700000},
                {value: null, qualifiers: ['A', 'ICE'], dateTime: 1582569900000},
                {value: 25.2, qualifiers: ['E'], dateTime: 1582570800000},
                {value: 25.4, qualifiers: ['E'], dateTime: 1600617600000},
                {value: 25.6, qualifiers: ['E'], dateTime: 1600618500000},
                {value: 26.5, qualifiers: ['P'], dateTime: 1600619400000},
                {value: 25.9, qualifiers: ['P'], dateTime: 1600620300000}
            ],
            method: {
                methodID: '90649'
            }
        }
    }
};

export const TEST_MEDIAN_DATA = {
        '153885': [
            {month_nu: 2, day_nu: 24, p50_va: 16, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 25, p50_va: 16.2, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 26, p50_va: 15.9, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 27, p50_va: 16.3, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'},
            {month_nu: 2, day_nu: 28, p50_va: 16.4, ts_id: '153885', loc_web_ds: 'Method1', begin_yr: '2011', end_yr: '2020'}
            ]
    };

export const TEST_GW_LEVELS = {
    parameter: {
        parameterCode: '72019',
        name: 'Depth to water level'
    },
    values: [
        {value: 27.2, qualifiers: ['P'], dateTime: 1582560900000},
        {value: 26.9, qualifiers: ['A'], dateTime: 1582562700000},
        {value: 26.1, qualifiers: ['A'], dateTime: 1582570800000},
        {value: 26.5, qualifiers: ['R'], dateTime: 1600619400000}
    ]
};

export const TEST_HYDROGRAPH_PARAMETERS = {
    '00060': {
        parameterCode: '00060',
        name: 'Streamflow, ft3/s',
        description: 'Discharge, cubic feet per second',
        unit: 'ft3/s',
        hasIVData: true
    },
    '00010': {
        parameterCode: '00010',
        name: 'Temperature, water, C',
        description: 'Temperature, water, degrees Celsius',
        unit: 'deg C',
        hasIVData: true
    },
    '00010F': {
        parameterCode: '00010F',
        name: 'Temperature, water, F',
        description: 'Temperature, water, degrees Fahrenheit',
        unit: 'deg F',
        hasIVData: true
    },
    '72019': {
        parameterCode: '72019',
        name: 'Depth to water level, ft below land surface',
        description: 'Depth to water level, feet below land surface',
        unit: 'ft',
        hasIVData: true,
        hasGWLevelsData: true
    },
    '62610': {
        parameterCode: '62610',
        name: 'Groundwater level above NGVD 1929, feet',
        description: 'Groundwater level above NGVD 1929, feet',
        unit: 'ft',
        hasGWLevelsData: true
    }
};
