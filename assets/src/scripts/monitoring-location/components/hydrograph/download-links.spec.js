import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {renderDownloadLinks} from 'ivhydrograph/download-links';


describe('monitoring-location/components/hydrograph/download-links', () => {

    describe('renderDownloadLinks', () => {
        let div;

        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when only current time series is showing', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
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
                    'currentIVVariableID': '45807042'
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

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&period=P7D&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when compare is selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
                        },
                        'compare:P7D': {
                            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=01646500&startDT=2019-11-14T23:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
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
                    'currentIVVariableID': '45807042'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(3);
                expect(div.selectAll('a').size()).toBe(4);
                const anchorSelection = div.selectAll('a');
                const anchorElements = anchorSelection.nodes();

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&period=P7D&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=01646500&startDT=2019-11-14T23:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when median is selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
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
                    'currentIVVariableID': '45807042'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(3);
                expect(div.selectAll('a').size()).toBe(4);
                const anchorSelection = div.selectAll('a');
                const anchorElements = anchorSelection.nodes();

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&period=P7D&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/stat/?format=rdb&sites=05370000&statReportType=daily&statTypeCd=median&parameterCd=00060');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when both median and compare are selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
                        },
                        'compare:P7D': {
                            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=01646500&startDT=2019-11-14T23:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': true,
                        'median': true
                    },
                    'currentIVDateRange': 'P7D',
                    'customIVTimeRange': null,
                    'currentIVVariableID': '45807042'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(4);
                expect(div.selectAll('a').size()).toBe(5);
                const anchorSelection = div.selectAll('a');
                const anchorElements = anchorSelection.nodes();

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&period=P7D&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=01646500&startDT=2019-11-14T23:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/stat/?format=rdb&sites=05370000&statReportType=daily&statTypeCd=median&parameterCd=00060');
                expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[4].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks if P30D is selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P30D:00060': {
                            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=01646500&startDT=2019-11-14T23:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=json'
                        },
                        'compare:P30D:00060': {
                            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=01646500&parameterCd=00060&startDT=2019-10-22T22:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': true,
                        'median': true
                    },
                    'currentIVDateRange': 'P30D',
                    'customIVTimeRange': null,
                    'currentIVVariableID': '45807042'
                }
            };
            let store = configureStore(TEST_STATE);
            const siteNumber = '05370000';
            div.call(renderDownloadLinks, store, siteNumber);
            window.requestAnimationFrame(() => {
                expect(div.selectAll('ul').size()).toBe(1);
                expect(div.selectAll('li').size()).toBe(4);
                expect(div.selectAll('a').size()).toBe(5);
                const anchorSelection = div.selectAll('a');
                const anchorElements = anchorSelection.nodes();

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=01646500&startDT=2019-11-14T23:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=rdb&parameterCd=00060');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=01646500&parameterCd=00060&startDT=2019-10-22T22:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=rdb');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/stat/?format=rdb&sites=05370000&statReportType=daily&statTypeCd=median&parameterCd=00060');
                expect(anchorElements[3].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[4].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when custom days are selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P3D:00060': {
                            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=01646500&parameterCd=00060&startDT=2019-10-22T22:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': false,
                        'median': false
                    },
                    'currentIVDateRange': 'P3D',
                    'customIVTimeRange': null,
                    'currentIVVariableID': '45807042'
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

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=01646500&parameterCd=00060&startDT=2019-10-22T22:18Z&endDT=2019-11-21T23:18Z&siteStatus=all&format=rdb');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when custom calendar dates are selected', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:custom:00060': {
                            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=01646500&parameterCd=00060&startDT=2020-11-01T04:00Z&endDT=2020-11-04T04:59Z&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
                        }
                    }
                },
                'ivTimeSeriesState': {
                    'showIVTimeSeries': {
                        'current': true,
                        'compare': false,
                        'median': false
                    },
                    'currentIVDateRange': 'custom',
                    'customIVTimeRange': {start: 1604203200000, end: 16044655999999},
                    'currentIVVariableID': '45807042'
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

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=01646500&parameterCd=00060&startDT=2020-11-01T04:00Z&endDT=2020-11-04T04:59Z&siteStatus=all&format=rdb');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });

        it('creates an unordered list and the correct number of list items and hyperlinks when a parameter other than 00060 is used', (done) => {
            const TEST_STATE = {
                'ivTimeSeriesData': {
                    'queryInfo': {
                        'current:P7D': {
                            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
                        }
                    }, 'variables': {
                        '45807042': {
                            'variableCode': {
                                'value': '00060'
                            }
                        },
                        '450807142': {
                            'variableCode': {
                                'value': '00010'
                            }
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
                    'currentIVVariableID': '450807142'
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

                expect(anchorElements[0].getAttribute('href')).toBe('https://fakeserviceroot.com/iv/?sites=05370000&period=P7D&siteStatus=all&format=rdb&parameterCd=00010');
                expect(anchorElements[1].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteStatus=all');
                expect(anchorElements[2].getAttribute('href')).toBe('https://fakeserviceroot.com/site/?format=rdb&sites=05370000&siteOutput=expanded&siteStatus=all');

                done();
            });
        });
    });
});
