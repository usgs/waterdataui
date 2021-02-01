import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {drawDataTables} from './data-table';

const TEST_DATA = {
    ivTimeSeriesData: {
        queryInfo: {
            'current:custom:72019': {
                'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json',
                notes: {
                    'filter:timeRange': {
                        mode: 'RANGE',
                        interval: {start: 1520351200000, end: 1520353700000}
                    }
                }
            }
        },
        methods: {
            69928: {
                methodDescription: '',
                methodID: 69928
            },
            69929: {
                methodDescription: '',
                methodID: 69929
            }
        },
        timeSeries: {
            '69928:00060': {
                tsKey: 'current:P7D',
                startTime: new Date('2018-03-06T15:45:00.000Z'),
                endTime: new Date('2018-03-13t13:45:00.000Z'),
                variable: '45807197',
                method: 69928,
                points: [{
                    value: 10,
                    qualifiers: ['P'],
                    dateTime: 1520351100000
                }, {
                    value: null,
                    qualifiers: ['P', 'ICE'],
                    dateTime: 1520352000000
                }, {
                    value: null,
                    qualifiers: ['P', 'FLD'],
                    dateTime: 1520352900000
                }]
            },
            '69929:00010': {
                tsKey: 'compare:P7D',
                variable: '45807196',
                method: 69929,
                points: [{
                    value: 1,
                    qualifiers: ['P'],
                    dateTime: 1488815100000
                }, {
                    value: 2,
                    qualifiers: ['P'],
                    dateTime: 1488816000000
                }, {
                    value: 3,
                    qualifiers: ['P'],
                    dateTime: 1488816900000
                }]
            },
            '69930:00045': {
                tsKey: 'current:P7D',

                variable: '45807140',
                method: 69930,
                points: [{
                    value: 0,
                    qualifiers: ['P'],
                    dateTime: 1520351100000
                }, {
                    value: 0.01,
                    qualifiers: ['P'],
                    dateTime: 1520352000000
                }, {
                    value: 0.02,
                    qualifiers: ['P'],
                    dateTime: 1520352900000
                }, {
                    value: 0.03,
                    qualifiers: ['P'],
                    dateTime: 1520353800000
                }]
            }
        },
        variables: {
            '45807197': {
                variableCode: {value: '00060'},
                variableName: 'Streamflow',
                variableDescription: 'Discharge, cubic feet per second',
                oid: '45807197'
            },
            '45807196': {
                variableCode: {value: '00010'},
                variableName: 'Gage Height',
                variableDescription: 'Gage Height in feet',
                oid: '45807196'
            },
            '45807140': {
                variableCode: {value: '00045'},
                variableName: 'Precipitation',
                variableDescription: 'Precipitation in inches'
            },
            '45807141' : {
                variableCode: {value: '72019'},
                variableName: 'Depth to water level',
                variableDescription: 'Dept to water level in feet'
            }
        }
    },
    ivTimeSeriesState: {
        currentIVVariableID: '45807197',
        currentIVDateRange: 'P7D',
        currentIVMethodID: 69928
    },
    discreteData: {
        groundwaterLevels: {
            '45807141': {
                variable: {
                    variableCode: {value: '72019'},
                    variableName: 'Depth to water level',
                    variableDescription: 'Dept to water level in feet'
                },
                values: [{
                    value: '0',
                    qualifiers: [],
                    dateTime: 1520351100000
                }, {
                    value: '0.01',
                    qualifiers: [],
                    dateTime: 1520352000000
                }, {
                    value: '0.02',
                    qualifiers: [],
                    dateTime: 1520352900000
                }, {
                    value: '0.03',
                    qualifiers: [],
                    dateTime: 1520353800000
                }]
            }
        }
    }
};

describe('monitoring-location/components/hydrograph/data-table', () => {
    let testDiv;
    let store;

    beforeEach(() => {
        testDiv = select('body').append('div');
    });

    afterEach(() => {
        testDiv.remove();
    });

    it('table with expected data', () => {
        store = configureStore(TEST_DATA);

        drawDataTables(testDiv, store);
        expect(testDiv.selectAll('table').size()).toBe(1);
        expect(testDiv.select('#iv-table-container').select('caption').text()).toEqual('Instantaneous value data');
        expect(testDiv.select('tbody').selectAll('tr').size()).toBe(3);
    });

    it('Expect that changing the variable changes the expected data table', () => {
        const testData = {
            ...TEST_DATA,
            ivTimeSeriesState: {
                ...TEST_DATA.ivTimeSeriesState,
                currentIVVariableID: '45807141',
                currentIVDateRange: 'custom',
                customIVTimeRange: {
                    start: 1520351200000,
                    end: 1520353700000
                }
            }
        };
        store = configureStore(testData);

        drawDataTables(testDiv, store);
        expect(testDiv.selectAll('table').size()).toBe(1);
        expect(testDiv.select('#gw-table-container').select('caption').text()).toEqual('Field visit data');
        expect(testDiv.select('tbody').selectAll('tr').size()).toBe(2);
    });
});