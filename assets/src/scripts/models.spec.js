import { getPreviousYearTimeSeries, getTimeSeries, sortedParameters } from './models';


describe('Models module', () => {
    /* eslint no-use-before-define: 0 */

    beforeEach(() => {
        jasmine.Ajax.install();
    });

    afterEach(() => {
        jasmine.Ajax.uninstall();
    });

    describe('getTimeSeries function', () => {

        const paramCode = '00060';
        const siteID = '05413500';

        it('Get url includes paramCds and sites', () => {
            getTimeSeries({sites: [siteID], params: [paramCode]});
            let request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: MOCK_DATA,
                contentType: 'application/json'
            });
            expect(request.url).toContain('sites=' + siteID);
            expect(request.url).toContain('parameterCd=' + paramCode);

            getTimeSeries({sites: [siteID, '12345678'], params: [paramCode, '00080']});
            request = jasmine.Ajax.requests.mostRecent();
            request.respondWith({
                status: 200,
                responseText: MOCK_DATA,
                contentType: 'application/json'
            });
            expect(request.url).toContain('sites=' + siteID + ',12345678');
            expect(request.url).toContain('parameterCd=' + paramCode + ',00080');
        });

        it('Get url includes has the default time period if startDate and endDate are null', () => {
            getTimeSeries({sites: [siteID], params: [paramCode]});
            const request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toContain('period=P7D');
            expect(request.url).not.toContain('startDT');
            expect(request.url).not.toContain('endDT');
        });

        it('Get url includes startDT and endDT when startDate and endDate are non-null', () =>{
            const startDate = new Date('2018-01-02T15:00:00.000-06:00');
            const endDate = new Date('2018-01-02T16:45:00.000-06:00');
            getTimeSeries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            const request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).not.toContain('period=P7D');
            expect(request.url).toContain('startDT=2018-01-02T21:00');
            expect(request.url).toContain('endDT=2018-01-02T22:45');
        });

        it('Uses current data service root if data requested is less than 120 days old', () => {
            getTimeSeries({sites: [siteID], params: [paramCode]});
            let request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toContain('https://waterservices.usgs.gov/nwis');

            const startDate = new Date() - 110;
            const endDate = new Date() - 10;
            getTimeSeries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toContain('https://waterservices.usgs.gov/nwis');
        });

        it('Uses nwis data service root if data requested is more than 120 days old', () => {
            const startDate = new Date() - 121;
            const endDate = new Date() - 10;
            getTimeSeries({sites: [siteID], params: [paramCode], startDate: startDate, endDate: endDate});
            let request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toContain('https://nwis.waterservices.usgs.gov/nwis');
        });
    });

    describe('getPreviousYearTimeSeries', () => {
        const siteID = '05413500';

        const startDate = new Date('2018-01-02T15:00:00.000-06:00');
        const endDate = new Date('2018-01-02T16:45:00.000-06:00');

        it('Retrieves data using the startDT and endDT parameters', () => {
            getPreviousYearTimeSeries({site: siteID, startTime: startDate, endTime: endDate});
            let request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toContain('startDT=2017-01-02T21:00');
            expect(request.url).toContain('endDT=2017-01-02T22:45');
        });

        it('Parses valid data', () => {
            getPreviousYearTimeSeries({site: siteID, startTime: startDate, endTime: endDate}).then((series) => {
                // This returns the JSON version of the mocked response, so
                // just do a sanity check on an attribute.
                expect(series.name).toBe('ns1:timeSeriesResponseType');
            });
        });
    });

    describe('sortedParameters', () => {

        const testVars = {
            20214: {
                oid: '20214',
                variableCode: {'value': '00065', variableID: 20214},
                variableDescription: 'Gage Height, meters',
                variableName: 'Gage Height, m'
            },
            1701: {
                oid: '1701',
                variableCode: {value: '91102', variableID: 1701},
                variableDescription: 'Mass, cobalt(II) chloride, kilogram',
                variableName: 'Mass, cobalt(II) chloride, kg'
            },
            501: {
                oid: '501',
                variableCode: {value: '20018', variableID: 501},
                variableDescription: 'Volume, bromine, liter',
                variableName: 'Volume, bromine, L'
            },
            17778: {
                oid: '17778',
                variableCode: {value: '72019', variableID: 17778},
                variableDescription: 'Depth to water level, meters below land surface',
                variableName: 'Depth to water level, m'
            },
            42: {
                oid: '42',
                variableCode: {value: '83452', variableID: 42},
                variableDescription: 'Cross-sectional area, millibarn',
                variableName: 'Cross-sectional area, mb'
            },
            88450: {
                oid: '88450',
                variableCode: {value: '00060', variableID: 88450},
                variableDescription: 'Discharge, cubic meters per second',
                variableName: 'Discharge, m3/s'
            }
        };

        it('sorts a group of parameters', () => {
            expect(sortedParameters(testVars).map(x => x.oid)).toEqual(['88450', '20214', '17778', '42', '1701', '501']);
        });

        it('handles the case where variables are empty', () => {
            expect(sortedParameters({}).length).toEqual(0);
        });

        it('handles the case where variables are undefined', () => {
            expect(sortedParameters(undefined).length).toEqual(0);
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
