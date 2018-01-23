"""
Pytest fixtures for the generate_lookups command.
"""
# pylint: disable=C0301

import re

import pytest
import requests_mock

from waterdata.commands.lookup_generation import WQP_LOOKUP_ENDPOINT
from waterdata.commands.lookup_generation import huc_lookups


@pytest.fixture(scope='module')
def huc_mock():
    """Mock data for HUC service call."""
    with requests_mock.mock() as mock_req:
        yield mock_req.get(huc_lookups.SOURCE_URL, text=MOCK_DATA)


@pytest.fixture(scope='module')
def nwis_mock():
    """Mock data for HUC service call."""
    with requests_mock.mock() as mock_req:
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/agency_cd_query?fmt=rdb',
            text=MOCK_AGENCY_CD_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/site_tp_query?fmt=rdb',
            text=MOCK_SITE_TP_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/parameter_cd_query?fmt=rdb&group_cd=%25',
            text=MOCK_PARAM_CD_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/alt_datum_cd_query?fmt=rdb',
            text=MOCK_ALT_DATUM_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/alt_meth_cd_query?fmt=rdb',
            text=MOCK_ALT_METHOD_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/aqfr_type_cd_query?fmt=rdb',
            text=MOCK_AQFR_TYPE_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/coord_acy_cd_query?fmt=rdb',
            text=MOCK_COORD_ACY_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/coord_meth_cd_query?fmt=rdb',
            text=MOCK_COORD_METH_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/reliability_cd_query?fmt=rdb',
            text=MOCK_RELIABILITY_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/topo_cd_query?fmt=rdb',
            text=MOCK_TOPO_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/nat_aqfr_query?fmt=rdb',
            text=MOCK_NAT_AQFR_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/aqfr_cd_query?fmt=rdb',
            text=MOCK_AQFR_CD_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/stat_cd_nm_query?stat_nm_cd=%25&fmt=rdb',
            text=MOCK_STAT_CD_DATA
        )
        mock_req.get(
            'https://help.waterdata.usgs.gov/code/medium_cd_query?fmt=rdb',
            text=MOCK_MEDIUM_CD_DATA
        )
        yield


@pytest.fixture(scope='module')
def regions_mock():
    """Mock data for HUC service call."""
    with requests_mock.mock() as mock_req:
        mock_req.get(re.compile(WQP_LOOKUP_ENDPOINT + '/Codes/statecode.*'),
                     text=MOCK_STATE_DATA)
        mock_req.get(WQP_LOOKUP_ENDPOINT + '/Codes/countycode',
                     text=MOCK_COUNTY_DATA)
        yield


MOCK_DATA = """#
# National Water Information System
# 2018/01/12
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
huc_cd\thuc_class_cd\thuc_nm
8s\t15s\t51s
01\tRegion\tNew England Region
0101\tSubregion\tSt. John
010100\tAccounting Unit\tSt. John
01010001\tCataloging Unit\tUpper St. John
01010002\tCataloging Unit\tAllagash
01010003\tCataloging Unit\tFish
01010004\tCataloging Unit\tAroostook
01010005\tCataloging Unit\tMeduxnekeag
0102\tSubregion\tPenobscot
010200\tAccounting Unit\tPenobscot
01020001\tCataloging Unit\tWest Branch Penobscot
01020002\tCataloging Unit\tEast Branch Penobscot
01020003\tCataloging Unit\tMattawamkeag
01020004\tCataloging Unit\tPiscataquis
01020005\tCataloging Unit\tLower Penobscot
0103\tSubregion\tKennebec
010300\tAccounting Unit\tKennebec
01030001\tCataloging Unit\tUpper Kennebec
01030002\tCataloging Unit\tDead
01030003\tCataloging Unit\tLower Kennebec
0104\tSubregion\tAndroscoggin
010400\tAccounting Unit\tAndroscoggin
01040001\tCataloging Unit\tUpper Androscoggin
01040002\tCataloging Unit\tLower Androscoggin
0105\tSubregion\tMaine Coastal
010500\tAccounting Unit\tMaine Coastal
01050001\tCataloging Unit\tSt. Croix
01050002\tCataloging Unit\tMaine Coastal
01050003\tCataloging Unit\tSt. George-Sheepscot
01050004\tCataloging Unit\tPassamaquoddy Bay-Bay of Fundy
0106\tSubregion\tSaco
010600\tAccounting Unit\tSaco
01060001\tCataloging Unit\tPresumpscot
01060002\tCataloging Unit\tSaco
01060003\tCataloging Unit\tPiscataqua-Salmon Falls

"""

