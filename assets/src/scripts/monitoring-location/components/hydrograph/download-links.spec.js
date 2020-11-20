import {select} from 'd3-selection';

import {configureStore} from 'ml/store';

import {renderDownloadLinks, createUrlForDownloadLinks} from 'ivhydrograph/download-links';


describe('monitoring-location/components/hydrograph/download-links', () => {

    describe('renderDownloadLinks', () => {
        const TEST_STATE = {
            ivTimeSeriesData: {
                timeSeries: {
                    '69930:00010:current': {
                        points: DATA,
                        tsKey: 'current:P7D',
                        variable: '00010id',
                        method: 69930
                    },
                    '69931:00010:current': {
                        points: DATA,
                        tsKey: 'current:P7D',
                        variable: '00010id',
                        method: 69931
                    }
                },
                variables: {
                    '00010id': {
                        oid: '00010id',
                        variableCode: {
                            value: '00010'
                        },
                        unit: {
                            unitCode: 'deg C'
                        }
                    }
                },
                methods: {
                    69930: {
                        methodDescription: 'Description 1',
                        methodID: 69930
                    },
                    69931: {
                        methodDescription: 'Description 2',
                        methodID: 69931
                    }
                }
            },
            ivTimeSeriesState: {
                currentIVVariableID: '00010id'
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
