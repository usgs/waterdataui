import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {renderDownloadLinks, createUrlForDownloadLinks} from 'ivhydrograph/download-links';


describe('monitoring-location/components/hydrograph/download-links', () => {

    describe('renderDownloadLinks', () => {
        const TEST_STATE = {
            'ivTimeSeriesData': {
                'queryInfo': {
                    'current:P7D': {
                        'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=01646500&period=P7D&siteStatus=all&format=json',
                        'criteria': {
                            'locationParam': '[ALL:01646500]',
                            'variableParam': 'ALL',
                            'parameter': []
                        },
                        'notes': {
                            'filter:sites': '[ALL:01646500]',
                            'filter:timeRange': {
                                'mode': 'PERIOD',
                                'periodDays': '7',
                                'modifiedSince': null
                            },
                            'filter:methodId': 'methodIds=[ALL]',
                            'requestDT': 1605963921124,
                            'requestId': '35e94330-2bfa-11eb-8c63-2cea7f5e5ede',
                            'disclaimer': 'Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.',
                            'server': 'sdas01'
                        }
                    }
                },
                'siteCodes': {
                    '01646500': {
                        'value': '01646500',
                        'network': 'NWIS',
                        'agencyCode': 'USGS'
                    }
                },
            },
            'ivTimeSeriesState': {
                'showIVTimeSeries': {
                    'current': true,
                    'compare': false,
                    'median': false
                },
                'currentIVDateRange': 'P7D',
                'customIVTimeRange': null,
                'currentIVVariableID': '45807197',
                'ivGraphCursorOffset': null,
                'audiblePlayId': null,
                'loadingIVTSKeys': [
                    'compare:P7D'
                ],
                'ivGraphBrushOffset': null,
                'userInputsForTimeRange': {
                    'mainTimeRangeSelectionButton': 'P7D',
                    'customTimeRangeSelectionButton': 'days-input',
                    'numberOfDaysFieldValue': ''
                },
                'currentIVMethodID': 69928
            }
        };

        let div;
        beforeEach(() => {
            div = select('body').append('div');
        });

        afterEach(() => {
            div.remove();
        });

        it('Creates the download links ', (done) => {
            let store = configureStore(TEST_STATE);
            div.call(renderDownloadLinks, store);
            window.requestAnimationFrame(() => {

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