MOCK_STATE_DATA = r"""{"codes":[{"value":"US:00","desc":"Unspecified","providers":"NWIS STORET"},{"value":"US:01","desc":"Alabama","providers":"BIODATA NWIS STORET"},{"value":"US:02","desc":"Alaska","providers":"BIODATA NWIS STORET"},{"value":"US:04","desc":"Arizona","providers":"BIODATA NWIS STORET"},{"value":"US:05","desc":"Arkansas","providers":"BIODATA NWIS STORET"},{"value":"US:06","desc":"California","providers":"BIODATA NWIS STORET"},{"value":"US:08","desc":"Colorado","providers":"BIODATA NWIS STORET"},{"value":"US:09","desc":"Connecticut","providers":"BIODATA NWIS STORET"},{"value":"US:10","desc":"Delaware","providers":"NWIS STORET"},{"value":"US:11","desc":"District of Columbia","providers":"NWIS STORET"},{"value":"US:12","desc":"Florida","providers":"BIODATA NWIS STORET"},{"value":"US:13","desc":"Georgia","providers":"BIODATA NWIS STORET"},{"value":"US:15","desc":"Hawaii","providers":"BIODATA NWIS STORET"},{"value":"US:16","desc":"Idaho","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:17","desc":"Illinois","providers":"BIODATA NWIS STORET"},{"value":"US:18","desc":"Indiana","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:19","desc":"Iowa","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:20","desc":"Kansas","providers":"BIODATA NWIS STORET"},{"value":"US:21","desc":"Kentucky","providers":"NWIS STORET"},{"value":"US:22","desc":"Louisiana","providers":"BIODATA NWIS STORET"},{"value":"US:23","desc":"Maine","providers":"BIODATA NWIS STORET"},{"value":"US:24","desc":"Maryland","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:25","desc":"Massachusetts","providers":"BIODATA NWIS STORET"},{"value":"US:26","desc":"Michigan","providers":"BIODATA NWIS STORET"},{"value":"US:27","desc":"Minnesota","providers":"BIODATA NWIS STORET"},{"value":"US:28","desc":"Mississippi","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:29","desc":"Missouri","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:30","desc":"Montana","providers":"BIODATA NWIS STORET"},{"value":"US:31","desc":"Nebraska","providers":"BIODATA NWIS STORET"},{"value":"US:32","desc":"Nevada","providers":"BIODATA NWIS STORET"},{"value":"US:33","desc":"New Hampshire","providers":"BIODATA NWIS STORET"},{"value":"US:34","desc":"New Jersey","providers":"BIODATA NWIS STORET"},{"value":"US:35","desc":"New Mexico","providers":"BIODATA NWIS STORET"},{"value":"US:36","desc":"New York","providers":"BIODATA NWIS STORET"},{"value":"US:37","desc":"North Carolina","providers":"BIODATA NWIS STORET"},{"value":"US:38","desc":"North Dakota","providers":"BIODATA NWIS STORET"},{"value":"US:39","desc":"Ohio","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:40","desc":"Oklahoma","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:41","desc":"Oregon","providers":"BIODATA NWIS STORET"},{"value":"US:42","desc":"Pennsylvania","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:44","desc":"Rhode Island","providers":"NWIS STORET"},{"value":"US:45","desc":"South Carolina","providers":"BIODATA NWIS STORET"},{"value":"US:46","desc":"South Dakota","providers":"BIODATA NWIS STORET"},{"value":"US:47","desc":"Tennessee","providers":"BIODATA NWIS STORET"},{"value":"US:48","desc":"Texas","providers":"BIODATA NWIS STEWARDS STORET"},{"value":"US:49","desc":"Utah","providers":"BIODATA NWIS STORET"},{"value":"US:50","desc":"Vermont","providers":"BIODATA NWIS STORET"},{"value":"US:51","desc":"Virginia","providers":"BIODATA NWIS STORET"},{"value":"US:53","desc":"Washington","providers":"BIODATA NWIS STORET"},{"value":"US:54","desc":"West Virginia","providers":"BIODATA NWIS STORET"},{"value":"US:55","desc":"Wisconsin","providers":"BIODATA NWIS STORET"},{"value":"US:56","desc":"Wyoming","providers":"BIODATA NWIS STORET"},{"value":"US:60","desc":"American Samoa","providers":"NWIS STORET"},{"value":"US:66","desc":"Guam","providers":"NWIS STORET"},{"value":"US:69","desc":"Northern Mariana Islands","providers":"STORET"},{"value":"US:72","desc":"Puerto Rico","providers":"NWIS STORET"},{"value":"US:78","desc":"Virgin Islands","providers":"NWIS STORET"}],"recordCount":57}"""
MOCK_COUNTY_DATA = r"""{"codes":[{"value":"US:04:001","desc":"US, Arizona, Apache County","providers":"NWIS STORET"},{"value":"US:04:003","desc":"US, Arizona, Cochise County","providers":"BIODATA NWIS STORET"},{"value":"US:04:005","desc":"US, Arizona, Coconino County","providers":"NWIS STORET"},{"value":"US:04:007","desc":"US, Arizona, Gila County","providers":"BIODATA NWIS STORET"},{"value":"US:04:009","desc":"US, Arizona, Graham County","providers":"NWIS STORET"},{"value":"US:04:011","desc":"US, Arizona, Greenlee County","providers":"NWIS STORET"},{"value":"US:04:012","desc":"US, Arizona, La Paz County","providers":"NWIS STORET"},{"value":"US:04:013","desc":"US, Arizona, Maricopa County","providers":"BIODATA NWIS STORET"},{"value":"US:04:015","desc":"US, Arizona, Mohave County","providers":"NWIS STORET"},{"value":"US:04:017","desc":"US, Arizona, Navajo County","providers":"NWIS STORET"},{"value":"US:04:019","desc":"US, Arizona, Pima County","providers":"NWIS STORET"},{"value":"US:04:021","desc":"US, Arizona, Pinal County","providers":"BIODATA NWIS STORET"},{"value":"US:04:023","desc":"US, Arizona, Santa Cruz County","providers":"BIODATA NWIS STORET"},{"value":"US:04:025","desc":"US, Arizona, Yavapai County","providers":"BIODATA NWIS STORET"},{"value":"US:04:027","desc":"US, Arizona, Yuma County","providers":"NWIS STORET"},{"value":"US:04:N/A","desc":"US, Arizona, ","providers":"STORET"}],"recordCount":16}"""
MOCK_AGENCY_CD_DATA = r"""#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
agency_cd   party_nm
5s  64s
AK001   Alaska Department of Transportation and Public Facilities
AK002   Alaska Department of Environmental Conservation
AK004   Alaska Department of Natural Resources (DNR)
AK008   Alaska Department of Fish and Game
AK010   Alaska DNR, Division of Land and Water Management
AK011   Alaska DNR, Division of Geological and Geophysical Surveys
AL001   Alabama Geological Survey
AL002   Alabama Water Improvement Commission
AL003   Auburn University Water Resources Research Institute, AL
AL006   Alabama State Highway Department
AL012   Alabama Office of Water Resources
AR001   Arkansas Dept of Health, Bureau of Environmental Engineering
AR004   Arkansas Geological Survey
AR008   Arkansas Natural Resources Commission
AR019   International Paper-Pine Bluff, AR
AR025   Union County Conservation District, AR
ASCE    American Society of Civil Engineers
AWRA    American Water Resources Association
AYRES   Ayres Associates
AZ001   University of Arizona, Water Resources Research Center
AZ002   Roosevelt Irrigation District, AZ
AZ003   Arizona Game and Fish Department
AZ004   Maricopa County Municipal Water Conservation District #1, AZ
AZ005   Gila Water Commissioner, AZ
AZ006   Salt River Valley Water Users Association, AZ
AZ007   Arizona Department of Health
AZ008   Central Arizona Project
"""
MOCK_SITE_TP_DATA = r"""#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
site_tp_cd  site_tp_srt_nu  site_tp_vld_fg  site_tp_prim_fg site_tp_nm  site_tp_ln  site_tp_ds
7s      1s  1s  10s 37s 1049s
AG  55  Y   Y   Agg GW WU   Aggregate groundwater use   An Aggregate Groundwater Withdrawal/Return site represents an aggregate of specific sites whe groundwater is withdrawn or returned which is defined by a geographic area or some other common characteristic. An aggregate groundwatergroundwater site type is used when it is not possible or practical to describe the specific sites as springs or as any type of well including 'multiple wells', or when water-use information is only available for the aggregate. Aggregate sites that span multiple counties should be coded with 000 as the county code, or an aggregate site can be created for each county.
AS  56  Y   Y   Agg SW WU   Aggregate surface-water-use An Aggregate Surface-Water Diversion/Return site represents an aggregate of specific sites where surface water is diverted or returned which is defined by a geographic area or some other common characteristic. An aggregate surface-water site type is used when it is not possible or practical to describe the specific sites as diversions, outfalls, or land application sites, or when water-use information is only available for the aggregate. Aggregate sites that span multiple counties should be coded with 000 as the county code, or an aggregate site can be created for each county.
AT  11  Y   Y   Atmosphere  Atmosphere  A site established primarily to measure meteorological properties or atmospheric deposition.
AW  57  Y   Y   Agg estab   Aggregate water-use establishment   An Aggregate Water-Use Establishment represents an aggregate class of water-using establishments or individuals that are associated with a specific geographic location and water-use category, such as all the industrial users located within a county or all self-supplied domestic users in a county. The aggregate class of water-using establishments is identified using the national water-use category code and optionally classified using the Standard Industrial Classification System Code (SIC code) or North American Classification System Code (NAICS code). An aggregate water-use establishment site type is used when specific information needed to create sites for the individual facilities or users is not available or when it is not desirable to store the site-specific information in the database. Data entry rules that apply to water-use establishments also apply to aggregate water-use establishments. Aggregate sites that span multiple counties should be coded with 000 as the county code, or an aggregate site can be created for each county.
ES  12  Y   Y   Estuary Estuary A coastal inlet of the sea or ocean; esp. the mouth of a river, where tide water normally mixes with stream water (modified, Webster). Salinity in estuaries typically ranges from 1 to 25 Practical Salinity Units (psu), as compared oceanic values around 35-psu. See also: tidal stream and coastal.
FA  33  N   Y   Facility    Facility    "A non-ambient location where environmental measurements are expected to be strongly influenced by current or previous activities of humans. Sites identified with a ""facility"" primary site type must be further classified with one of the applicable secondary site types."
FA-AWL  34  Y   N   Waste lag   Animal waste lagoon A facility for storage and/or biological treatment of wastes from livestock operations. Animal-waste lagoons are earthen structures ranging from pits to large ponds, and contain manure which has been diluted with building washwater, rainfall, and surface runoff. In treatment lagoons, the waste becomes partially liquefied and stabilized by bacterial action before the waste is disposed of on the land and the water is discharged or re-used.
FA-CI   35  Y   N   Cistern Cistern An artificial, non-pressurized reservoir filled by gravity flow and used for water storage. The reservoir may be located above, at, or below ground level. The water may be supplied from diversion of precipitation, surface, or groundwater sources.
FA-CS   36  Y   N   Sewer-comb  Combined sewer  An underground conduit created to convey storm drainage and waste products into a wastewater-treatment plant, stream, reservoir, or disposal site.
FA-DV   37  Y   N   Diversion   Diversion   A site where water is withdrawn or diverted from a surface-water body (e.g. the point where the upstream end of a canal intersects a stream, or point where water is withdrawn from a reservoir). Includes sites where water is pumped for use elsewhere, and sites where the surface-water body is considered a groundwater source such as a mining excavation with no surface-water inflow.
FA-FON  38  Y   N   Agric area  Field, Pasture, Orchard, or Nursery A water-using facility characterized by an area where plants are grown for transplanting, for use as stocks for budding and grafting, or for sale. Irrigation water may or may not be applied.
FA-GC   39  Y   N   Golf    Golf course A place-of-use, either public or private, where the game of golf is played. A golf course typically uses water for irrigation purposes. Should not be used if the site is a specific hydrologic feature or facility; but can be used especially for the water-use sites.
FA-HP   40  Y   N   Hydroelect  Hydroelectric plant A facility that generates electric power by converting potential energy of water into kinetic energy. Typically, turbine generators are turned by falling water.
FA-LF   42  Y   N   Landfill    Landfill    A typically dry location on the surface of the land where primarily solid waste products are currently, or previously have been, aggregated and sometimes covered with a veneer of soil. See also: Wastewater disposal and waste-injection well.
FA-OF   43  Y   N   Outfall Outfall A site where water or wastewater is returned to a surface-water body, e.g. the point where wastewater is returned to a stream. Typically, the discharge end of an effluent pipe.
FA-PV   44  Y   N   Pavement    Pavement    A surface site where the land surface is covered by a relatively impermeable material, such as concrete or asphalt.  Pavement sites are typically part of transportation infrastructure, such as roadways, parking lots, or runways.
FA-QC   41  Y   N   QC lab  Laboratory or sample-preparation area   A site where some types of quality-control samples are collected, and where equipment and supplies for environmental sampling are prepared. Equipment blank samples are commonly collected at this site type, as are samples of locally produced deionized water. This site type is typically used when the data are either not associated with a unique environmental data-collection site, or where blank water supplies are designated by Center offices with unique station IDs.
FA-SEW  49  Y   N   Sewer-wste  Wastewater sewer    "An underground conduit created to convey liquid and semisolid domestic, commercial, or industrial waste into a treatment plant, stream, reservoir, or disposal site. If the sewer also conveys storm water, then the ""combined sewer"" secondary site type should be used."
"""
MOCK_PARAM_CD_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
parm_cd group   parm_nm epa_equivalence result_statistical_basis    result_time_basis   result_weight_basis result_particle_size_basis  result_sample_fraction  result_temperature_basis    CASRN   SRSName parm_unit
5s  29s 170s    26s 18s 10s 12s 14s 14s 10s 12s 355s    10s
00001   Information Location in cross section, distance from right bank looking upstream, feet  Agree                                   ft
00002   Information Location in cross section, distance from right bank looking upstream, percent   Agree                                   %
00003   Information Sampling depth, feet    Agree                                   ft
00004   Physical    Stream width, feet  Agree                               Instream features, est. stream width    ft
00005   Information Location in cross section, fraction of total depth, percent Agree                   Total               %
00008   Information Sample accounting number    Agree                                   nu
00009   Information Location in cross section, distance from left bank looking downstream, feet Agree                                   ft
00010   Physical    Temperature, water, degrees Celsius Agree                               Temperature, water  deg C
00011   Physical    Temperature, water, degrees Fahrenheit  Agree                               Temperature, water, deg F   deg F
00012   Physical    Evaporation temperature, 48 inch pan, degrees Celsius   Agree                                   deg C
00013   Physical    Evaporation temperature, 24 inch pan, degrees Celsius   Agree                                   deg C
00014   Physical    Wet bulb temperature, degrees Celsius   Agree                               Temperature, wet bulb   deg C
00020   Physical    Temperature, air, degrees Celsius   Agree                               Temperature, air, deg C deg C
00021   Physical    Temperature, air, degrees Fahrenheit    Agree                               Temperature, air, deg F deg F
00022   Information Duration of exposure, sample or test, days  Agree                                   days
00023   Information Sample weight, pounds   Agree                                   lb
00024   Information Sample length, inches   Agree                                   in
00025   Physical    Barometric pressure, millimeters of mercury Agree                               Barometric pressure mm/Hg
00028   Information Agency analyzing sample, code   Agree                                   code
00029   Information Project number  Not agree                                   nu
00030   Physical    Incident solar radiation intensity, calories per square centimeter per day  Agree                               Solar irradiation, local    cal/cm2/d
00031   Physical    Incident light remaining at depth, percent  Agree                               Light attenuation at measurement depth  %
00032   Physical    Cloud cover, percent    Agree                               Cloud cover (percent)   %
00034   Physical    Depth to 1 percent of surface light, feet   Agree                               Light attenuation, depth at 99% ft"""
MOCK_ALT_DATUM_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
Code    Description
10s 47s
ASVD02  American Samoa Vertical Datum of 2002
BARGECANAL  New York State Barge Canal datum
COE1912 U.S. Corps of Engineers datum adjustment 1912
GUVD04  Guam Vertical Datum of 2004
IGLD    International Great Lakes Datum
LMSL    Local Mean Sea Level
NAVD88  North American Vertical Datum of 1988
NGVD29  National Geodetic Vertical Datum of 1929
NMVD03  Northern Marianas Vertical Datum of 2003
OLDAK   Old Alaska (Mainland) and Aleutian Island Datum
OLDPR   Old Puerto Rico and Virgin Island Datum
PRVD02  Puerto Rico Vertical Datum of 2002"""
MOCK_ALT_METHOD_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
gw_ref_cd   gw_ref_ds
1s  71s
A   Altimeter.
D   Differentially corrected Global Positioning System.
F   Survey-grade GPSF
I   Interferometric Synthetic Aperture Radar, airplane
J   Light Detection And Ranging, airplane
L   Level or other surveyed method.
M   Interpolated from topographic map.
N   Interpolated from Digital Elevation Model
R   Reported method of determination.
W   GNSS1 - Level 1 Quality Survey Grade Global Navigation Satellite System
X   GNSS2 - Level 2 Quality Survey Grade Global Navigation Satellite System
Y   GNSS3 - Level 3 Quality Survey Grade Global Navigation Satellite System
Z   GNSS4 - Level 4 Quality Survey Grade Global Navigation Satellite System"""
MOCK_AQFR_TYPE_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
Code    Description
1s  49s
C   Confined single aquifer
M   Confined multiple aquifers
N   Unconfined multiple aquifer
U   Unconfined single aquifer
X   Mixed (confined and unconfined) multiple aquifers"""
MOCK_COORD_ACY_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
gw_ref_cd   gw_ref_ds
1s  58s
H   Accurate to + or - .01 sec (Differentially-Corrected GPS).
1   Accurate to + or - .1  sec (Differentially-Corrected GPS).
5   Accurate to + or - .5  sec (PLGR/PPS GPS).
M   Accurate to + or - 1   min.
S   Accurate to + or - 1   sec.
T   Accurate to + or - 10  sec.
R   Accurate to + or - 3   sec (SPS GPS).
F   Accurate to + or - 5   sec.
B   Level 1 survey-grade GPS
C   Level 2 survey-grade GPS
D   Level 3 survey-grade GPS
E   Level 4 survey-grade GPS
U   Unknown or unspecified."""
MOCK_COORD_METH_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
gw_ref_cd   gw_ref_ds
1s  71s
C   Calculated from land net
D   Differentially corrected Global Positioning System.
W   GNSS1 - Level 1 Quality Survey Grade Global Navigation Satellite System
X   GNSS2 - Level 2 Quality Survey Grade Global Navigation Satellite System
Y   GNSS3 - Level 3 Quality Survey Grade Global Navigation Satellite System
Z   GNSS4 - Level 4 Quality Survey Grade Global Navigation Satellite System
N   Interpolated from Digital MAP.
M   Interpolated from MAP.
L   Long range navigation system.
G   Mapping grade GPS unit (handheld accuracy range 12 to 40 ft)
R   Reported.
F   Survey-grade GPSF
S   Transit, theodolite, or other surveying method.
U   Unknown."""
MOCK_RELIABILITY_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
gw_ref_cd   gw_ref_ds
1s  47s
C   Data have been checked by the reporting agency.
L   Location not accurate.
M   Minimal data.
U   Unchecked data."""
MOCK_TOPO_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
gw_ref_cd   gw_ref_nm   gw_ref_ds
1s  16s 102s
A   Alluvial fan    Stream deposit of loose rock material where it issues from a narrow mountain valley upon a plain.
B   Playa   Undrained desert basin in which water accumulates and is quickly evaporated.
C   Stream channel  Bed in which a natural stream of water runs.
D   Local depression    An area that has no external surface drainage.
E   Dunes   Mounds and ridges of windblown, or eolian sand.
F   Flat surface    May be part of a larger feature, such as a plateau, plain, or pediment.
G   Flood plain Smooth land surface adjacent to a river channel that is flooded when the river overflows its banks.
H   Hilltop Upper part of a hill or ridge above a well-defined break in slope.
K   Sinkhole    Depression that results from the dissolving of soluble rocks and collapse into the solution cavity.
L   Lake or Swamp   Inland lake, swamp, or marsh where the ground may be saturated or water stands above the land surface.
M   Mangrove swamp  Tropical or subtropical marine swamp characterized by abundant mangrove trees.
O   Offshore    Site along a coast or estuary that is continuously submerged.
P   Pediment    Plain of combined erosion and deposition that forms at the foot of a mountain range.
S   Hillside    Sloping side of hill, the area between the hilltop and valley flat.
T   Alluvial terrace    Generally a flat surface, usually parallel to but elevated above a stream valley or coast line.
U   Undulating  Topography is characteristic of areas which have many small depressions and low mounds.
V   Valley flat Low flat area between the valley walls and bordering a stream channel.
W   Upland draw Small natural drainageway"""
MOCK_NAT_AQFR_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
state_cd    nat_aqfr_cd nat_aqfr_nm
2s  10s 60s
    N100AKUNCD  Alaska unconsolidated-deposit aquifers
