let proxyquire = require('proxyquireify')(require);

const { isLeapYear, mergeMedianTimeseries, parseRDB } = require('./models');


describe('Models module', () => {

    describe('getTimeSeries function', () => {
        let ajaxMock;
        let models;

        const paramCode = '00060';
        const siteID = '05413500';


        beforeEach(() => {
            /* eslint no-use-before-define: 0 */
            let getPromise = Promise.resolve(MOCK_DATA);

            ajaxMock = {
                get: function() {
                    return getPromise;
                }
            };
            spyOn(ajaxMock, 'get').and.callThrough();
            models = proxyquire('./models', {'./ajax': ajaxMock});
        });

        it('Get url includes paramCds and sites', () => {
            models.getTimeseries({sites: [siteID], params: [paramCode]});
            expect(ajaxMock.get).toHaveBeenCalled();
            let ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).toContain('sites=' + siteID);
            expect(ajaxUrl).toContain('parameterCd=' + paramCode);

            models.getTimeseries({sites: [siteID, '12345678'], params: [paramCode, '00080']});
            ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).toContain('sites=' + siteID + ',12345678');
            expect(ajaxUrl).toContain('parameterCd=' + paramCode + ',00080');
        });

        it('Get url includes has the default time period if startDate and endDate are null', () => {
            models.getTimeseries({sites: [siteID], params: [paramCode]});
            let ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).toContain('period=P7D');
            expect(ajaxUrl).not.toContain('startDT');
            expect(ajaxUrl).not.toContain('endDT');
        });

        it('Get url includes startDT and endDT when startDate and endDate are non-null', () =>{
            const startDate = new Date('2018-01-02T15:00:00.000-06:00');
            const endDate = new Date('2018-01-02T16:45:00.000-06:00');
            models.getTimeseries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            let ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).not.toContain('period=P7D');
            expect(ajaxUrl).toContain('startDT=2018-01-02T21:00');
            expect(ajaxUrl).toContain('endDT=2018-01-02T22:45');
        });

        it('Uses current data service root if data requested is less than 120 days old', () => {
            models.getTimeseries({sites: [siteID], params: [paramCode]});
            expect(ajaxMock.get.calls.mostRecent().args[0]).toContain('https://waterservices.usgs.gov/nwis');

            const startDate = new Date() - 110;
            const endDate = new Date() - 10;
            models.getTimeseries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            expect(ajaxMock.get.calls.mostRecent().args[0]).toContain('https://waterservices.usgs.gov/nwis');
        });

        it('Uses nwis data service root if data requested is more than 120 days old', () => {
            const startDate = new Date() - 121;
            const endDate = new Date() - 10;
            models.getTimeseries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            expect(ajaxMock.get.calls.mostRecent().args[0]).toContain('https://nwis.waterservices.usgs.gov/nwis');
        });
    });

    describe('getPreviousYearTimeseries', () => {
        let ajaxMock;
        let models;

        const siteID = '05413500';

        const startDate = new Date('2018-01-02T15:00:00.000-06:00');
        const endDate = new Date('2018-01-02T16:45:00.000-06:00');

        beforeEach(() => {
            /* eslint no-use-before-define: 0 */
            let getPromise = Promise.resolve(MOCK_LAST_YEAR_DATA);

            ajaxMock = {
                get: function() {
                    return getPromise;
                }
            };
            spyOn(ajaxMock, 'get').and.callThrough();
            models = proxyquire('./models', {'./ajax': ajaxMock});
        });

        it('Retrieves data using the startDT and endDT parameters', () => {
            models.getPreviousYearTimeseries({site: siteID, startTime: startDate, endTime: endDate});
            expect(ajaxMock.get).toHaveBeenCalled();
            const ajaxArg = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxArg).toContain('startDT=2017-01-02T21:00');
            expect(ajaxArg).toContain('endDT=2017-01-02T22:45');
        });

        it('Parses valid data', () => {
            models.getPreviousYearTimeseries({site: siteID, startTime: startDate, endTime: endDate}).then((series) => {
                // This returns the JSON version of the mocked response, so
                // just do a sanity check on an attribute.
                expect(series.name).toBe('ns1:timeSeriesResponseType');
            });
        });
    });

    describe('parseRDB', () => {
        it('parseRDB successfully parses RDB content', () => {
           let result = parseRDB(MOCK_RDB);
           expect(result.length).toEqual(13);
           expect(Object.keys(result[0])).toEqual(['agency_cd', 'site_no', 'parameter_cd', 'ts_id', 'loc_web_ds', 'month_nu',
               'day_nu', 'begin_yr', 'end_yr', 'count_nu', 'p50_va']);
        });

        it('parseRDB handles no data', () => {
           let result = parseRDB(MOCK_RDB_NO_DATA);
           expect(result.length).toEqual(0);
        });

        it('parseRDB handles no headers', () => {
           let result = parseRDB('#Some Stuff');
           expect(result.length).toEqual(0);
        });
    });

    describe('parseMedianTimeseries', () => {

        const startDate = new Date(2018, 0, 10);
        const endDate = new Date(2018, 0, 13);
        const leapStartDate = new Date(2016, 0, 10);
        const leapEndDate = new Date(2016, 2, 14);

        it('parseMedian data successfully constructs data for plotting', () => {
            const collection = mergeMedianTimeseries({}, MOCK_MEDIAN_DATA, startDate, endDate, MOCK_MEDIAN_VARIABLES);
            expect(collection).toEqual({
                timeSeries: {
                    '00060:153885:median': {
                        points: [{
                            dateTime: new Date(2017, 7, 5),
                            value: 15
                        }, {
                            dateTime: new Date(2018, 0, 1),
                            value: 16
                        }, {
                            dateTime: new Date(2018, 0, 13),
                            value: 15
                        }],
                        startTime: new Date(2018, 0, 10),
                        endTime: new Date(2018, 0, 13),
                        tsKey: 'median',
                        method: '00060:153885:median',
                        variable: 'varID',
                        metadata: {
                            'beginYear': '1969',
                            'endYear': '2017'
                        }
                    }
                },
                timeSeriesCollections: {
                    '05370000:00060:median': {
                        sourceInfo: '05370000',
                        variable: 'varID',
                        name: '05370000:00060:median',
                        timeSeries: [
                            '00060:153885:median'
                        ]
                    }
                },
                methods: {
                    '00060:153885:median': {
                        methodDescription: '',
                        methodID: '00060:153885:median'
                    }
                },
                requests: {
                    median: {
                        timeSeriesCollections: ['05370000:00060:median']
                    }
                }
            });
        });

        it('parseMedian data includes leap year when appropriate', () => {
            const collection = mergeMedianTimeseries({}, MOCK_MEDIAN_DATA, leapStartDate, leapEndDate, MOCK_MEDIAN_VARIABLES);
            expect(collection).toEqual({
                timeSeries: {
                    '00060:153885:median': {
                        points: [{
                            dateTime: new Date(2015, 7, 5),
                            value: 15
                        }, {
                            dateTime: new Date(2016, 0, 1),
                            value: 16
                        }, {
                            dateTime: new Date(2016, 0, 13),
                            value: 15
                        }, {
                            dateTime: new Date(2016, 1, 29),
                            value: 13
                        }],
                        startTime: new Date(2016, 0, 10),
                        endTime: new Date(2016, 2, 14),
                        tsKey: 'median',
                        method: '00060:153885:median',
                        variable: 'varID',
                        metadata: {
                            'beginYear': '1969',
                            'endYear': '2017'
                        }
                    }
                },
                timeSeriesCollections: {
                    '05370000:00060:median': {
                        sourceInfo: '05370000',
                        variable: 'varID',
                        name: '05370000:00060:median',
                        timeSeries: [
                            '00060:153885:median'
                        ]
                    }
                },
                methods: {
                    '00060:153885:median': {
                        methodDescription: '',
                        methodID: '00060:153885:median'
                    }
                },
                requests: {
                    median: {
                        timeSeriesCollections: ['05370000:00060:median']
                    }
                }
            });
        });
    });

    describe('getSiteStatistics', () => {
        let ajaxMock;
        let models;

        const sites = ['05370000'];
        const statType = 'median';
        const params = ['00060'];

        beforeEach(() => {
            let getPromise = Promise.resolve(MOCK_RDB);

            ajaxMock = {
                get: function() {
                    return getPromise;
                }
            };
            spyOn(ajaxMock, 'get').and.callThrough();
            models = proxyquire('./models', {'./ajax': ajaxMock});
        });

        it('Gets a full year of statistical data', () => {
            models.getSiteStatistics({sites: sites, statType: statType, params: params});
            expect(ajaxMock.get).toHaveBeenCalled();
            let ajaxUrl = ajaxMock.get.calls.mostRecent().args[0];
            expect(ajaxUrl).toContain('statTypeCd=median');
            expect(ajaxUrl).toContain('parameterCd=00060');
            expect(ajaxUrl).toContain('sites=05370000');
        });
    });

    describe('isLeapYear', () => {

        it('Correctly identifies a century leap year', () => {
            expect(isLeapYear(2000)).toBeTruthy();
        });

        it('Correctly identifies a non-century leap year', () => {
            expect(isLeapYear(2008)).toBeTruthy();
        });

        it('Correctly identifies a non-leap year', () => {
            expect(isLeapYear(2003)).toBeFalsy();
        });

        it('Correctly identifies 1900 as a non-leap year', () => {
            expect(isLeapYear(1900)).toBeFalsy();
        });
    });
});

