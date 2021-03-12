import {select} from 'd3-selection';

import config from 'ui/config';
import {configureStore} from 'ml/store';
import {drawDownloadLinks} from 'ivhydrograph/download-links';


describe('monitoring-location/components/hydrograph/download-links', () => {
    config.SERVICE_ROOT = 'https://fakeserviceroot.com';
    config.PAST_SERVICE_ROOT = 'https://fakeserviceroot-more-than-120-days.com';
    config.GROUNDWATER_LEVELS_ENDPOINT = 'https://fakegroundwater.org/gw/';
    config.ivPeriodOfRecord = {
        '00060': {
            begin_date: '2000-01-01',
            end_date: '2020-01-01'
        },
        '00010': {
            begin_date: '2000-01-01',
            end_date: '2020-01-01'
        }
    };
    config.gwPeriodOfRecord = {
        '72019': {
            begin_date: '2000-01-01',
            end_date: '2020-01-01'
        }
    };
    config.locationTimeZone = 'America/Chicago';

    const TEST_STATE_BASE = {
        'hydrographData': {
            'currentTimeRange': {
                'start': 1614272067139,
                'end': 1614876867139
            },
            'prioryearTimeRange': {
                'start': 1582736067139,
                'end':  1583340867139
            },
            'medianStatisticsData': {
            },
            'primaryIVData': {
                'parameter': {},
                'values':{'69928': {'points': [{},{}]}}
            },
            'compareIVData': {}
        },
        'hydrographState': {
            'showCompareIVData': false,
            'showMedianData': false,
            'selectedDateRange': 'P7D',
            'selectedParameterCode': '00060'
        }
    };

    describe('drawDownloadLinks', () => {
        let div;

        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when only current time series is showing', () => {
            let store = configureStore(TEST_STATE_BASE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(2);
                    expect(div.selectAll('a').size()).toBe(3);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-25T10:54:27.139-06:00&endDT=2021-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when compare is selected', () => {
            const TEST_STATE = {
                'hydrographData': {
                    ...TEST_STATE_BASE.hydrographData,
                    'compareIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    ...TEST_STATE_BASE.hydrographState,
                    'showCompareIVData': true
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(3);
                    expect(div.selectAll('a').size()).toBe(4);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-25T10:54:27.139-06:00&endDT=2021-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot-more-than-120-days.com/iv/?sites=05370000&parameterCd=00060&startDT=2020-02-26T10:54:27.139-06:00&endDT=2020-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when median is selected', () => {
            const TEST_STATE = {
                'hydrographData': {
                    ...TEST_STATE_BASE.hydrographData,
                    'medianStatisticsData': {
                        '69928': [{}]
                    },
                    'compareIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    ...TEST_STATE_BASE.hydrographState,
                    'showCompareIVData': false,
                    'showMedianData': true
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(3);
                    expect(div.selectAll('a').size()).toBe(4);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-25T10:54:27.139-06:00&endDT=2021-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/stat/?sites=05370000&statReportType=daily&statTypeCd=median&parameterCd=00060&format=rdb');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when both median and compare are selected', () => {
            const TEST_STATE = {
                'hydrographData': {
                    ...TEST_STATE_BASE.hydrographData,
                    'prioryearTimeRange': {
                        'start': 1582736067139,
                        'end':  1583340867139
                    },
                    'medianStatisticsData': {
                        '69928': [{}]
                    },

                    'compareIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    ...TEST_STATE_BASE.hydrographState,
                    'showCompareIVData': true,
                    'showMedianData': true
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(4);
                    expect(div.selectAll('a').size()).toBe(5);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-25T10:54:27.139-06:00&endDT=2021-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot-more-than-120-days.com/iv/?sites=05370000&parameterCd=00060&startDT=2020-02-26T10:54:27.139-06:00&endDT=2020-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/stat/?sites=05370000&statReportType=daily&statTypeCd=median&parameterCd=00060&format=rdb');
                    expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[4].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks if P30D is selected', () => {
            const TEST_STATE = {
                'hydrographData': {
                    ...TEST_STATE_BASE.hydrographData,
                    'medianStatisticsData': {
                        '69928': [{}]
                    },
                    'compareIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    'showCompareIVData': true,
                    'showMedianData': true,
                    'selectedDateRange': 'P30D',
                    'selectedParameterCode': '00060'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(4);
                    expect(div.selectAll('a').size()).toBe(5);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-25T10:54:27.139-06:00&endDT=2021-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot-more-than-120-days.com/iv/?sites=05370000&parameterCd=00060&startDT=2020-02-26T10:54:27.139-06:00&endDT=2020-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/stat/?sites=05370000&statReportType=daily&statTypeCd=median&parameterCd=00060&format=rdb');
                    expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[4].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when custom days are selected', () => {
            const TEST_STATE = {
                'hydrographData': {
                ...TEST_STATE_BASE.hydrographData
                },
                'hydrographState': {
                    ...TEST_STATE_BASE.hydrographState,
                    'selectedDateRange': 'P14D'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(2);
                    expect(div.selectAll('a').size()).toBe(3);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-25T10:54:27.139-06:00&endDT=2021-03-04T10:54:27.139-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when custom calendar dates are selected', () => {
            const TEST_STATE = {
                'hydrographData': {
                    'currentTimeRange': {
                        'start': 1614574800000,
                        'end': 1614920399999
                    },
                    'primaryIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    'selectedDateRange': 'custom',
                    'selectedCustomDateRange': {
                        'start': '2021-03-01',
                        'end': '2021-03-04'
                    },
                    'selectedParameterCode': '00060'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(2);
                    expect(div.selectAll('a').size()).toBe(3);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2021-02-28T23:00:00.000-06:00&endDT=2021-03-04T22:59:59.999-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when a parameter other than 00060 is used', () => {
            const TEST_STATE = {
                'hydrographData': {
                    'currentTimeRange': {
                        'start': 1614574800000,
                        'end': 1614920399999
                    },
                    'primaryIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    'selectedDateRange': 'custom',
                    'selectedCustomDateRange': {
                        'start': '2021-03-01',
                        'end': '2021-03-04'
                    },
                    'selectedParameterCode': '00010'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(2);
                    expect(div.selectAll('a').size()).toBe(3);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00010&startDT=2021-02-28T23:00:00.000-06:00&endDT=2021-03-04T22:59:59.999-06:00&siteStatus=all&format=rdb');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });

        it('Renders the correct links when only groundwater data is available', () => {
            const TEST_STATE = {
                'hydrographData': {
                    'currentTimeRange': {
                        'start': 1583340809223,
                        'end': 1614876809223
                    },
                    'groundwaterLevels': {
                        'parameter': {},
                        'values': [{'value': 300}]
                    },
                    'primaryIVData': {
                        'parameter': {},
                        'values':{'69928': {'points': [{},{}]}}
                    }
                },
                'hydrographState': {
                    'selectedDateRange': 'P365D',
                    'selectedParameterCode': '72019'
                }
            };

            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(drawDownloadLinks, store, siteNumber);
            return new Promise(resolve => {
                window.requestAnimationFrame(() => {
                    expect(div.selectAll('ul').size()).toBe(1);
                    expect(div.selectAll('li').size()).toBe(2);
                    expect(div.selectAll('a').size()).toBe(3);
                    const anchorSelection = div.selectAll('a');
                    const anchorElements = anchorSelection.nodes();

                    expect(anchorElements[0].getAttribute('href')).toContain('https://fakegroundwater.org/gw/?sites=05370000&parameterCd=72019');
                    expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                    expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                    resolve();
                });
            });
        });
    });
});
