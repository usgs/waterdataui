const { select } = require('d3-selection');

const { audibleUI } = require('./audible');

const { provide } = require('../../lib/redux');
const { Actions, configureStore } = require('../../store');


const TEST_STATE = {
    series: {
        timeSeries: {
            '00060:current': {
                startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                endTime: new Date('2018-01-02T15:00:00.000-06:00'),
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'current',
                variable: 45807197
            },
            '00060:compare': {
                startTime: new Date('2018-01-02T15:00:00.000-06:00'),
                endTime: new Date('2018-01-02T15:00:00.000-06:00'),
                points: [{
                    dateTime: new Date('2018-01-02T15:00:00.000-06:00'),
                    value: 10,
                    qualifiers: ['P']
                }],
                method: 'method1',
                tsKey: 'compare',
                variable: 45807197
            }
        },
        variables: {
            '45807197': {
                variableCode: '00060',
                oid: 45807197,
                unit: {
                    unitCode: 'unitCode'
                }
            }
        }
    },
    currentVariableID: '45807197',
    showSeries: {
        current: true,
        compare: true
    }
};


describe('Audible interface', () => {
    let container;
    beforeEach(() => {
        container = select('body').append('div');
        container
            .call(provide(configureStore(TEST_STATE)))
            .call(audibleUI);
    });

    afterEach(() => {
        container.remove();
    });
});
