"""
RDB snippets used for testing NWISWeb service call data processing.

"""
SITE_RDB = """#
#
# US Geological Survey
# retrieved: 2018-01-02 09:31:20 -05:00	(caas01)
#
# The Site File stores location and general information about groundwater,
# surface water, and meteorological sites
# for sites in USA.
#
# File-format description:  http://help.waterdata.usgs.gov/faq/about-tab-delimited-output
# Automated-retrieval info: http://waterservices.usgs.gov/rest/Site-Service.html
#
# Contact:   gs-w_support_nwisweb@usgs.gov
#
# The following selected fields are included in this output:
#
#  agency_cd       -- Agency
#  site_no         -- Site identification number
#  station_nm      -- Site name
#  site_tp_cd      -- Site type
#  dec_lat_va      -- Decimal latitude
#  dec_long_va     -- Decimal longitude
#  coord_acy_cd    -- Latitude-longitude accuracy
#  dec_coord_datum_cd -- Decimal Latitude-longitude datum
#  state_cd      -- State code
#  county_cd     -- County_code
#  alt_va          -- Altitude of Gage/land surface
#  alt_acy_va      -- Altitude accuracy
#  alt_datum_cd    -- Altitude datum
#  huc_cd          -- Hydrologic unit code
#
agency_cd	site_no	station_nm	site_tp_cd	dec_lat_va	dec_long_va	coord_acy_cd	dec_coord_datum_cd	state_cd	county_cd	alt_va	alt_acy_va	alt_datum_cd	huc_cd
5s	15s	50s	7s	16s	17s	s17s	16s	1s	10s	8s	3s	10s	16s
USGS	01630500	Some Random Site	ST	200.94977778	-100.12763889	S	NAD83	48	061	 151.20	 .1	NAVD88	02070010
"""

PARAMETER_RDB = """#
agency_cd	site_no	station_nm	site_tp_cd	dec_lat_va	dec_long_va	coord_acy_cd	dec_coord_datum_cd	alt_va	alt_acy_va	alt_datum_cd	huc_cd	data_type_cd	parm_cd	stat_cd	ts_id	loc_web_ds	medium_grp_cd	parm_grp_cd	srs_id	access_cd	begin_date	end_date	count_nu
5s	15s	50s	7s	16s	16s	1s	10s	8s	3s	10s	16s	2s	5s	5s	5n	30s	3s	3s	5n	4n	20d	20d	5n
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00010		69930	4.1 ft from riverbed (middle)	wat		1645597	0	2007-10-01	2018-01-10	3754
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00010		69931	1.0 ft from riverbed (bottom)	wat		1645597	0	2007-10-01	2018-01-10	3754
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00010		69932	7.1 ft from riverbed (top)	wat		1645597	0	2007-10-01	2018-01-10	3754
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00010		69942	From multiparameter sonde	wat		1645597	0	2013-11-23	2018-01-10	1509
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00060		69928		wat		1645423	0	1972-06-09	2018-01-10	16651
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00065		69929		wat		17164583	0	2007-10-01	2018-01-10	3754
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00095		69933	7.1 ft from riverbed (top)	wat		1646694	0	2007-10-01	2018-01-10	3754
USGS	01630500	POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA	ST	38.94977778	-77.12763889	S	NAD83	 37.20	 .1	NAVD88	02070008	uv	00095		69943	From multiparameter sonde	wat		1646694	0	2013-11-23	2018-01-10	1509
"""