02  N100AKUNCD  Alaska unconsolidated-deposit aquifers
    N100ALLUVL  Alluvial aquifers
05  N100ALLUVL  Alluvial aquifers
08  N100ALLUVL  Alluvial aquifers
10  N100ALLUVL  Alluvial aquifers
20  N100ALLUVL  Alluvial aquifers
21  N100ALLUVL  Alluvial aquifers
22  N100ALLUVL  Alluvial aquifers
24  N100ALLUVL  Alluvial aquifers
29  N100ALLUVL  Alluvial aquifers
30  N100ALLUVL  Alluvial aquifers
31  N100ALLUVL  Alluvial aquifers
34  N100ALLUVL  Alluvial aquifers
38  N100ALLUVL  Alluvial aquifers
39  N100ALLUVL  Alluvial aquifers
40  N100ALLUVL  Alluvial aquifers
46  N100ALLUVL  Alluvial aquifers
47  N100ALLUVL  Alluvial aquifers
48  N100ALLUVL  Alluvial aquifers
49  N100ALLUVL  Alluvial aquifers
51  N100ALLUVL  Alluvial aquifers
54  N100ALLUVL  Alluvial aquifers
56  N100ALLUVL  Alluvial aquifers
    N100BSNRGB  Basin and Range basin-fill aquifers
