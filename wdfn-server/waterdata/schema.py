import json
import os
import requests
import pprint
from graphene import ObjectType, String, Boolean, ID, List, Field, Int
from collections import namedtuple, defaultdict
from datetime import datetime, timedelta
from . import app
from .services.nwis import NwisWebServices
from .location_utils import get_period_of_record_by_parm_cd
from .utils import parse_rdb

SERVICE_ROOT = app.config['SERVER_SERVICE_ROOT']
NWIS = NwisWebServices(SERVICE_ROOT)

def _json_object_hook(d):
    return namedtuple('X', d.keys())(*d.values())


def json2obj(data):
    return json.loads(data, object_hook=_json_object_hook)

def get_period_of_record_with_gaps_by_parm_cd(site_records):
    records_by_parm_cd = {}
    # print("########site_records#####")
    # print(json.dumps(site_records))
    for record in site_records:
        this_parm_cd = record['parm_cd']
        if this_parm_cd not in records_by_parm_cd:
            records_by_parm_cd[this_parm_cd] = defaultdict(list)
        records_by_parm_cd[this_parm_cd][record['data_type_cd']].append(
            {"begin_date": record['begin_date'], "end_date": record['end_date']})

    return records_by_parm_cd

class Parameter(ObjectType):
    name = String()
    begin_date = String() # begin_date
    end_date = String() # end_date
    group = String() # parm_grp_cd
    code = String() # parm_cd
    # @TODO: Do we need any of these?
    # "data_type_cd"
    # "stat_cd"
    # "ts_id"
    # "loc_web_ds"
    # "medium_grp_cd"
    # "srs_id"
    # "access_cd"
    # "count_nu"

# @TODO: Should data from MonitoringLocation query different from AllFeatures query.  Maybe should be the same?
# @TODO: Do we want the code and description for some of these items?
class MonitoringLocation(ObjectType):

    # These are the items from get_site_parameters
    # @TODO: Will look at get_site to see if we want additional items
    agency = String() # agency_cd
    siteNumber = String() # site_no
    name = String() # station_nm
    siteType = String() # site_tp_cd
    decimalLatitude = String() # dec_lat_va
    decimalLongitude = String() # dec_long_va
    coordinatesAccuracy = String() # coord_acy_cd
    decimalCoordinatesDatum = String() # dec_coord_datum_cd
    altitude = String() # alt_va
    altitudeAccuracy = String() # alt_acy_va
    altitudeDatum = String() # alt_datum_cd
    HUCEightDigitCode = String() # huc_cd

    DMSLatitude = String() # lat_va
    DMSLongititude = String() # long_va
    coordinatesMethod = String() # coord_meth_cd
    coordinatesDatum = String() # coord_datum_cd
    district = String() # district_cd
    state_cd = String() # state_cd
    county = String() # county_cd
    country = String() # country_cd
    landNetLocationDesc = String() # lang_net_ds
    mapName = String() # map_nm
    mapScale = String() # map_scale_fc
    altitudeMethod = String() # alt_meth_cd
    basinCode = String() # basin_cd
    topographicSetting = String() # topo_cd
    instruments = String() # instruments_cd
    constructionDate = String() # construction_dt
    inventoryDate = String() # inventory_dt
    drainArea = String() # drain_area_va
    contributingDrainArea = String() # contrib_drain_area_va
    timeZone = String() # tz_cd
    honorDaylightSavings = String() # local_time_fg
    reliability = String() # reliability_cd
    GWFile = String() # gw_file_cd
    nationalAquifer = String() # nat_aqfr_cd
    aquifer = String() # aqfr_cd
    aquiferType = String() # aqfr_type_cd
    wellDepth = String() # well_depth_va
    holeDepth = String() # hole_depth_va
    depthSource = String() # depth_src_cd
    projectNumber = String() # project_no

    parameters = List(Parameter)


