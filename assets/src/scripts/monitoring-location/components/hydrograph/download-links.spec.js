import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {renderDownloadLinks, createUrlForDownloadLinks} from 'ivhydrograph/download-links';


describe('monitoring-location/components/hydrograph/download-links', () => {

    describe('renderDownloadLinks', () => {
        let div;

        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        fit('creates an unordered list and the correct number of list items when only current time series is showing', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': false,
                        'median': false
                    },
                    'currentIVDateRange': 'P7D',
                    'customIVTimeRange': null,
                    'currentIVVariableID': '45807197'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(2);
                expect(div.selectAll('a').size()).toBe(3);
                const anchorSelection = div.selectAll('a');
                const anchorElements = anchorSelection.nodes();

                expect(anchorElements[0].getAttribute('href')).toBe('wrong');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items when compare is selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=01646500&period=P7D&siteStatus=all&format=json'
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': true,
                        'median': false
                    },
                    'currentIVDateRange': 'P7D',
                    'customIVTimeRange': null,
                    'currentIVVariableID': '45807197'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(3);
                expect(div.selectAll('a').size()).toBe(4);
                done();
            });
        });


        it('creates an unordered list and the correct number of list items when median is selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=01646500&period=P7D&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            variableCode: {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            variableCode: {
                                'value': '00010'
                            }
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': false,
                        'median': true
                    },
                    'currentIVDateRange': 'P7D',
                    'customIVTimeRange': null,
                    'currentIVVariableID': '45807197'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(3);
                expect(div.selectAll('a').size()).toBe(4);
                done();
            });
        });
    });
});





describe('createHrefForDownloadOfCompareData', () => {
    const queryInformation = {
        'current:P7D': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
        },
        'compare:P7D': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2019-11-10T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        },
        'current:custom:00060': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2020-11-01T05:00Z&endDT=2020-11-03T05:59Z&siteStatus=all&format=json'
        },
        'current:P30D:00060': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2020-10-18T18:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=json'
        },
        'compare:P30D:00060': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2019-10-18T18:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        },
        'current:P1Y:00060': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=json'
        },
        'compare:P1Y:00060': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        },
        'current:P1Y:00065': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=json'
        },
        'compare:P1Y:00065': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        }
    };

    it('will convert a NWIS URL to one compatible with WaterServices download if the period is 7 days (and will add correct parameter code)', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P7D';
        expect(createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&period=P7D&siteStatus=all&format=rdb&parameterCd=00060');
    });
    it('will convert a NWIS URL one compatible with WaterServices download  if the period is 30 days', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P30D';
        expect(createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2020-10-18T18:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P1Y';
        expect(createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year and parameter code is 00065', () => {
        const parameterCode = '00065';
        const currentIVDateRange = 'P1Y';
        expect(createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year, parameter code is 00065, and type is compare', () => {
        const parameterCode = '00065';
        const currentIVDateRange = 'P1Y';
        expect(createUrlForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'compare'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=rdb&parameterCd=00065');
    });
});