04  N100BSNRGB  Basin and Range basin-fill aquifers
06  N100BSNRGB  Basin and Range basin-fill aquifers
16  N100BSNRGB  Basin and Range basin-fill aquifers
32  N100BSNRGB  Basin and Range basin-fill aquifers
35  N100BSNRGB  Basin and Range basin-fill aquifers
41  N100BSNRGB  Basin and Range basin-fill aquifers
49  N100BSNRGB  Basin and Range basin-fill aquifers
    N100CACSTL  California Coastal Basin aquifers
06  N100CACSTL  California Coastal Basin aquifers
    N100CMBPLB  Columbia Plateau basin-fill aquifers
16  N100CMBPLB  Columbia Plateau basin-fill aquifers
41  N100CMBPLB  Columbia Plateau basin-fill aquifers
53  N100CMBPLB  Columbia Plateau basin-fill aquifers
    N100GLCIAL  Sand and gravel aquifers (glaciated regions)
09  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
17  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
18  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
19  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
20  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
21  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
23  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
25  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
26  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
27  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
29  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
30  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
31  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
33  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
34  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
36  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
38  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
39  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
42  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
44  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
46  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
50  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
55  N100GLCIAL  Sand and gravel aquifers (glaciated regions)
    N100HGHPLN  High Plains aquifer
