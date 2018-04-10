"""
Constants
"""

STATION_FIELDS_D = {
    'agency_cd': {
        'name': 'Agency',
        'description': 'The agency that is reporting the data.'
    },
    'site_no': {
        'name': 'Site identification number',
        'description': 'Each site in the USGS data base has a unique 8- to 15-digit identification number.'
    },
    'station_nm': {
        'name': 'Site name',
        'description': (
            'This is the official name of the site in the database. '
            'For well information this can be a district-assigned local number.'
        )
    },
    'site_tp_cd': {
        'name': 'Site type',
        'description': (
            'A list of primary and secondary site types that can be associated with data collection sites. '
            'A site type is a generalized location in the hydrologic cycle, or a man-made feature thought to '
            'affect the hydrologic conditions measured at a site. All sites are associated with a primary site type, '
            'and may additionally be associated with a secondary site type that further describes the location. '
            'The exception to this rule is the Facility primary site type, which must always be associated with a '
            'secondary site type. The site type code incorporates these hierarchial distinctions.'
        )
    },
    'lat_va': {
        'name': 'DMS latitude',
        'description': None
    },
    'long_va': {
        'name': 'DMS longitude',
        'description': None
    },
    'dec_lat_va': {
        'name': 'Decimal latitude',
        'description': None
    },
    'dec_long_va': {
        'name': 'Decimal longitude',
        'description': None
    },
    'coord_meth_cd': {
        'name': 'Latitude-longitude method',
        'description': 'Indicates the method used to determine latitude longitude values.'
    },
    'coord_acy_cd': {
        'name': 'Latitude-longitude accuracy',
        'description': 'Indicates the accuracy of the latitude longitude values.'
    },
    'coord_datum_cd': {
        'name': 'Latitude-longitude datum',
        'description': 'Latitude/longitude (horizontal) coordinate datum.'
    },
    'dec_coord_datum_cd': {
        'name': 'Decimal Latitude-longitude datum',
        'description': None
    },
    'district_cd': {
        'name': 'District',
        'description': (
            'The Water Science Centers (WSCs) across the United States use the FIPS state code as the district code. '
            'In some case, sites and samples may be managed by a water science center that is adjacent to the state '
            'in which the site actually resides.'
        )
    },
    'state_cd': {
        'name': 'State',
        'description': 'The name of the state or territory in which the site is located.'
    },
    'county_cd': {
        'name': 'County',
        'description': (
            'The name of the county or county equivalent (parish, borough, etc.) in which the site is located.'
        )
    },
    'country_cd': {
        'name': 'Country',
        'description': None
    },
    'land_net_ds': {
        'name': 'Land net location description',
        'description': None
    },
    'map_nm': {
        'name': 'Name of location map',
        'description': None
    },
    'map_scale_fc': {
        'name': 'Scale of location map',
        'description': None
    },
    'alt_va': {
        'name': 'Altitude of Gage/land surface',
        'description': None
    },
    'alt_meth_cd': {
        'name': 'Method altitude determined',
        'description': None
    },
    'alt_acy_va': {
        'name': 'Altitude accuracy',
        'description': None
    },
    'alt_datum_cd': {
        'name': 'Altitude datum',
        'description': 'Altitude of the site referenced to the specified Vertical Datum.'
    },
    'huc_cd': {
        'name': 'Subbasin hydrologic unit',
        'description': (
            'Hydrologic units are geographic areas representing part or all of a surface drainage basin or distinct '
            'hydrologic feature and are delineated on the State Hydrologic Unit Maps.'
        )
    },
    'basin_cd': {
        'name': 'Drainage basin',
        'description': (
            'The Basin Code or "drainage basin code" is a two-digit code that '
            'further subdivides the 8-digit hydrologic-unit code.'
        )
    },
    'topo_cd': {
        'name': 'Topographic setting',
        'description': 'Refers to the geomorphic features in the vicinity of the site.'
    },
    'instruments_cd': {
        'name': 'Flags for instruments at site',
        'description': None
    },
    'construction_dt': {
        'name': 'Date of first construction',
        'description': 'Date the well was completed'
    },
    'inventory_dt': {
        'name': 'Date site established or inventoried',
        'description': None
    },
    'drain_area_va': {
        'name': 'Drainage area',
        'description': (
            'The area enclosed by a topographic divide from which direct surface runoff from precipitation normally '
            'drains by gravity into the stream above that point.'
        )
    },
    'contrib_drain_area_va': {
        'name': 'Contributing drainage area',
        'description': None
    },
    'tz_cd': {
        'name': 'Time Zone abbreviation',
        'description': None
    },
    'local_time_fg': {
        'name': 'Site honors Daylight Savings Time',
        'description': (
            'Y for yes or an N for no to indicate whether the site is in an area that switches to Local Standard '
            'Time (Daylight Savings Time) for a part of the year.'
        )
    },
    'reliability_cd': {
        'name': 'Data reliability',
        'description': 'Data reliability code is mandatory for spring, groundwater, and aggregate groundwater sites.'
    },
    'gw_file_cd': {
        'name': 'Data-other GW files',
        'description': None
    },
    'nat_aqfr_cd': {
        'name': 'National aquifer',
        'description': None
    },
    'aqfr_cd': {
        'name': 'Local aquifer',
        'description': None
    },
    'aqfr_type_cd': {
        'name': 'Local aquifer type',
        'description': 'Describes the type of aquifer(s) encountered by a site type of well (groundwater).'
    },
    'well_depth_va': {
        'name': 'Well depth',
        'description': None
    },
    'hole_depth_va': {
        'name': 'Hole depth',
        'description': 'The total depth to which the hole is drilled, in feet below land surface datum.'
    },
    'depth_src_cd': {
        'name': 'Source of depth data',
        'description': None
    },
    'project_no': {
        'name': 'Project number',
        'description': None
    }
}