const MOCK_LAST_YEAR_DATA = `
{"name" : "ns1:timeSeriesResponseType",
"declaredType" : "org.cuahsi.waterml.TimeSeriesResponseType",
"scope" : "javax.xml.bind.JAXBElement$GlobalScope",
"value" : {
  "queryInfo" : {
    "queryURL" : "http://waterservices.usgs.gov/nwis/iv/sites=05413500&parameterCd=00060&period=P7D&indent=on&siteStatus=all&format=json",
    "criteria" : {
      "locationParam" : "[ALL:05413500]",
      "variableParam" : "[00060]",
      "parameter" : [ ]
    },
    "note" : [ {
      "value" : "[ALL:05413500]",
      "title" : "filter:sites"
    }, {
      "value" : "[mode=PERIOD, period=P7D, modifiedSince=null]",
      "title" : "filter:timeRange"
    }, {
      "value" : "methodIds=[ALL]",
      "title" : "filter:methodId"
    }, {
      "value" : "2017-01-09T20:46:07.542Z",
      "title" : "requestDT"
    }, {
      "value" : "1df59e50-f57e-11e7-8ba8-6cae8b663fb6",
      "title" : "requestId"
    }, {
      "value" : "Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.",
      "title" : "disclaimer"
    }, {
      "value" : "vaas01",
      "title" : "server"
    } ]
  },
  "timeSeries" : [ {
    "sourceInfo" : {
      "siteName" : "GRANT RIVER AT BURTON, WI",
      "siteCode" : [ {
        "value" : "05413500",
        "network" : "NWIS",
        "agencyCode" : "USGS"
      } ],
      "timeZoneInfo" : {
        "defaultTimeZone" : {
          "zoneOffset" : "-06:00",
          "zoneAbbreviation" : "CST"
        },
        "daylightSavingsTimeZone" : {
          "zoneOffset" : "-05:00",
          "zoneAbbreviation" : "CDT"
        },
        "siteUsesDaylightSavingsTime" : true
      },
      "geoLocation" : {
        "geogLocation" : {
          "srs" : "EPSG:4326",
          "latitude" : 42.72027778,
          "longitude" : -90.8191667
        },
        "localSiteXY" : [ ]
      },
      "note" : [ ],
      "siteType" : [ ],
      "siteProperty" : [ {
        "value" : "ST",
        "name" : "siteTypeCd"
      }, {
        "value" : "07060003",
        "name" : "hucCd"
      }, {
        "value" : "55",
        "name" : "stateCd"
      }, {
        "value" : "55043",
        "name" : "countyCd"
      } ]
    },
    "variable" : {
      "variableCode" : [ {
        "value" : "00060",
        "network" : "NWIS",
        "vocabulary" : "NWIS:UnitValues",
        "variableID" : 45807197,
        "default" : true
      } ],
      "variableName" : "Streamflow, ft&#179;/s",
      "variableDescription" : "Discharge, cubic feet per second",
      "valueType" : "Derived Value",
      "unit" : {
        "unitCode" : "ft3/s"
      },
      "options" : {
        "option" : [ {
          "name" : "Statistic",
          "optionCode" : "00000"
        } ]
      },
      "note" : [ ],
      "noDataValue" : -999999.0,
      "variableProperty" : [ ],
      "oid" : "45807197"
    },
    "values" : [ {
      "value" : [ {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:00:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:15:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:30:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T15:45:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:00:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:15:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:30:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2017-01-02T16:45:00.000-06:00"
      }],
      "qualifier" : [ {
        "qualifierCode" : "P",
        "qualifierDescription" : "Provisional data subject to revision.",
        "qualifierID" : 0,
        "network" : "NWIS",
        "vocabulary" : "uv_rmk_cd"
      } ],
      "qualityControlLevel" : [ ],
      "method" : [ {
        "methodDescription" : "",
        "methodID" : 158049
      } ],
      "source" : [ ],
      "offset" : [ ],
      "sample" : [ ],
      "censorCode" : [ ]
    } ],
    "name" : "USGS:05413500:00060:00000"
  } ]
},
"nil" : false,
"globalScope" : true,
"typeSubstituted" : false
}`
;

