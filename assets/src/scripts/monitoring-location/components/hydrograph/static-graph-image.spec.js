import {generateStaticGraphURL, getStaticGraph} from 'ivhydrograph/static-graph-image';

import {select} from 'd3-selection';

describe('generateStaticGraphURL', () => {
    const queryParameterPartsNoParameterCode = {
        'siteNumber': {
            '05413500': {
                'value': '05413500',
                    'network': 'NWIS',
                    'agencyCode': 'USGS'
            }
        },
        'timeSeriesShowOnGraphOptions': {
            'current': true,
            'compare': false,
            'median': false
        }
    };
    const queryParameterPartsWithParameterCode = {
        'siteNumber': {
            '05413500': {
                'value': '05413500',
                'network': 'NWIS',
                'agencyCode': 'USGS'
            }
        },
        'parameterCode': '99999',
        'timeSeriesShowOnGraphOptions': {
            'current': true,
            'compare': false,
            'median': false
        }
    };
    const queryParameterPartsWithTimePeriod = {
        'siteNumber': {
            '05413500': {
                'value': '05413500',
                'network': 'NWIS',
                'agencyCode': 'USGS'
            }
        },
        'parameterCode': '00065',
        'currentDateRange': 'P3D',
        'timeSeriesShowOnGraphOptions': {
            'current': true,
            'compare': false,
            'median': false
        }
    };
    const queryParameterPartsWithDates = {
        'siteNumber': {
            '05413500': {
                'value': '05413500',
                'network': 'NWIS',
                'agencyCode': 'USGS'
            }
        },
        'parameterCode': '00065',
        'currentDateRange': 'custom',
        'timeSeriesShowOnGraphOptions': {
            'current': true,
            'compare': false,
            'median': false
        },
        'customTimeRange': {
            'start': 1604206800000,
            'end': 1604469599999
        },
        'timeZone': 'America/Chicago'
    };
    const queryParameterPartsWithCompare = {
        'siteNumber': {
            '05413500': {
                'value': '05413500',
                'network': 'NWIS',
                'agencyCode': 'USGS'
            }
        },
        'parameterCode': '00065',
        'currentDateRange': 'P3D',
        'timeSeriesShowOnGraphOptions': {
            'current': true,
            'compare': true,
            'median': false
        }
    };

    it('will return a properly formatted URL', () => {
        expect(generateStaticGraphURL(queryParameterPartsNoParameterCode))
            .toEqual('https:/fake-graph-server/monitoring-location/05413500/?parameterCode=00060');
        expect(generateStaticGraphURL(queryParameterPartsWithParameterCode))
            .toEqual('https:/fake-graph-server/monitoring-location/05413500/?parameterCode=99999');
        expect(generateStaticGraphURL(queryParameterPartsWithTimePeriod))
            .toEqual('https:/fake-graph-server/monitoring-location/05413500/?parameterCode=00065&period=P3D&compare=false');
        expect(generateStaticGraphURL(queryParameterPartsWithDates))
            .toEqual('https:/fake-graph-server/monitoring-location/05413500/?parameterCode=00065&startDT=2020-11-01&endDT=2020-11-03');
        expect(generateStaticGraphURL(queryParameterPartsWithCompare))
            .toEqual('https:/fake-graph-server/monitoring-location/05413500/?parameterCode=00065&period=P3D&compare=true');
    });
});

describe('getStaticGraph', () => {
    const queryParameterParts = {
        'siteNumber': {
            '05413500': {
                'value': '05413500',
                'network': 'NWIS',
                'agencyCode': 'USGS'
            }
        },
        'parameterCode': '99999',
        'timeSeriesShowOnGraphOptions': {
            'current': true,
            'compare': false,
            'median': false
        }
    };
    let div;

    beforeEach(() => {
        div = select('body').append('div')
            .attr('id', 'graph-container');
    });

    afterEach(() => {
        div.remove();
    });

    it  ('will add an image element', () => {
        getStaticGraph(queryParameterParts);
        expect(div.selectAll('img').size()).toBe(1);
    });
});