US_STATES = [
    {'name': 'Alabama', 'abbreviation': 'AL'},
    {'name': 'Alaska', 'abbreviation': 'AK'},
    {'name': 'American Samoa', 'abbreviation': 'AS'},
    {'name': 'Arizona', 'abbreviation': 'AZ'},
    {'name': 'Arkansas', 'abbreviation': 'AR'},
    {'name': 'California', 'abbreviation': 'CA'},
    {'name': 'Colorado', 'abbreviation': 'CO'},
    {'name': 'Connecticut', 'abbreviation': 'CT'},
    {'name': 'Delaware', 'abbreviation': 'DE'},
    {'name': 'District Of Columbia', 'abbreviation': 'DC'},
    {'name': 'Federated States Of Micronesia', 'abbreviation': 'FM'},
    {'name': 'Florida', 'abbreviation': 'FL'},
    {'name': 'Georgia', 'abbreviation': 'GA'},
    {'name': 'Guam', 'abbreviation': 'GU'},
    {'name': 'Hawaii', 'abbreviation': 'HI'},
    {'name': 'Idaho', 'abbreviation': 'ID'},
    {'name': 'Illinois', 'abbreviation': 'IL'},
    {'name': 'Indiana', 'abbreviation': 'IN'},
    {'name': 'Iowa', 'abbreviation': 'IA'},
    {'name': 'Kansas', 'abbreviation': 'KS'},
    {'name': 'Kentucky', 'abbreviation': 'KY'},
    {'name': 'Louisiana', 'abbreviation': 'LA'},
    {'name': 'Maine', 'abbreviation': 'ME'},
    {'name': 'Marshall Islands', 'abbreviation': 'MH'},
    {'name': 'Maryland', 'abbreviation': 'MD'},
    {'name': 'Massachusetts', 'abbreviation': 'MA'},
    {'name': 'Michigan', 'abbreviation': 'MI'},
    {'name': 'Minnesota', 'abbreviation': 'MN'},
    {'name': 'Mississippi', 'abbreviation': 'MS'},
    {'name': 'Missouri', 'abbreviation': 'MO'},
    {'name': 'Montana', 'abbreviation': 'MT'},
    {'name': 'Nebraska', 'abbreviation': 'NE'},
    {'name': 'Nevada', 'abbreviation': 'NV'},
    {'name': 'New Hampshire', 'abbreviation': 'NH'},
    {'name': 'New Jersey', 'abbreviation': 'NJ'},
    {'name': 'New Mexico', 'abbreviation': 'NM'},
    {'name': 'New York', 'abbreviation': 'NY'},
    {'name': 'North Carolina', 'abbreviation': 'NC'},
    {'name': 'North Dakota', 'abbreviation': 'ND'},
    {'name': 'Northern Mariana Islands', 'abbreviation': 'MP'},
    {'name': 'Ohio', 'abbreviation': 'OH'},
    {'name': 'Oklahoma', 'abbreviation': 'OK'},
    {'name': 'Oregon', 'abbreviation': 'OR'},
    {'name': 'Palau', 'abbreviation': 'PW'},
    {'name': 'Pennsylvania', 'abbreviation': 'PA'},
    {'name': 'Puerto Rico', 'abbreviation': 'PR'},
    {'name': 'Rhode Island', 'abbreviation': 'RI'},
    {'name': 'South Carolina', 'abbreviation': 'SC'},
    {'name': 'South Dakota', 'abbreviation': 'SD'},
    {'name': 'Tennessee', 'abbreviation': 'TN'},
    {'name': 'Texas', 'abbreviation': 'TX'},
    {'name': 'Utah', 'abbreviation': 'UT'},
    {'name': 'Vermont', 'abbreviation': 'VT'},
    {'name': 'Virgin Islands', 'abbreviation': 'VI'},
    {'name': 'Virginia', 'abbreviation': 'VA'},
    {'name': 'Washington', 'abbreviation': 'WA'},
    {'name': 'West Virginia', 'abbreviation': 'WV'},
    {'name': 'Wisconsin', 'abbreviation': 'WI'},
    {'name': 'Wyoming', 'abbreviation': 'WY'}
]