const MOCK_DATA = `
{"name" : "ns1:timeSeriesResponseType",
"declaredType" : "org.cuahsi.waterml.TimeSeriesResponseType",
"scope" : "javax.xml.bind.JAXBElement$GlobalScope",
"value" : {
  "queryInfo" : {
    "queryURL" : "http://waterservices.usgs.gov/nwis/iv/sites=05413500&parameterCd=00060&period=P7D&indent=on&siteStatus=all&format=json",
    "criteria" : {
      "locationParam" : "[ALL:05413500]",
      "variableParam" : "[00060]",
      "parameter" : [ ]
    },
    "note" : [ {
      "value" : "[ALL:05413500]",
      "title" : "filter:sites"
    }, {
      "value" : "[mode=PERIOD, period=P7D, modifiedSince=null]",
      "title" : "filter:timeRange"
    }, {
      "value" : "methodIds=[ALL]",
      "title" : "filter:methodId"
    }, {
      "value" : "2018-01-09T20:46:07.542Z",
      "title" : "requestDT"
    }, {
      "value" : "1df59e50-f57e-11e7-8ba8-6cae8b663fb6",
      "title" : "requestId"
    }, {
      "value" : "Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.",
      "title" : "disclaimer"
    }, {
      "value" : "vaas01",
      "title" : "server"
    } ]
  },
  "timeSeries" : [ {
    "sourceInfo" : {
      "siteName" : "GRANT RIVER AT BURTON, WI",
      "siteCode" : [ {
        "value" : "05413500",
        "network" : "NWIS",
        "agencyCode" : "USGS"
      } ],
      "timeZoneInfo" : {
        "defaultTimeZone" : {
          "zoneOffset" : "-06:00",
          "zoneAbbreviation" : "CST"
        },
        "daylightSavingsTimeZone" : {
          "zoneOffset" : "-05:00",
          "zoneAbbreviation" : "CDT"
        },
        "siteUsesDaylightSavingsTime" : true
      },
      "geoLocation" : {
        "geogLocation" : {
          "srs" : "EPSG:4326",
          "latitude" : 42.72027778,
          "longitude" : -90.8191667
        },
        "localSiteXY" : [ ]
      },
      "note" : [ ],
      "siteType" : [ ],
      "siteProperty" : [ {
        "value" : "ST",
        "name" : "siteTypeCd"
      }, {
        "value" : "07060003",
        "name" : "hucCd"
      }, {
        "value" : "55",
        "name" : "stateCd"
      }, {
        "value" : "55043",
        "name" : "countyCd"
      } ]
    },
    "variable" : {
      "variableCode" : [ {
        "value" : "00060",
        "network" : "NWIS",
        "vocabulary" : "NWIS:UnitValues",
        "variableID" : 45807197,
        "default" : true
      } ],
      "variableName" : "Streamflow, ft&#179;/s",
      "variableDescription" : "Discharge, cubic feet per second",
      "valueType" : "Derived Value",
      "unit" : {
        "unitCode" : "ft3/s"
      },
      "options" : {
        "option" : [ {
          "name" : "Statistic",
          "optionCode" : "00000"
        } ]
      },
      "note" : [ ],
      "noDataValue" : -999999.0,
      "variableProperty" : [ ],
      "oid" : "45807197"
    },
    "values" : [ {
      "value" : [ {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:00:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:15:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:30:00.000-06:00"
      }, {
        "value" : "301",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T15:45:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:00:00.000-06:00"
      }, {
        "value" : "302",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:15:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:30:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T16:45:00.000-06:00"
      }, {
        "value" : "299",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:00:00.000-06:00"
      }, {
        "value" : "300",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:15:00.000-06:00"
      }, {
        "value" : "299",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:30:00.000-06:00"
      }, {
        "value" : "297",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T17:45:00.000-06:00"
      }, {
        "value" : "297",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:00:00.000-06:00"
      }, {
        "value" : "296",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:15:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:30:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T18:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T19:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T20:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:30:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T21:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:00:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:30:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T22:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-02T23:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T00:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:30:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T01:45:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T02:45:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:00:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:15:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:30:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T03:45:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:15:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:30:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T04:45:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T05:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T06:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T07:45:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:15:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T08:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T09:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T10:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:00:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:30:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T11:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T12:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:15:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T13:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:15:00.000-06:00"
      }, {
        "value" : "296",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T14:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:30:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T15:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T16:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:15:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T17:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T18:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:30:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T19:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:30:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T20:45:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:15:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:30:00.000-06:00"
      }, {
        "value" : "285",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T21:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:00:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:15:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:30:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T22:45:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:00:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:15:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:30:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-03T23:45:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:00:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:15:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T00:45:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:00:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:15:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:30:00.000-06:00"
      }, {
        "value" : "283",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T01:45:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:00:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T02:45:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T03:45:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:15:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:30:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T04:45:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:00:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:15:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T05:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:00:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T06:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T07:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:00:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:15:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:30:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T08:45:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:00:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:15:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:30:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T09:45:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:30:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T10:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T11:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:15:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T12:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:15:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T13:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:00:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T14:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:00:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T15:45:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:00:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:30:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T16:45:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:00:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:15:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:30:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T17:45:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:15:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:30:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T18:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T19:45:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:00:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:15:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:30:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T20:45:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:00:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T21:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:00:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:30:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T22:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:30:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-04T23:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:15:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T00:45:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T01:45:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:00:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T02:45:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:15:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:30:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T03:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:15:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T04:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:15:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T05:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:00:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:30:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T06:45:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:00:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:15:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T07:45:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:00:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:30:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T08:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:30:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T09:45:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:15:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T10:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T11:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:00:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:15:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:30:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T12:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:00:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:15:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:30:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T13:45:00.000-06:00"
      }, {
        "value" : "264",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:00:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:15:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:30:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T14:45:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:30:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T15:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:00:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T16:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T17:45:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T18:45:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:15:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:30:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T19:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:00:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:15:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T20:45:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:00:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:15:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:30:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T21:45:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:00:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:30:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T22:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:30:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-05T23:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:30:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T00:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:00:00.000-06:00"
      }, {
        "value" : "246",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:15:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T01:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:00:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T02:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:15:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T03:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:00:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:30:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T04:45:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:00:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:15:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:30:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T05:45:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:00:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T06:45:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T07:45:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:00:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:30:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T08:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T09:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:30:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T10:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T11:45:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T12:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:15:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T13:45:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:15:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:30:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T14:45:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:00:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:15:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:30:00.000-06:00"
      }, {
        "value" : "259",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T15:45:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:00:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:15:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:30:00.000-06:00"
      }, {
        "value" : "257",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T16:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:15:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T17:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:00:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:15:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T18:45:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:00:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:15:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:30:00.000-06:00"
      }, {
        "value" : "254",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T19:45:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:00:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:15:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:30:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T20:45:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:00:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:15:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:30:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T21:45:00.000-06:00"
      }, {
        "value" : "251",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:00:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:30:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T22:45:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:00:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:15:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:30:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-06T23:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:00:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T00:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:00:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:30:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T01:45:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:00:00.000-06:00"
      }, {
        "value" : "246",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:15:00.000-06:00"
      }, {
        "value" : "247",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:30:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T02:45:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:00:00.000-06:00"
      }, {
        "value" : "248",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:15:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:30:00.000-06:00"
      }, {
        "value" : "249",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T03:45:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:00:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:15:00.000-06:00"
      }, {
        "value" : "250",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:30:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T04:45:00.000-06:00"
      }, {
        "value" : "252",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:00:00.000-06:00"
      }, {
        "value" : "253",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:15:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:30:00.000-06:00"
      }, {
        "value" : "255",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T05:45:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:00:00.000-06:00"
      }, {
        "value" : "256",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:15:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:30:00.000-06:00"
      }, {
        "value" : "258",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T06:45:00.000-06:00"
      }, {
        "value" : "260",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:00:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:15:00.000-06:00"
      }, {
        "value" : "261",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:30:00.000-06:00"
      }, {
        "value" : "262",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T07:45:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:00:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:15:00.000-06:00"
      }, {
        "value" : "263",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:30:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T08:45:00.000-06:00"
      }, {
        "value" : "265",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:00:00.000-06:00"
      }, {
        "value" : "266",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:15:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:30:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T09:45:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:00:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:15:00.000-06:00"
      }, {
        "value" : "267",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:30:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T10:45:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:00:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:15:00.000-06:00"
      }, {
        "value" : "268",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:30:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T11:45:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:00:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:15:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T12:45:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:00:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:30:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T13:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:00:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:15:00.000-06:00"
      }, {
        "value" : "269",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T14:45:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:00:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:15:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T15:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:00:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:15:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:30:00.000-06:00"
      }, {
        "value" : "270",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T16:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:15:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:30:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T17:45:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:15:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:30:00.000-06:00"
      }, {
        "value" : "271",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T18:45:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:00:00.000-06:00"
      }, {
        "value" : "272",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T19:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:15:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:30:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T20:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:00:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:15:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:30:00.000-06:00"
      }, {
        "value" : "274",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T21:45:00.000-06:00"
      }, {
        "value" : "273",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:00:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:15:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:30:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T22:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:00:00.000-06:00"
      }, {
        "value" : "275",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:15:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:30:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-07T23:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:00:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:15:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T00:45:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:00:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T01:45:00.000-06:00"
      }, {
        "value" : "276",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T02:45:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:15:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:30:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T03:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:00:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:15:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T04:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:00:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:15:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T05:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:00:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:15:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T06:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:00:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:15:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:30:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T07:45:00.000-06:00"
      }, {
        "value" : "278",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:00:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:15:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:30:00.000-06:00"
      }, {
        "value" : "277",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T08:45:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:00:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:15:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:30:00.000-06:00"
      }, {
        "value" : "279",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T09:45:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:00:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:15:00.000-06:00"
      }, {
        "value" : "280",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:30:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T10:45:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:30:00.000-06:00"
      }, {
        "value" : "281",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T11:45:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:00:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:15:00.000-06:00"
      }, {
        "value" : "282",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:30:00.000-06:00"
      }, {
        "value" : "284",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T12:45:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:00:00.000-06:00"
      }, {
        "value" : "286",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T13:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T14:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T15:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T16:45:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T17:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T18:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T19:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:30:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T20:45:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:15:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:30:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T21:45:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:15:00.000-06:00"
      }, {
        "value" : "295",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T22:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:00:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:15:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:30:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-08T23:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T00:45:00.000-06:00"
      }, {
        "value" : "294",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:15:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T01:45:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:00:00.000-06:00"
      }, {
        "value" : "293",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T02:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:30:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T03:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T04:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:30:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T05:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:00:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T06:45:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T07:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:00:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T08:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:00:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T09:45:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:15:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:30:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T10:45:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:00:00.000-06:00"
      }, {
        "value" : "287",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:15:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:30:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T11:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:00:00.000-06:00"
      }, {
        "value" : "288",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:15:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:30:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T12:45:00.000-06:00"
      }, {
        "value" : "289",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:00:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:15:00.000-06:00"
      }, {
        "value" : "291",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:30:00.000-06:00"
      }, {
        "value" : "290",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T13:45:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T14:00:00.000-06:00"
      }, {
        "value" : "292",
        "qualifiers" : [ "P" ],
        "dateTime" : "2018-01-09T14:15:00.000-06:00"
      } ],
      "qualifier" : [ {
        "qualifierCode" : "P",
        "qualifierDescription" : "Provisional data subject to revision.",
        "qualifierID" : 0,
        "network" : "NWIS",
        "vocabulary" : "uv_rmk_cd"
      } ],
      "qualityControlLevel" : [ ],
      "method" : [ {
        "methodDescription" : "",
        "methodID" : 158049
      } ],
      "source" : [ ],
      "offset" : [ ],
      "sample" : [ ],
      "censorCode" : [ ]
    } ],
    "name" : "USGS:05413500:00060:00000"
  } ]
},
"nil" : false,
"globalScope" : true,
"typeSubstituted" : false
}
`;