08  N100HGHPLN  High Plains aquifer
20  N100HGHPLN  High Plains aquifer
31  N100HGHPLN  High Plains aquifer
35  N100HGHPLN  High Plains aquifer
40  N100HGHPLN  High Plains aquifer
46  N100HGHPLN  High Plains aquifer
48  N100HGHPLN  High Plains aquifer
56  N100HGHPLN  High Plains aquifer
    N100MSRVVL  Mississippi River Valley alluvial aquifer
05  N100MSRVVL  Mississippi River Valley alluvial aquifer
17  N100MSRVVL  Mississippi River Valley alluvial aquifer
21  N100MSRVVL  Mississippi River Valley alluvial aquifer
22  N100MSRVVL  Mississippi River Valley alluvial aquifer
28  N100MSRVVL  Mississippi River Valley alluvial aquifer
29  N100MSRVVL  Mississippi River Valley alluvial aquifer
47  N100MSRVVL  Mississippi River Valley alluvial aquifer
    N100PCFNWB  Pacific Northwest basin-fill aquifers
06  N100PCFNWB  Pacific Northwest basin-fill aquifers
16  N100PCFNWB  Pacific Northwest basin-fill aquifers
32  N100PCFNWB  Pacific Northwest basin-fill aquifers
41  N100PCFNWB  Pacific Northwest basin-fill aquifers
49  N100PCFNWB  Pacific Northwest basin-fill aquifers
53  N100PCFNWB  Pacific Northwest basin-fill aquifers
56  N100PCFNWB  Pacific Northwest basin-fill aquifers
    N100PCFNWV  Pacific Northwest volcanic-rock aquifers
06  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
16  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
30  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
32  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
41  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
49  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
53  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
56  N100PCFNWV  Pacific Northwest volcanic-rock aquifers
    N100PCSRVR  Pecos River Basin alluvial aquifer
35  N100PCSRVR  Pecos River Basin alluvial aquifer
48  N100PCSRVR  Pecos River Basin alluvial aquifer
    N100SYMOUR  Seymour aquifer
48  N100SYMOUR  Seymour aquifer
    N100WLMLWD  Willamette Lowland basin-fill aquifers
41  N100WLMLWD  Willamette Lowland basin-fill aquifers
53  N100WLMLWD  Willamette Lowland basin-fill aquifers
    N300ADAVMS  Ada-Vamoosa aquifer
40  N300ADAVMS  Ada-Vamoosa aquifer
    N300CNRLOK  Central Oklahoma aquifer
40  N300CNRLOK  Central Oklahoma aquifer
    N300COPLTS  Colorado Plateaus aquifers
04  N300COPLTS  Colorado Plateaus aquifers
08  N300COPLTS  Colorado Plateaus aquifers
35  N300COPLTS  Colorado Plateaus aquifers
49  N300COPLTS  Colorado Plateaus aquifers
56  N300COPLTS  Colorado Plateaus aquifers
    N300ERLMZC  Early Mesozoic basin aquifers
09  N300ERLMZC  Early Mesozoic basin aquifers
24  N300ERLMZC  Early Mesozoic basin aquifers
25  N300ERLMZC  Early Mesozoic basin aquifers
34  N300ERLMZC  Early Mesozoic basin aquifers
36  N300ERLMZC  Early Mesozoic basin aquifers
37  N300ERLMZC  Early Mesozoic basin aquifers
42  N300ERLMZC  Early Mesozoic basin aquifers
51  N300ERLMZC  Early Mesozoic basin aquifers
    N300JCBSVL  Jacobsville aquifer
26  N300JCBSVL  Jacobsville aquifer
55  N300JCBSVL  Jacobsville aquifer
    N300LCRTCS  Lower Cretaceous aquifers
19  N300LCRTCS  Lower Cretaceous aquifers
20  N300LCRTCS  Lower Cretaceous aquifers
27  N300LCRTCS  Lower Cretaceous aquifers
30  N300LCRTCS  Lower Cretaceous aquifers
31  N300LCRTCS  Lower Cretaceous aquifers
38  N300LCRTCS  Lower Cretaceous aquifers
46  N300LCRTCS  Lower Cretaceous aquifers
56  N300LCRTCS  Lower Cretaceous aquifers
    N300LTRTRY  Lower Tertiary aquifers
