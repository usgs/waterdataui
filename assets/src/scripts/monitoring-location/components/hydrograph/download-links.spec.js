import {createHrefForDownloadLinks} from 'ivhydrograph/download-links';

describe('createHrefForDownloadOfCompareData', () => {
    const queryInformation = {
        'current:P7D': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&&period=P7D&siteStatus=all&format=json'
        },
        'compare:P7D': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2019-11-10T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        },
        'current:custom:00060': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2020-11-01T05:00Z&endDT=2020-11-03T05:59Z&siteStatus=all&format=json'
        },
        'current:P30D:00060': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2020-10-18T18:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=json'
        },
        'compare:P30D:00060': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2019-10-18T18:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        },
        'current:P1Y:00060': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=json'
        },
        'compare:P1Y:00060': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        },
        'current:P1Y:00065': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=json'
        },
        'compare:P1Y:00065': {
            'queryURL': 'http://nwis.waterservices.usgs.gov/nwis/iv/sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=json'
        }
    };

    it('will convert a NWIS URL to one compatible with WaterServices download if the period is 7 days', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P7D';
        expect(createHrefForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&&period=P7D&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download  if the period is 30 days', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P30D';
        expect(createHrefForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2020-10-18T18:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P1Y';
        expect(createHrefForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year and parameter code is 00065', () => {
        const parameterCode = '00065';
        const currentIVDateRange = 'P1Y';
        expect(createHrefForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'current'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&parameterCd=00060&startDT=2019-11-17T19:33Z&endDT=2020-11-17T19:33Z&siteStatus=all&format=rdb');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year, parameter code is 00065, and type is compare', () => {
        const parameterCode = '00065';
        const currentIVDateRange = 'P1Y';
        expect(createHrefForDownloadLinks(currentIVDateRange, queryInformation, parameterCode, 'compare'))
            .toEqual('https://fakeserviceroot.com/iv/?sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=rdb');
    });
});
