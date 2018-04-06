"""
Hand-curated descriptions of NWIS
meta data fields.

"""


METADATA_DESCRIPTIONS = {
    'agency_cd': 'The agency that is reporting the data.',
    'alt_acy_va': (
        'Altitude accuracy is mandatory when altitude is entered. '
        'Enter the accuracy of the altitude in terms of the possible error in feet.'
    ),
    'alt_datum_cd': 'Altitude of the site referenced to the specified Vertical Datum.',
    'alt_meth_cd': None,
    'alt_va': None,
    'aqfr_cd': None,
    'aqfr_type_cd': 'Describes the type of aquifer(s) encountered by a site type of well (groundwater).',
    'basin_cd': (
        'The Basin Code or "drainage basin code" is a two-digit code that '
        'further subdivides the 8-digit hydrologic-unit code.'
    ),
    'construction_dt': 'Date the well was completed',
    'contrib_drain_area_va': None,
    'coord_acy_cd': 'Indicates the accuracy of the latitude longitude values.',
    'coord_datum_cd': 'Latitude/longitude (horizontal) coordinate datum.',
    'coord_meth_cd': 'Indicates the method used to determine latitude longitude values.',
    'country_cd': None,
    'county_cd': 'The name of the county or county equivalent (parish, borough, etc.) in which the site is located.',
    'dec_coord_datum_cd': None,
    'dec_lat_va': None,
    'dec_long_va': None,
    'depth_src_cd': None,
    'district_cd': (
        'The Water Science Centers (WSCs) across the United States use the FIPS state code as the district code. '
        'In some case, sites and samples may be managed by a water science center that is adjacent to the state '
        'in which the site actually resides.'
    ),
    'drain_area_va': (
        'The area enclosed by a topographic divide from which direct surface runoff from'
        ' precipitation normally drains by gravity into the stream above that point.'
    ),
    'gw_file_cd': None,
    'hole_depth_va': 'The total depth to which the hole is drilled, in feet below land surface datum.',
    'huc_cd': (
        'Hydrologic units are geographic areas representing part or all of a surface drainage basin or distinct '
        'hydrologic feature and are delineated on the State Hydrologic Unit Maps.'
    ),
    'instruments_cd': None,
    'inventory_dt': None,
    'land_net_ds': None,
    'lat_va': None,
    'local_time_fg': (
        'Y for yes or an N for no to indicate whether the site is in an area that switches '
        'to Local Standard Time (Daylight Savings Time) for a part of the year.'
    ),
    'long_va': None,
    'map_nm': None,
    'map_scale_fc': None,
    'nat_aqfr_cd': None,
    'project_no': None,
    'reliability_cd': 'Data reliability code is mandatory for spring, groundwater, and aggregate groundwater sites.',
    'site_no': 'Each site in the USGS data base has a unique 8- to 15-digit identification number.',
    'site_tp_cd': (
        'A list of primary and secondary site types that can be associated with data collection sites. '
        'A site type is a generalized location in the hydrologic cycle, or a man-made feature thought to '
        'affect the hydrologic conditions measured at a site. All sites are associated with a primary site '
        'type, and may additionally be associated with a secondary site type that further describes the location. '
        'The exception to this rule is the Facility primary site type, which must always be '
        'associated with a secondary site type. The site type code incorporates these hierarchial distinctions.'
    ),
    'state_cd': 'The name of the state or territory in which the site is located.',
    'station_nm': (
        'This is the official name of the site in the database. '
        'For well information this can be a district-assigned local number.'
    ),
    'topo_cd': 'Refers to the geomorphic features in the vicinity of the site.',
    'tz_cd': None,
    'well_depth_va': None
}