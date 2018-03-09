const { normalize } = require('./schema');


describe('Normalizr schema', () => {
    it('works', () => {
        /* eslint no-use-before-define: 0 */
        const data = normalize(JSON.parse(MOCK_DATA), 'current');
        expect(data.queryInfo).toEqual({
            'current': {
                queryURL: 'http://waterservices.usgs.gov/nwis/iv/sites=05413500&parameterCd=00060&period=P7D&indent=on&siteStatus=all&format=json',
                criteria: {
                    locationParam: '[ALL:05413500]',
                    variableParam: '[00060]',
                    parameter: []
                },
                note: [{
                    value: '[ALL:05413500]',
                    title: 'filter:sites'
                }, {
                    value: '[mode=PERIOD, period=P7D, modifiedSince=null]',
                    title: 'filter:timeRange'
                }, {
                    value: 'methodIds=[ALL]',
                    title: 'filter:methodId'
                }, {
                    value: '2017-01-09T20:46:07.542Z',
                    title: 'requestDT'
                }, {
                    value: '1df59e50-f57e-11e7-8ba8-6cae8b663fb6',
                    title: 'requestId'
                }, {
                    value: 'Provisional data are subject to revision. Go to http://waterdata.usgs.gov/nwis/help/?provisional for more information.',
                    title: 'disclaimer'
                }, {
                    value: 'vaas01',
                    title: 'server'
                }
            ]}
        });
        expect(data.siteCodes).toEqual({
            '05413500': {
                value: '05413500',
                network: 'NWIS',
                agencyCode: 'USGS'
            }
        });
        expect(data.timeZones).toEqual({
            'CST': {
                zoneOffset: '-06:00',
                zoneAbbreviation: 'CST'
            },
            CDT: {
                zoneOffset: '-05:00',
                zoneAbbreviation: 'CDT'
            }
        });
        expect(data.timeZoneInfo).toEqual({
            'CDT:CST:true': {
                defaultTimeZone: 'CST',
                daylightSavingsTimeZone: 'CDT',
                siteUsesDaylightSavingsTime: true
            }
        });
        expect(data.sourceInfo).toEqual({
            '05413500': {
                siteName: 'GRANT RIVER AT BURTON, WI',
                siteCode: ['05413500'],
                timeZoneInfo: 'CDT:CST:true',
                geoLocation: {
                    geogLocation: {
                        srs: 'EPSG:4326',
                        latitude: 42.72027778,
                        longitude: -90.8191667
                    },
                    localSiteXY: [

                    ]
                },
                note: [],
                siteType: [],
                siteProperty: [{
                    value: 'ST',
                    name: 'siteTypeCd'
                }, {
                    value: '07060003',
                    name: 'hucCd'
                }, {
                    value: '55',
                    name: 'stateCd'
                }, {
                    value: '55043',
                    name: 'countyCd'
                }]
            }
        });
        expect(data.qualifiers).toEqual({
            'P': {
                qualifierCode: 'P',
                qualifierDescription: 'Provisional data subject to revision.',
                qualifierID: 0,
                network: 'NWIS',
                vocabulary: 'uv_rmk_cd'
            }
        });
        expect(data.methods).toEqual({
            '158049': {
                methodDescription: '',
                methodID: 158049
            }
        });
        expect(data.timeSeries).toEqual({
            '158049:current': {
                qualifier: ['P'],
                qualityControlLevel: [],
                method: 158049,
                source: [],
                offset: [],
                sample: [],
                censorCode: [],
                tsKey: 'current',
                variable: '45807197',
                startTime: new Date('2017-01-02T15:00:00.000-06:00'),
                endTime: new Date('2017-01-02T15:15:00.000-06:00'),
                points: [{
                    value: 302,
                    qualifiers: ['P'],
                    dateTime: new Date('2017-01-02T15:00:00.000-06:00')
                }, {
                    value: 301,
                    qualifiers: ['P'],
                    dateTime: new Date('2017-01-02T15:15:00.000-06:00')
                }]
            }
        });
        expect(data.sourceInfo).toEqual({
            '05413500': {
                siteName: 'GRANT RIVER AT BURTON, WI',
                siteCode: [
                    '05413500'
                ],
                timeZoneInfo: 'CDT:CST:true',
                geoLocation: {
                    geogLocation: {
                        srs: 'EPSG:4326',
                        latitude:42.72027778,
                        longitude:-90.8191667
                    },
                    localSiteXY: []
                },
                note: [],
                siteType: [],
                siteProperty: [{
                    value: 'ST',
                    name: 'siteTypeCd'
                }, {
                    value: '07060003',
                    name: 'hucCd'
                }, {
                    value: '55',
                    name: 'stateCd'
                }, {
                    value: '55043',
                    name: 'countyCd'
                }]
            }
        });
        expect(data.options).toEqual({
            '00000': {
                name: 'Statistic',
                optionCode: '00000'
            }
        });
        expect(data.variables).toEqual({
            '45807197': {
                variableCode: {
                    value: '00060',
                    network: 'NWIS',
                    vocabulary: 'NWIS:UnitValues',
                    variableID: 45807197,
                    default: true
                },
                variableName: 'Streamflow, ft³/s',
                variableDescription: 'Discharge, cubic feet per second',
                valueType: 'Derived Value',
                unit: {
                    unitCode: 'ft3/s'
                },
                options: ['00000'],
                note: [],
                noDataValue: -999999,
                variableProperty: [],
                oid: '45807197'
            }
        });
        expect(data.timeSeriesCollections).toEqual({
            'USGS:05413500:00060:00000:current': {
                sourceInfo: '05413500',
                variable: '45807197',
                name: 'USGS:05413500:00060:00000',
                timeSeries: [
                    '158049:current'
                ]
            }
        });
        expect(data.requests).toEqual({
            current: {
                queryInfo: 'current',
                timeSeriesCollections: [
                    'USGS:05413500:00060:00000:current'
                ]
            }
        });
    });
});


export const MOCK_DATA = `
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
}`;