const MOCK_RDB = `#
#
# US Geological Survey, Water Resources Data
# retrieved: 2018-01-25 16:05:49 -05:00	(natwebsdas01)
#
# This file contains USGS Daily Statistics
#
# Note:The statistics generated are based on approved daily-mean data and may not match those published by the USGS in official publications.
# The user is responsible for assessment and use of statistics from this site.
# For more details on why the statistics may not match, visit http://help.waterdata.usgs.gov/faq/about-statistics.
#
# Data heading explanations.
# agency_cd       -- agency code
# site_no         -- Site identification number
# parameter_cd    -- Parameter code
# station_nm      -- Site name
# loc_web_ds      -- Additional measurement description
#
# Data for the following 1 site(s) are contained in this file
# agency_cd   site_no      parameter_cd   station_nm (loc_web_ds)
# USGS        05370000     00060          EAU GALLE RIVER AT SPRING VALLEY, WI
#
# Explanation of Parameter Codes
# parameter_cd	Parameter Name
# 00060         Discharge, cubic feet per second
#
# Data heading explanations.
# month_nu    ... The month for which the statistics apply.
# day_nu      ... The day for which the statistics apply.
# begin_yr    ... First water year of data of daily mean values for this day.
# end_yr      ... Last water year of data of daily mean values for this day.
# count_nu    ... Number of values used in the calculation.
# p50_va      ... 50 percentile (median) of daily mean values for this day.
#
agency_cd	site_no	parameter_cd	ts_id	loc_web_ds	month_nu	day_nu	begin_yr	end_yr	count_nu	p50_va
5s	15s	5s	10n	15s	3n	3n	6n	6n	8n	12s
USGS	05370000	00060	153885		1	1	1969	2017	49	16
USGS	05370000	00060	153885		1	2	1969	2017	49	16
USGS	05370000	00060	153885		1	3	1969	2017	49	16
USGS	05370000	00060	153885		1	4	1969	2017	49	15
USGS	05370000	00060	153885		1	5	1969	2017	49	15
USGS	05370000	00060	153885		1	6	1969	2017	49	15
USGS	05370000	00060	153885		1	7	1969	2017	49	15
USGS	05370000	00060	153885		1	8	1969	2017	49	15
USGS	05370000	00060	153885		1	9	1969	2017	49	15
USGS	05370000	00060	153885		1	10	1969	2017	49	15
USGS	05370000	00060	153885		1	11	1969	2017	49	15
USGS	05370000	00060	153885		1	12	1969	2017	49	15
USGS	05370000	00060	153885		1	13	1969	2017	49	15
`;

