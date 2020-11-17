import {convertTimeToDate, createStationDataDownloadURLForWaterServices, createHrefForDownloadOfCompareData} from 'ivhydrograph/download-links';


describe('convertTimeToDate', () => {
    it('convert numerical time indicator to a calendar date', () => {
        const customTimeRange = {
            'start': 1604206800000,
            'end': 1604383199999
        };
        const ianaTimeZone = 'America/Chicago';
        expect(convertTimeToDate(customTimeRange, ianaTimeZone)).toEqual({start: '2020-11-01', end: '2020-11-02'});

    });
});

describe('createStationDataDownloadURLForWaterServices', () => {
    it('will return a URL compatible with WaterService station download for the timespan P1Y', () => {
        const currentIVDateRange = 'P1Y';
        const customTimeRange = null;
        const ianaTimeZone = 'America/Chicago';
        const parameterCode = '00060';
        const siteno = '05370000';
    expect(createStationDataDownloadURLForWaterServices(currentIVDateRange, customTimeRange, ianaTimeZone, parameterCode, siteno))
        .toBe('https://fakewaterservices.usgs.gov/nwis/iv/?format=rdb&sites=05370000&period=P1Y&parameterCd=00060&siteStatus=all');

    });
    it('will return a URL compatible with WaterService station download a custom timespan with dates', () => {
        const currentIVDateRange = 'custom';
        const customTimeRange = {
            'start': 1604206800000,
            'end': 1605074399999
        };
        const ianaTimeZone = 'America/Chicago';
        const parameterCode = '00060';
        const siteno = '05413500';
        expect(createStationDataDownloadURLForWaterServices(currentIVDateRange, customTimeRange, ianaTimeZone, parameterCode, siteno))
            .toBe('https://fakewaterservices.usgs.gov/nwis/iv/?format=rdb&sites=05413500&startDT=2020-11-01&endDT=2020-11-10&parameterCd=00060&siteStatus=all');
    });
});

describe('createHrefForDownloadOfCompareData', () => {
    const queryInformation = {
        'current:P7D': {
            'queryURL': 'http://waterservices.usgs.gov/nwis/iv/sites=05370000&period=P7D&siteStatus=all&format=json'
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
        }
    };

    it('will convert a NWIS URL to one compatible with WaterServices download if the period is 7 days', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P7D';
        expect(createHrefForDownloadOfCompareData(currentIVDateRange, queryInformation, parameterCode))
            .toEqual('https://fakewaterservices.usgs.gov/nwis/iv/?sites=05370000&startDT=2019-11-10T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=rdb&parameterCd=00060');
    });
    it('will convert a NWIS URL one compatible with WaterServices download  if the period is 30 days', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P30D';
        expect(createHrefForDownloadOfCompareData(currentIVDateRange, queryInformation, parameterCode))
            .toEqual('https://fakewaterservices.usgs.gov/nwis/iv/?sites=05370000&startDT=2019-10-18T18:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=rdb&parameterCd=00060');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year', () => {
        const parameterCode = '00060';
        const currentIVDateRange = 'P1Y';
        expect(createHrefForDownloadOfCompareData(currentIVDateRange, queryInformation, parameterCode))
            .toEqual('https://fakewaterservices.usgs.gov/nwis/iv/?sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=rdb&parameterCd=00060');
    });
    it('will convert a NWIS URL one compatible with WaterServices download if the period is 1 year and parameter code is 00065', () => {
        const parameterCode = '00065';
        const currentIVDateRange = 'P1Y';
        expect(createHrefForDownloadOfCompareData(currentIVDateRange, queryInformation, parameterCode))
            .toEqual('https://fakewaterservices.usgs.gov/nwis/iv/?sites=05370000&startDT=2018-11-17T19:33Z&endDT=2019-11-17T19:33Z&siteStatus=all&format=rdb&parameterCd=00065');
    });
});
