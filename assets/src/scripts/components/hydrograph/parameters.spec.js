const { availableTimeseriesSelector } = require('./parameters');


describe('Parameters module', () => {
    it('availableTimeseriesSelector sets attributes correctly', () => {
        const available = availableTimeseriesSelector({
            series: {
                timeSeries: {
                    'current:00060': {description: '00060', tsKey: 'current', variable: 'code0'},
                    'current:00061': {description: '00061', tsKey: 'current', variable: 'code1'},
                    'current:00062': {description: '00062', tsKey: 'current', variable: 'code2'},
                    'compare:00061': {description: '00061', tsKey: 'compare', variable: 'code1'},
                    'compare:00062': {description: '00062', tsKey: 'compare', variable: 'code2'},
                    'compare:00063': {description: '00063', tsKey: 'compare', variable: 'code3'}
                },
                variables: {
                    'code0': {
                        oid: 'code0',
                        variableDescription: 'code0 desc',
                        variableCode: {
                            value: '00060'
                        }
                    },
                    'code1': {
                        oid: 'code1',
                        variableDescription: 'code1 desc',
                        variableCode: {
                            value: '00061'
                        }
                    },
                    'code2': {
                        oid: 'code2',
                        variableDescription: 'code2 desc',
                        variableCode: {
                            value: '00062'
                        }
                    },
                    'code3': {
                        oid: 'code3',
                        variableDescription: 'code3 desc',
                        variableCode: {
                            value: '00063'
                        }
                    }
                }
            },
            currentVariableID: 'code0'
        });
        // Series are ordered by parameter code and have expected values.
        expect(available).toEqual([
            ['00060', {variableID: 'code0', description: 'code0 desc', selected: true, currentYear: 1, previousYear: 0, medianData: 0}],
            ['00061', {variableID: 'code1', description: 'code1 desc', selected: false, currentYear: 1, previousYear: 1, medianData: 0}],
            ['00062', {variableID: 'code2', description: 'code2 desc', selected: false, currentYear: 1, previousYear: 1, medianData: 0}],
            ['00063', {variableID: 'code3', description: 'code3 desc', selected: false, currentYear: 0, previousYear: 1, medianData: 0}]
        ]);
    });
});