const MOCK_RDB_NO_DATA = `#
#
# US Geological Survey, Water Resources Data
# retrieved: 2018-01-25 16:05:49 -05:00	(natwebsdas01)
#
# This file contains USGS Daily Statistics
#
# Note:The statistics generated are based on approved daily-mean data and may not match those published by the USGS in official publications.
# The user is responsible for assessment and use of statistics from this site.
# For more details on why the statistics may not match, visit http://help.waterdata.usgs.gov/faq/about-statistics.
#
# Data heading explanations.
# agency_cd       -- agency code
# site_no         -- Site identification number
# parameter_cd    -- Parameter code
# station_nm      -- Site name
# loc_web_ds      -- Additional measurement description
#
# Data for the following 1 site(s) are contained in this file
# agency_cd   site_no      parameter_cd   station_nm (loc_web_ds)
# USGS        05370000     00060          EAU GALLE RIVER AT SPRING VALLEY, WI
#
# Explanation of Parameter Codes
# parameter_cd	Parameter Name
# 00060         Discharge, cubic feet per second
#
# Data heading explanations.
# month_nu    ... The month for which the statistics apply.
# day_nu      ... The day for which the statistics apply.
# begin_yr    ... First water year of data of daily mean values for this day.
# end_yr      ... Last water year of data of daily mean values for this day.
# count_nu    ... Number of values used in the calculation.
# p50_va      ... 50 percentile (median) of daily mean values for this day.
#
agency_cd	site_no	parameter_cd	ts_id	loc_web_ds	month_nu	day_nu	begin_yr	end_yr	count_nu	p50_va
`;

const MOCK_MEDIAN_DATA = [
    {agency_cd: 'USGS', site_no: '05370000', parameter_cd: '00060', ts_id: '153885', loc_web_ds: '', month_nu: '1', day_nu: '1', begin_yr: '1969', end_yr: '2017', count_nu: '49', p50_va: '16'},
    {agency_cd: 'USGS', site_no: '05370000', parameter_cd: '00060', ts_id: '153885', loc_web_ds: '', month_nu: '1', day_nu: '13', begin_yr: '1969', end_yr: '2017', count_nu: '49', p50_va: '15'},
    {agency_cd: 'USGS', site_no: '05370000', parameter_cd: '00060', ts_id: '153885', loc_web_ds: '', month_nu: '8', day_nu: '5', begin_yr: '1969', end_yr: '2017', count_nu: '49', p50_va: '15'},
    {agency_cd: 'USGS', site_no: '05370000', parameter_cd: '00060', ts_id: '153885', loc_web_ds: '', month_nu: '2', day_nu: '29', begin_yr: '1969', end_yr: '2017', count_nu: '49', p50_va: '13'}
];
const MOCK_MEDIAN_VARIABLES = {
    '00060': {
        oid: 'varID'
    }
};
