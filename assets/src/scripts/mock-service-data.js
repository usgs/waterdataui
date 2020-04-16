export const MOCK_NLDI_UPSTREAM_FLOW_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4336489066482, 39.4954827949405],
                [-87.4337763041258, 39.4952046945691]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286212"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4476554021239, 39.4393114000559],
                [-87.4480373039842, 39.4390688985586]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286442"
        }
    }]
}
`;

export const MOCK_NLDI_UPSTREAM_SITES_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
        "type": "Point",
        "coordinates": [-87.4195, 39.465722]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03341500",
        "name": "WABASH RIVER AT TERRE HAUTE, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03341500",
        "comid": "10286212",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03341500/navigate"
    }
}, {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [-87.568634, 39.02032]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03342000",
        "name": "WABASH RIVER AT RIVERTON, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03342000",
        "comid": "10288896",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03342000/navigate"
    }
}]
}
`;

export const MOCK_NLDI_DOWNSTREAM_FLOW_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4336489066483, 39.4954827949406],
                [-87.4337763041259, 39.4952046945692]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286213"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-87.4476554021240, 39.4393114000560],
                [-87.4480373039843, 39.4390688985587]
            ]
        },
        "properties": {
            "nhdplus_comid": "10286443"
        }
    }]
}
`;

export const MOCK_NLDI_DOWNSTREAM_SITES_FEATURE = `
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
        "type": "Point",
        "coordinates": [-85.489778, 40.85325]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03323500",
        "name": "WABASH RIVER AT HUNTINGTON, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03323500",
        "comid": "18508614",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03323500/navigate"
    }
}, {
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [-85.820263, 40.790877]
    },
    "properties": {
        "source": "nwissite",
        "sourceName": "NWIS Sites",
        "identifier": "USGS-03325000",
        "name": "WABASH RIVER AT WABASH, IN",
        "uri": "https://waterdata.usgs.gov/nwis/inventory?agency_code=USGS&site_no=03325000",
        "comid": "18508640",
        "navigation": "https://labs.waterdata.usgs.gov/api/nldi/linked-data/nwissite/USGS-03325000/navigate"
    }
}]
}
`;

export const MOCK_NLDI_UPSTREAM_BASIN_FEATURE = `
{
    "type":"FeatureCollection",
    "features":[{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[-105.996400477, 36.1905362630001],
                [-105.994985767, 36.20007602],
                [-105.997781253, 36.2060425510001],
                [-105.995979878, 36.2080856000001]]
        },
        "properties": {}
        }]
}
`;

export const MOCK_STATISTICS_RDB = `#
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
