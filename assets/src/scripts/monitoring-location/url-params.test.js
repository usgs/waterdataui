import {configureStore} from 'ml/store';
import {setSelectedTimeSpan} from './store/hydrograph-state';
import {getParamString, renderTimeSeriesUrlParams} from 'ml/url-params';

describe('monitoring-location/url-params module', () => {

    describe('getParamString', () => {
        it('should return empty string if no hash', () => {
            window.location.hash = '';

            expect(getParamString()).toEqual('');
        });

        it('should return string minus the leading #', () => {
            window.location.hash = '#parm1=one&parm2=two';

            expect(getParamString()).toEqual('parm1=one&parm2=two');
        });
    });

    describe('renderTimeSeriesUrlParams', () => {
        const TEST_STATE = {
            hydrographData: {
                primaryIVData: {
                    values: {
                        '69928': {
                            method: {
                                methodID: '69928'
                            }
                        }
                    }
                }
            },
            hydrographState: {
                showCompareIVData: false,
                selectedParameterCode: '00010',
                selectedTimeSpan: 'P7D',
                selectedIVMethodID: '69928'
            }
        };
        it('adds nothing to the window.location.hash when the store is empty', () => {
            let store = configureStore({
                hydrographState: {}
            });
            renderTimeSeriesUrlParams(store);
            expect(window.location.hash).toEqual('');
        });

        it('adds parameter code if current variable is set in store', () => {
            let store = configureStore(TEST_STATE);
            renderTimeSeriesUrlParams(store);
            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).toContain('period');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).not.toContain('timeSeriesId');
        });

        it('adds compare if compare is in the store', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    showCompareIVData: true
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).toContain('compare=true');
            expect(window.location.hash).toContain('period');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).not.toContain('timeSeriesId');
        });

        it('adds period if current date range is P30D or P365D', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    selectedTimeSpan: 'P30D'
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).toContain('period=P30D');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).not.toContain('timeSeriesId');

            store.dispatch(setSelectedTimeSpan('P20D'));
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(window.location.hash).toContain('period=P20D');
                    resolve();
                });
            });
        });

        it('Contains startDT and endDT in url if time span is a date range in store', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographState: {
                    ...TEST_STATE.hydrographState,
                    selectedTimeSpan:  {
                        'start': '2020-03-01',
                        'end': '2020-03-15'
                    }
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).not.toContain('period');
            expect(window.location.hash).toContain('startDT=2020-03-01');
            expect(window.location.hash).toContain('endDT=2020-03-15');
            expect(window.location.hash).not.toContain('timeSeriesId');
        });

        it('expects timeSeriesId to be set if selectedMethodId is not null and there are multiple methods', () => {
            let store = configureStore({
                ...TEST_STATE,
                hydrographData: {
                    ...TEST_STATE.hydrographData,
                    primaryIVData: {
                        ...TEST_STATE.hydrographData.primaryIVData,
                        values: {
                            ...TEST_STATE.hydrographData.primaryIVData.values,
                            '69929': {
                                method: {
                                    methodID: '69929'
                                }
                            }
                        }
                    }
                }
            });
            renderTimeSeriesUrlParams(store);

            expect(window.location.hash).toContain('parameterCode=00010');
            expect(window.location.hash).not.toContain('compare=true');
            expect(window.location.hash).toContain('period');
            expect(window.location.hash).not.toContain('startDT');
            expect(window.location.hash).not.toContain('endDT');
            expect(window.location.hash).toContain('timeSeriesId=69928');
        });
    });
});