30  N300LTRTRY  Lower Tertiary aquifers
38  N300LTRTRY  Lower Tertiary aquifers
46  N300LTRTRY  Lower Tertiary aquifers
56  N300LTRTRY  Lower Tertiary aquifers
    N300MRSHLL  Marshall aquifer
26  N300MRSHLL  Marshall aquifer
    N300NYSDSN  New York sandstone aquifers
36  N300NYSDSN  New York sandstone aquifers
    N300PNSLVN  Pennsylvanian aquifers
01  N300PNSLVN  Pennsylvanian aquifers
13  N300PNSLVN  Pennsylvanian aquifers
17  N300PNSLVN  Pennsylvanian aquifers
18  N300PNSLVN  Pennsylvanian aquifers
21  N300PNSLVN  Pennsylvanian aquifers
24  N300PNSLVN  Pennsylvanian aquifers
26  N300PNSLVN  Pennsylvanian aquifers
39  N300PNSLVN  Pennsylvanian aquifers
42  N300PNSLVN  Pennsylvanian aquifers
47  N300PNSLVN  Pennsylvanian aquifers
51  N300PNSLVN  Pennsylvanian aquifers
54  N300PNSLVN  Pennsylvanian aquifers
    N300RSHSPG  Rush Springs aquifer
40  N300RSHSPG  Rush Springs aquifer
    N300STHCST  South Coast aquifer (Puerto Rico)
72  N300STHCST  South Coast aquifer (Puerto Rico)
    N300UPCTCS  Upper Cretaceous aquifers
30  N300UPCTCS  Upper Cretaceous aquifers
38  N300UPCTCS  Upper Cretaceous aquifers
46  N300UPCTCS  Upper Cretaceous aquifers
56  N300UPCTCS  Upper Cretaceous aquifers
    N300WYTRTR  Wyoming Tertiary aquifers
56  N300WYTRTR  Wyoming Tertiary aquifers
    N400ABKSMP  Arbuckle-Simpson aquifer
40  N400ABKSMP  Arbuckle-Simpson aquifer
    N400BISCYN  Biscayne aquifer
12  N400BISCYN  Biscayne aquifer
    N400BLAINE  Blaine aquifer
40  N400BLAINE  Blaine aquifer
48  N400BLAINE  Blaine aquifer
    N400BSNRGC  Basin and Range carbonate-rock aquifers
04  N400BSNRGC  Basin and Range carbonate-rock aquifers
06  N400BSNRGC  Basin and Range carbonate-rock aquifers
16  N400BSNRGC  Basin and Range carbonate-rock aquifers
32  N400BSNRGC  Basin and Range carbonate-rock aquifers
49  N400BSNRGC  Basin and Range carbonate-rock aquifers
    N400CSLHYN  Castle Hayne aquifer
37  N400CSLHYN  Castle Hayne aquifer
    N400KNGSHL  Kingshill aquifer (Virgin Islands)
78  N400KNGSHL  Kingshill aquifer (Virgin Islands)
    N400NCSTLM  North Coast Limestone aquifer system (Puerto Rico)
72  N400NCSTLM  North Coast Limestone aquifer system (Puerto Rico)
    N400NYNECB  New York and New England carbonate-rock aquifers
09  N400NYNECB  New York and New England carbonate-rock aquifers
23  N400NYNECB  New York and New England carbonate-rock aquifers
25  N400NYNECB  New York and New England carbonate-rock aquifers
34  N400NYNECB  New York and New England carbonate-rock aquifers
36  N400NYNECB  New York and New England carbonate-rock aquifers
42  N400NYNECB  New York and New England carbonate-rock aquifers
50  N400NYNECB  New York and New England carbonate-rock aquifers
    N400ORDVCN  Ordovician aquifers
21  N400ORDVCN  Ordovician aquifers
47  N400ORDVCN  Ordovician aquifers
    N400PDMBRC  Piedmont and Blue Ridge carbonate-rock aquifers
24  N400PDMBRC  Piedmont and Blue Ridge carbonate-rock aquifers
34  N400PDMBRC  Piedmont and Blue Ridge carbonate-rock aquifers
37  N400PDMBRC  Piedmont and Blue Ridge carbonate-rock aquifers
42  N400PDMBRC  Piedmont and Blue Ridge carbonate-rock aquifers
    N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
01  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
10  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
11  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
13  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
24  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
34  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
36  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
37  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
42  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
45  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
47  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
51  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
54  N400PDMBRX  Piedmont and Blue Ridge crystalline-rock aquifers
    N400SLRDVN  Silurian-Devonian aquifers
17  N400SLRDVN  Silurian-Devonian aquifers
18  N400SLRDVN  Silurian-Devonian aquifers
19  N400SLRDVN  Silurian-Devonian aquifers
21  N400SLRDVN  Silurian-Devonian aquifers
26  N400SLRDVN  Silurian-Devonian aquifers
29  N400SLRDVN  Silurian-Devonian aquifers
39  N400SLRDVN  Silurian-Devonian aquifers
47  N400SLRDVN  Silurian-Devonian aquifers
55  N400SLRDVN  Silurian-Devonian aquifers
    N400UPCRBN  Upper carbonate aquifer
19  N400UPCRBN  Upper carbonate aquifer
27  N400UPCRBN  Upper carbonate aquifer
    N500MSSPPI  Mississippian aquifers
01  N500MSSPPI  Mississippian aquifers
17  N500MSSPPI  Mississippian aquifers
18  N500MSSPPI  Mississippian aquifers
19  N500MSSPPI  Mississippian aquifers
21  N500MSSPPI  Mississippian aquifers
24  N500MSSPPI  Mississippian aquifers
29  N500MSSPPI  Mississippian aquifers
39  N500MSSPPI  Mississippian aquifers
42  N500MSSPPI  Mississippian aquifers
47  N500MSSPPI  Mississippian aquifers
51  N500MSSPPI  Mississippian aquifers
54  N500MSSPPI  Mississippian aquifers
    N500PLOZOC  Paleozoic aquifers
27  N500PLOZOC  Paleozoic aquifers
30  N500PLOZOC  Paleozoic aquifers
38  N500PLOZOC  Paleozoic aquifers
46  N500PLOZOC  Paleozoic aquifers
56  N500PLOZOC  Paleozoic aquifers
    N500VLYRDG  Valley and Ridge aquifers