class Properties(ObjectType):
    MonitoringLocationName = String()
    ProviderName = String()
    OrganizationIdentifier = String()
    OrganizationFormalName = String()
    MonitoringLocationIdentifier = ID()
    MonitoringLocationName = String()
    MonitoringLocationTypeName = String()
    ResolvedMonitoringLocationTypeName = String()
    HUCEightDigitCode = String()
    siteUrl = String()
    activityCount = String()
    resultCount = String()
    StateName = String()


class Geometry(ObjectType):
    coordinates = List(String)


class Feature(ObjectType):
    geometry = Field(Geometry)
    properties = Field(Properties)


class AllFeatures(ObjectType):
    count = Int()
    features = List(Feature)


class Query(ObjectType):
    all_features = Field(AllFeatures,
                    siteType=List(String),
                    providers=List(String),
                    bBox=String(),
                    startDateLo=String(),
                    startDateHi=String(),
                    pCode=List(String))

    def resolve_all_features(self,
                             info,
                             **kwargs):
        url = 'https://www.waterqualitydata.us/data/Station/search?mimeType=geojson'
        five_years_ago = datetime.now() - timedelta(days=(365 * 5))
        five_years_ago = five_years_ago.strftime("%m-%d-%Y")
        # data = {"bBox": "-83,36.5,-81,38.5"}#, "characteristicName": ["Nitrate"]}
        data = kwargs
        # print(data)
        r = requests.post(url=url, data=data)
        features = json.dumps(r.json()['features'])
        features_obj = json2obj(features)
        return {"count": len(features_obj), "features": features_obj}

    features = List(Feature,
                    siteType=List(String),
                    providers=List(String),
                    bBox=String(),
                    startDateLo=String(),
                    startDateHi=String())

    def resolve_features(self,
                        info,
                        **kwargs):
        url = 'https://www.waterqualitydata.us/data/Station/search?mimeType=geojson'
        five_years_ago = datetime.now() - timedelta(days=(365 * 5))
        five_years_ago = five_years_ago.strftime("%m-%d-%Y")
        # data = {"bBox": "-83,36.5,-81,38.5"}#, "characteristicName": ["Nitrate"]}
        data = kwargs
        r = requests.post(url=url, data=data)
        features = json.dumps(r.json()['features'])
        return json2obj(features)


    monitoring_location = Field(MonitoringLocation, id=String())

    def resolve_monitoring_location(self, info, id):
        data = NWIS.get_site_parameters(id, "USGS")
        monitoring_location = json.dumps(data)
        pp = pprint.PrettyPrinter(indent=4)
        pp.pprint(json2obj(monitoring_location))
        # print("**********period of record with gaps***********")
        # print(json.dumps(get_period_of_record_with_gaps_by_parm_cd(data)))
        data_type = {d["data_type_cd"] for d in data}

        period_of_record = {}
        for dt in data_type:
            # @TODO: do we want to keep data type info?
            period_of_record.update(get_period_of_record_by_parm_cd(data, dt))

        parameters = []
        for pcode in period_of_record:
            pcode_properties = app.config['NWIS_CODE_LOOKUP']["parm_cd"].get(pcode, "")
            # print(pcode_properties)
            # print(period_of_record[pcode])
            period_of_record[pcode].update(pcode_properties)
            period_of_record[pcode].update({"code": pcode})
            parameters.append(period_of_record[pcode])

        result = {}
        # Just use one entry because the monitoring location properties are the same
        prop = data[0]
        result["agency"] = app.config['NWIS_CODE_LOOKUP']["agency_cd"][prop["agency_cd"]]
        result["siteNumber"] = prop["site_no"]
        result["name"] = prop["station_nm"]
        result["siteType"] = app.config['NWIS_CODE_LOOKUP']["site_tp_cd"][prop["site_tp_cd"]]["name"]
        result["decimalLatitude"] = prop["dec_lat_va"]
        result["decimalLongitude"] = prop["dec_long_va"]
        result["coordinatesAccuracy"] = app.config['NWIS_CODE_LOOKUP']["coord_acy_cd"][prop["coord_acy_cd"]]["name"]
        result["decimalCoordinatesDatum"] = app.config['NWIS_CODE_LOOKUP']["dec_coord_datum_cd"][prop["dec_coord_datum_cd"]]["name"]
        result["altitude"] = prop["alt_va"]
        result["altitudeAccuracy"] = prop["alt_acy_va"]
        result["altitudeDatum"] = app.config['NWIS_CODE_LOOKUP']["alt_datum_cd"][prop["alt_datum_cd"]]["name"]
        result["HUCEightDigitCode"] = prop["huc_cd"]
        result["parameters"] = parameters

        # get the rest of the site properties
        resp = NWIS.get_site(id, "USGS")
        if resp.status_code == 200:
            iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
            data_list = list(iter_data)
            # expecting one item here
            site_info = data_list[0]

        result["DMSLatitude"] = site_info["lat_va"]
        result["DMSLongititude"] = site_info["long_va"]
        result["coordinatesMethod"] = app.config['NWIS_CODE_LOOKUP']["coord_meth_cd"][site_info["coord_meth_cd"]]["name"]
        result["coordinatesDatum"] =  app.config['NWIS_CODE_LOOKUP']["coord_datum_cd"][site_info["coord_datum_cd"]]["name"]
        result["district"] = site_info["district_cd"]
        result["state"] = app.config['COUNTRY_STATE_COUNTY_LOOKUP'][site_info["country_cd"]]["state_cd"][site_info["state_cd"]].get("name", site_info["state_cd"])
        result["county"] = app.config['COUNTRY_STATE_COUNTY_LOOKUP'][site_info["country_cd"]]["state_cd"][site_info["state_cd"]]["county_cd"][site_info["county_cd"]]["name"] if result["state"] else ""
        result["country"] = site_info["country_cd"]
        result["landNetLocationDesc"] = site_info["land_net_ds"]
        result["mapName"] = site_info["map_nm"]
        result["mapScale"] = site_info["map_scale_fc"]
        result["altitudeMethod"] = app.config['NWIS_CODE_LOOKUP']["alt_meth_cd"][site_info["alt_meth_cd"]]["name"] if site_info["alt_meth_cd"] else ""
        result["basinCode"] = site_info["basin_cd"]
        result["topographicSetting"] = app.config['NWIS_CODE_LOOKUP']["topo_cd"][site_info["topo_cd"]]["name"] if site_info["topo_cd"] else ""
        result["instruments"] = site_info["instruments_cd"]
        result["constructionDate"] = site_info["construction_dt"]
        result["inventoryDate"] = site_info["inventory_dt"]
        result["drainArea"] = site_info["drain_area_va"]
        result["contributingDrainArea"] = site_info["contrib_drain_area_va"]
        result["timeZone"] = site_info["tz_cd"]
        result["honorDaylightSavings"] = site_info["local_time_fg"]
        result["reliability"] = app.config['NWIS_CODE_LOOKUP']["reliability_cd"][site_info["reliability_cd"]]["name"] if site_info["reliability_cd"] else ""
        result["GWFile"] = site_info["gw_file_cd"]
        result["nationalAquifer"] = app.config['NWIS_CODE_LOOKUP']["nat_aqfr_cd"][site_info["nat_aqfr_cd"]]["name"] if site_info["nat_aqfr_cd"] else ""
        result["aquifer"] = app.config['NWIS_CODE_LOOKUP']["aqfr_cd"][site_info["aqfr_cd"]]["name"] if site_info["aqfr_cd"] else ""
        result["aquiferType"] = app.config['NWIS_CODE_LOOKUP']["aqfr_type_cd"][site_info["aqfr_type_cd"]]["name"] if site_info["aqfr_type_cd"] else ""
        result["wellDepth"] = site_info["well_depth_va"]
        result["holeDepth"] = site_info["hole_depth_va"]
        result["depthSource"] = site_info["depth_src_cd"]
        result["projectNumber"] = site_info["project_no"]

        return result


# siteTypes:
# Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
# Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
# Spring; Stream; Subsurface; Well; Wetland

# startDateLo; startDateHi:
# mm-dd-yyyy
