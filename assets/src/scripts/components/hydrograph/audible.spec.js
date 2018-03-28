const { select } = require('d3-selection');

const { audibleUI } = require('./audible');

const { provide } = require('../../lib/redux');

const { configureStore } = require('../../store');


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
    },
    playId: null
};


describe('audibleUI', () => {
    let container;
    let store;
    beforeEach(() => {
        store = configureStore(TEST_STATE);
        jasmine.clock().install();
        container = select('body').append('div');
        container
            .call(provide(store))
            .call(audibleUI);
    });

    afterEach(() => {
        container.remove();
        jasmine.clock().uninstall();
    });

    it('renders expected audible UI', () => {
        expect(container.selectAll('button').size()).toBe(2);
        expect(container.selectAll('button[title="Play"]').size()).toBe(1);
        expect(container.selectAll('button[title="Stop"]').size()).toBe(1);
    });

    it('Expects the store to have a playId if the Play button is clicked', () => {
        container.select('button[title="Play"]').dispatch('click');

        expect(store.getState().playId).not.toBeNull();
    });

    it('Expects the store to have a null playId if the Stop button is clicked after clicking the Play button', () => {
        container.select('button[title="Play"]').dispatch('click');
        container.select('button[title="Stop"]').dispatch('click');

        expect(store.getState().playId).toBeNull();
    });




});