01  N500VLYRDG  Valley and Ridge aquifers
13  N500VLYRDG  Valley and Ridge aquifers
24  N500VLYRDG  Valley and Ridge aquifers
34  N500VLYRDG  Valley and Ridge aquifers
36  N500VLYRDG  Valley and Ridge aquifers
37  N500VLYRDG  Valley and Ridge aquifers
42  N500VLYRDG  Valley and Ridge aquifers
47  N500VLYRDG  Valley and Ridge aquifers
51  N500VLYRDG  Valley and Ridge aquifers
54  N500VLYRDG  Valley and Ridge aquifers
    N600CMBPLV  Columbia Plateau basaltic-rock aquifers
16  N600CMBPLV  Columbia Plateau basaltic-rock aquifers
41  N600CMBPLV  Columbia Plateau basaltic-rock aquifers
53  N600CMBPLV  Columbia Plateau basaltic-rock aquifers
    N600HIVLCC  Hawaii volcanic-rock aquifers
15  N600HIVLCC  Hawaii volcanic-rock aquifers
    N600NECRSN  New York and New England crystalline-rock aquifers
09  N600NECRSN  New England crystalline-rock aquifers
23  N600NECRSN  New England crystalline-rock aquifers
25  N600NECRSN  New England crystalline-rock aquifers
33  N600NECRSN  New England crystalline-rock aquifers
36  N600NECRSN  New England crystalline-rock aquifers
44  N600NECRSN  New England crystalline-rock aquifers
50  N600NECRSN  New England crystalline-rock aquifers
    N600SKRVPB  Snake River Plain basin-fill aquifers
16  N600SKRVPB  Snake River Plain basin-fill aquifers
41  N600SKRVPB  Snake River Plain basin-fill aquifers
    N600SKRVPV  Snake River Plain basaltic-rock aquifers
16  N600SKRVPV  Snake River Plain basaltic-rock aquifers
41  N600SKRVPV  Snake River Plain basaltic-rock aquifers
    N600SRNVDV  Southern Nevada volcanic-rock aquifers
32  N600SRNVDV  Southern Nevada volcanic-rock aquifers
    N9999OTHER  Other aquifers
00  N9999OTHER  Other aquifers
01  N9999OTHER  Other aquifers
02  N9999OTHER  Other aquifers
04  N9999OTHER  Other aquifers
05  N9999OTHER  Other aquifers
06  N9999OTHER  Other aquifers
08  N9999OTHER  Other aquifers
09  N9999OTHER  Other aquifers
10  N9999OTHER  Other aquifers
11  N9999OTHER  Other aquifers
12  N9999OTHER  Other aquifers
13  N9999OTHER  Other aquifers
15  N9999OTHER  Other aquifers
16  N9999OTHER  Other aquifers
17  N9999OTHER  Other aquifers
18  N9999OTHER  Other aquifers
19  N9999OTHER  Other aquifers
20  N9999OTHER  Other aquifers
21  N9999OTHER  Other aquifers
22  N9999OTHER  Other aquifers
23  N9999OTHER  Other aquifers
24  N9999OTHER  Other aquifers
25  N9999OTHER  Other aquifers
26  N9999OTHER  Other aquifers
27  N9999OTHER  Other aquifers
28  N9999OTHER  Other aquifers
29  N9999OTHER  Other aquifers
30  N9999OTHER  Other aquifers
31  N9999OTHER  Other aquifers
32  N9999OTHER  Other aquifers
33  N9999OTHER  Other aquifers
34  N9999OTHER  Other aquifers
35  N9999OTHER  Other aquifers
36  N9999OTHER  Other aquifers
37  N9999OTHER  Other aquifers
38  N9999OTHER  Other aquifers
39  N9999OTHER  Other aquifers
40  N9999OTHER  Other aquifers
41  N9999OTHER  Other aquifers
42  N9999OTHER  Other aquifers
44  N9999OTHER  Other aquifers
45  N9999OTHER  Other aquifers
46  N9999OTHER  Other aquifers
47  N9999OTHER  Other aquifers
48  N9999OTHER  Other aquifers
49  N9999OTHER  Other aquifers
50  N9999OTHER  Other aquifers
51  N9999OTHER  Other aquifers
53  N9999OTHER  Other aquifers
54  N9999OTHER  Other aquifers
55  N9999OTHER  Other aquifers
56  N9999OTHER  Other aquifers
60  N9999OTHER  Other aquifers
62  N9999OTHER  Other aquifers
66  N9999OTHER  Other aquifers
67  N9999OTHER  Other aquifers
69  N9999OTHER  Other aquifers
71  N9999OTHER  Other aquifers
72  N9999OTHER  Other aquifers
73  N9999OTHER  Other aquifers
74  N9999OTHER  Other aquifers
75  N9999OTHER  Other aquifers
76  N9999OTHER  Other aquifers
77  N9999OTHER  Other aquifers
78  N9999OTHER  Other aquifers
79  N9999OTHER  Other aquifers
    S100CNRLVL  Central Valley aquifer system
06  S100CNRLVL  Central Valley aquifer system
    S100CSLLWD  Coastal lowlands aquifer system
01  S100CSLLWD  Coastal lowlands aquifer system
12  S100CSLLWD  Coastal lowlands aquifer system
22  S100CSLLWD  Coastal lowlands aquifer system
28  S100CSLLWD  Coastal lowlands aquifer system
48  S100CSLLWD  Coastal lowlands aquifer system
    S100MSEMBM  Mississippi embayment aquifer system
01  S100MSEMBM  Mississippi embayment aquifer system
05  S100MSEMBM  Mississippi embayment aquifer system
17  S100MSEMBM  Mississippi embayment aquifer system
21  S100MSEMBM  Mississippi embayment aquifer system
22  S100MSEMBM  Mississippi embayment aquifer system
28  S100MSEMBM  Mississippi embayment aquifer system
29  S100MSEMBM  Mississippi embayment aquifer system
47  S100MSEMBM  Mississippi embayment aquifer system
48  S100MSEMBM  Mississippi embayment aquifer system
    S100NATLCP  Northern Atlantic Coastal Plain aquifer system
10  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
11  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
24  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
34  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
36  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
37  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
42  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
51  S100NATLCP  Northern Atlantic Coastal Plain aquifer system
    S100NRMTIB  Northern Rocky Mountains Intermontane Basins aquifer systems
16  S100NRMTIB  Northern Rocky Mountains Intermontane Basins aquifer systems
30  S100NRMTIB  Northern Rocky Mountains Intermontane Basins aquifer systems
53  S100NRMTIB  Northern Rocky Mountains Intermontane Basins aquifer systems
56  S100NRMTIB  Northern Rocky Mountains Intermontane Basins aquifer systems
    S100PGTSND  Puget Sound aquifer system
53  S100PGTSND  Puget Sound aquifer system
    S100RIOGRD  Rio Grande aquifer system
08  S100RIOGRD  Rio Grande aquifer system
35  S100RIOGRD  Rio Grande aquifer system
48  S100RIOGRD  Rio Grande aquifer system
    S100SECSLP  Southeastern Coastal Plain aquifer system
01  S100SECSLP  Southeastern Coastal Plain aquifer system
13  S100SECSLP  Southeastern Coastal Plain aquifer system
28  S100SECSLP  Southeastern Coastal Plain aquifer system
45  S100SECSLP  Southeastern Coastal Plain aquifer system
47  S100SECSLP  Southeastern Coastal Plain aquifer system
    S100SURFCL  Surficial aquifer system
01  S100SURFCL  Surficial aquifer system
12  S100SURFCL  Surficial aquifer system
13  S100SURFCL  Surficial aquifer system
37  S100SURFCL  Surficial aquifer system
45  S100SURFCL  Surficial aquifer system
    S100TXCLUP  Texas coastal uplands aquifer system"""
MOCK_AQFR_CD_DATA = """#
# National Water Information System
# 2018/01/19
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
state_cd    aqfr_cd aqfr_nm
2s  8s  70s
00  200CRSL Crystalline Rocks
01  100CNZC Cenozoic Erathem
01  110QRNR Quaternary System
01  110QRRT Quaternary-Tertiary Systems
01  111ALVM Holocene Alluvium
01  111CSTL Coastal Deposits
01  111HCPC Holocene-Pleistocene Series
01  111HLCN Holocene Series
01  111LTAV Low Terrace Deposits, Alluvium
01  111RGLT Regolith
01  111RSDM Residuum
01  111SPRL Saprolite
01  112HGTC High Terrace Deposits
01  112IMTC Intermediate Terrace Deposits
01  112LTRC Low Terrace Deposits
01  112PLSC Pleistocene Series
01  112TRRC Terrace Deposits
01  120TRCC Tertiary-Cretaceous Systems
01  120TRTR Tertiary System
01  120UTRTR    Tertiary System
01  121CRNL Citronelle Formation
01  121PLCN Pliocene Series
01  122CTHL Catahoula Sandstone
01  122CTHLS    Catahoula Sandstone
01  122MCEC Miocene-Eocene Series
01  122MOCN Miocene Series
01  122PHMK Paynes Hammock Sand
01  122RSDM Residuum-South Alabama
01  123BCTN Bucatunna Clay Member of Byram Formation
01  123BYRM Byram Formation
01  123CCKS Chickasawhay Limestone
01  123FRHL Forest Hill Sand
01  123GLND Glendon Limestone Member of Byram Formation"""
MOCK_STAT_CD_DATA = """#
# National Water Information System
# 2018/01/22
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
stat_CD	stat_NM	stat_DS
5s	19s	34s
00001	MAXIMUM	MAXIMUM VALUES
00002	MINIMUM	MINIMUM VALUES
00003	MEAN	MEAN VALUES
00004	AM	VALUES TAKEN BETWEEN 0001 AND 1200
00005	PM	VALUES TAKEN BETWEEN 1201 AND 2400
00006	SUM	SUMMATION VALUES
00007	MODE	MODAL VALUES
00008	MEDIAN	MEDIAN VALUES
00009	STD	STANDARD DEVIATION VALUES
00010	VARIANCE	VARIANCE VALUES
00011	INSTANTANEOUS	RANDOM INSTANTANEOUS VALUES
00012	EQUIVALENT MEAN	EQUIVALENT MEAN VALUES
00013	SKEWNESS	SKEWNESS VALUES
00021	TIDAL HIGH-HIGH	TIDAL HIGH-HIGH VALUES
00022	TIDAL LOW-HIGH	TIDAL LOW-HIGH VALUES
00023	TIDAL HIGH-LOW	TIDAL HIGH-LOW VALUES
00024	TIDAL LOW-LOW	TIDAL LOW-LOW VALUES
01001	0.1 PERCENTILE	0.1 PERCENTILE
01002	0.2 PERCENTILE	0.2 PERCENTILE
01003	0.3 PERCENTILE	0.3 PERCENTILE
01004	0.4 PERCENTILE	0.4 PERCENTILE
01005	0.5 PERCENTILE	0.5 PERCENTILE
01006	0.6 PERCENTILE	0.6 PERCENTILE
01007	0.7 PERCENTILE	0.7 PERCENTILE
01008	0.8 PERCENTILE	0.8 PERCENTILE
01009	0.9 PERCENTILE	0.9 PERCENTILE
01010	1.0 PERCENTILE	1.0 PERCENTILE
01011	1.1 PERCENTILE	1.1 PERCENTILE
01012	1.2 PERCENTILE	1.2 PERCENTILE
01013	1.3 PERCENTILE	1.3 PERCENTILE
01014	1.4 PERCENTILE	1.4 PERCENTILE
01015	1.5 PERCENTILE	1.5 PERCENTILE
01016	1.6 PERCENTILE	1.6 PERCENTILE
01017	1.7 PERCENTILE	1.7 PERCENTILE
01018	1.8 PERCENTILE	1.8 PERCENTILE"""
MOCK_MEDIUM_CD_DATA = """#
# National Water Information System
# 2018/01/22
#
#
# Date Retrieved: USGS Water Data for the Nation Help System
#
medium_cd	medium_nm	medium_ds	medium_lgcy_cd
3s	32s	424s	1s
WS	Surface water	Water on the surface of the Earth stored or transported in rivers, streams, estuaries, lakes, ponds, swamps, glaciers, or other aquatic areas. It also may refer to water in urban drains and storm-sewer systems.	9
WG	Groundwater	Water below the surface of the Earth contained in the saturated zone. It does not include soil moisture or interstitial water.	6
WW	Wet deposition	Water reaching the Earth's surface through precipitation as rain, snow, sleet, hail, or condensation of fog and dew. The water may contain undissolved particulate and gaseous materials acquired from the atmosphere during precipitation.	7
WI	Interstitial water	Water occuring in the small openings, spaces, pores, and voids between particles of unconsolidated materials. Includes water found in the interstices of shallow sediments of a lake, wetland, reservoir, or stream, and in the vadose zone between the root zone and the water table. The water is held in place by entrapment, ionic attraction, and capillary or adhesive forces, rather than from pressure components of saturation.	F"""