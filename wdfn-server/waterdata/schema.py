"""
GraphQL API Schema for WDFN and its related functions
"""
from collections import namedtuple, defaultdict
from datetime import datetime
import json
# import pprint

from graphene import ObjectType, String, ID, List, Field, Int
import requests

from . import app
from .services.nwis import NwisWebServices
from .utils import parse_rdb


SERVICE_ROOT = app.config['SERVER_SERVICE_ROOT']
NWIS = NwisWebServices(SERVICE_ROOT)


def _json_object_hook(data):
    return namedtuple('X', data.keys())(*data.values())


def json2obj(data):
    """
    Return a json string to python object
    """
    return json.loads(data, object_hook=_json_object_hook)


def get_period_of_record_by_parm_cd_datatype(site_records):
    """
    Returns a dictionary of period of record for each parameter and its datatype
    """
    records_by_parm_cd = {}
    # print("########site_records#####")
    # print(json.dumps(site_records))
    for record in site_records:
        this_parm_cd = record['parm_cd']
        if this_parm_cd not in records_by_parm_cd:
            records_by_parm_cd[this_parm_cd] = defaultdict(dict)
        if not records_by_parm_cd[this_parm_cd][record['data_type_cd']]:
            records_by_parm_cd[this_parm_cd][record['data_type_cd']] = {
                "begin_date": record['begin_date'],
                "end_date": record['end_date'],
                "count": int(record['count_nu'])
            }
        else:
            date_format = '%Y-%m-%d'
            if (datetime.strptime(record['begin_date'], date_format)
                    < datetime.strptime(records_by_parm_cd[this_parm_cd][record['data_type_cd']]['begin_date'],
                                        date_format)):
                records_by_parm_cd[this_parm_cd][record['data_type_cd']]['begin_date'] = record['begin_date']
            if (datetime.strptime(record['end_date'], date_format)
                    > datetime.strptime(records_by_parm_cd[this_parm_cd][record['data_type_cd']]['end_date'],
                                        date_format)):
                records_by_parm_cd[this_parm_cd][record['data_type_cd']]['end_date'] = record['end_date']

            records_by_parm_cd[this_parm_cd][record['data_type_cd']]['count'] += int(record['count_nu'])

    return records_by_parm_cd


class DataType(ObjectType):
    # pylint: disable=R0903
    """
    DataType field
    """
    code = String()
    name = String()
    begin_date = String()
    end_date = String()
    count = Int()


class Parameter(ObjectType):
    # pylint: disable=R0903
    """
    Parameter field
    """
    name = String()
    begin_date = String()  # begin_date
    end_date = String()  # end_date
    group = String()  # parm_grp_cd
    code = String()  # parm_cd
    data_types = List(DataType)
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
    # pylint: disable=R0903
    """
    Monitoring location field
    """

    # These are the items from get_site_parameters
    # @TODO: Will look at get_site to see if we want additional items
    agency = String()  # agency_cd
    site_number = String()  # site_no
    name = String()  # station_nm
    site_type = String()  # site_tp_cd
    decimal_latitude = String()  # dec_lat_va
    decimal_longitude = String()  # dec_long_va
    coordinates_accuracy = String()  # coord_acy_cd
    decimal_coordinates_datum = String()  # dec_coord_datum_cd
    altitude = String()  # alt_va
    altitude_accuracy = String()  # alt_acy_va
    altitude_datum = String()  # alt_datum_cd
    HUC_eight_digit_code = String()  # huc_cd

    DMS_latitude = String()  # lat_va
    DMS_longititude = String()  # long_va
    coordinates_method = String()  # coord_meth_cd
    coordinates_datum = String()  # coord_datum_cd
    district = String()  # district_cd
    state_cd = String()  # state_cd
    county = String()  # county_cd
    country = String()  # country_cd
    land_net_location_desc = String()  # lang_net_ds
    map_name = String()  # map_nm
    map_scale = String()  # map_scale_fc
    altitude_method = String()  # alt_meth_cd
    basin_code = String()  # basin_cd
    topographic_setting = String()  # topo_cd
    instruments = String()  # instruments_cd
    construction_date = String()  # construction_dt
    inventory_date = String()  # inventory_dt
    drain_area = String()  # drain_area_va
    contributing_drain_area = String()  # contrib_drain_area_va
    time_zone = String()  # tz_cd
    honor_daylight_savings = String()  # local_time_fg
    reliability = String()  # reliability_cd
    GW_file = String()  # gw_file_cd
    national_aquifer = String()  # nat_aqfr_cd
    aquifer = String()  # aqfr_cd
    aquifer_type = String()  # aqfr_type_cd
    well_depth = String()  # well_depth_va
    hole_depth = String()  # hole_depth_va
    depth_source = String()  # depth_src_cd
    project_number = String()  # project_no

    parameters = List(Parameter)


class Properties(ObjectType):
    # pylint: disable=R0903
    """
    Properties field for Feature
    """
    MonitoringLocationName = String()
    ProviderName = String()
    OrganizationIdentifier = String()
    OrganizationFormalName = String()
    MonitoringLocationIdentifier = ID()
    MonitoringLocationTypeName = String()
    ResolvedMonitoringLocationTypeName = String()
    HUCEightDigitCode = String()
    siteUrl = String()
    activityCount = String()
    resultCount = String()
    stateName = String()


class Geometry(ObjectType):
    # pylint: disable=R0903
    """
    Geometry field for Feature
    """
    coordinates = List(String)


class Feature(ObjectType):
    # pylint: disable=R0903
    """
    Feature field for Monitoring Location
    """
    geometry = Field(Geometry)
    properties = Field(Properties)


class AllFeatures(ObjectType):
    # pylint: disable=R0903
    """
    A list of features with count
    """
    count = Int()
    features = List(Feature)


class Query(ObjectType):
    """
    Queries
    """
    all_features = Field(AllFeatures,
                         site_type=List(String),
                         providers=List(String),
                         bBox=String(),
                         startDateLo=String(),
                         startDateHi=String(),
                         pCode=List(String))

    def resolve_all_features(parent,
                             info,
                             **kwargs):
        # pylint: disable=E0213,W0613,R0201
        """
        Resolver for All Features
        """
        url = 'https://www.waterqualitydata.us/data/Station/search?mimeType=geojson'
        data = kwargs
        resp = requests.post(url=url, data=data)
        features = json.dumps(resp.json()['features'])
        features_obj = json2obj(features)
        return {"count": len(features_obj), "features": features_obj}

    monitoring_location = Field(MonitoringLocation, site_no=String())

    @staticmethod
    def get_site_properties_from_get_site_parameters(site_no, agency="USGS"):
        """
        Get site properties from the NWIS.get_site_parameters function and return a dictionary
        """
        data = NWIS.get_site_parameters(site_no, agency)
        # print("**********period of record with gaps***********")
        period_of_record = get_period_of_record_by_parm_cd_datatype(data)
        # print(json.dumps(period_of_record))

        parameters = []
        for pcode in period_of_record:
            pcode_properties = app.config['NWIS_CODE_LOOKUP']["parm_cd"].get(pcode, {})
            pcode_properties["data_types"] = []
            pcode_properties.update({"code": pcode})
            for data_type in period_of_record[pcode]:
                d_t_properties = app.config['NWIS_CODE_LOOKUP']["data_type_cd"].get(data_type, {})
                d_t_properties.update({"code": data_type})
                d_t_properties.update(period_of_record[pcode][data_type])
                pcode_properties["data_types"].append(d_t_properties)

            parameters.append(pcode_properties)

        result = {}
        # Just use one entry because the monitoring location properties are the same
        prop = data[0]
        result["agency"] = app.config['NWIS_CODE_LOOKUP']["agency_cd"][prop["agency_cd"]]
        result["site_number"] = prop["site_no"]
        result["name"] = prop["station_nm"]
        result["site_type"] = app.config['NWIS_CODE_LOOKUP']["site_tp_cd"][prop["site_tp_cd"]]["name"]
        result["decimal_latitude"] = prop["dec_lat_va"]
        result["decimal_longitude"] = prop["dec_long_va"]
        result["coordinates_accuracy"] = app.config['NWIS_CODE_LOOKUP']["coord_acy_cd"][prop["coord_acy_cd"]]["name"]
        result["decimal_coordinates_datum"] = (app.config['NWIS_CODE_LOOKUP']
                                               ["dec_coord_datum_cd"][prop["dec_coord_datum_cd"]]["name"])
        result["altitude"] = prop["alt_va"]
        result["altitude_accuracy"] = prop["alt_acy_va"]
        result["altitude_datum"] = app.config['NWIS_CODE_LOOKUP']["alt_datum_cd"][prop["alt_datum_cd"]]["name"]
        result["HUC_eight_digit_code"] = prop["huc_cd"]
        result["parameters"] = parameters

        return result

    @staticmethod
    def get_site_properties_from_get_site(site_no, agency="USGS"):
        """
        Get site properties from the NWIS.get_site function and return a dictionary
        """
        result = {}
        resp = NWIS.get_site(site_no, agency)
        if resp.status_code == 200:
            iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
            data_list = list(iter_data)
            # expecting one item here
            site_info = data_list[0]

        result["DMS_latitude"] = site_info["lat_va"]
        result["DMS_longititude"] = site_info["long_va"]
        result["coordinates_method"] = (app.config['NWIS_CODE_LOOKUP']["coord_meth_cd"]
                                        [site_info["coord_meth_cd"]]["name"])
        result["coordinates_datum"] = (app.config['NWIS_CODE_LOOKUP']["coord_datum_cd"]
                                       [site_info["coord_datum_cd"]]["name"])
        result["district"] = site_info["district_cd"]
        result["state"] = (app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                           [site_info["country_cd"]]["state_cd"][site_info["state_cd"]]
                           .get("name", site_info["state_cd"]))
        result["county"] = (app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                            [site_info["country_cd"]]["state_cd"][site_info["state_cd"]]
                            ["county_cd"][site_info["county_cd"]]["name"] if result["state"] else "")
        result["country"] = site_info["country_cd"]
        result["land_net_location_desc"] = site_info["land_net_ds"]
        result["map_name"] = site_info["map_nm"]
        result["map_scale"] = site_info["map_scale_fc"]
        result["altitude_method"] = (app.config['NWIS_CODE_LOOKUP']["alt_meth_cd"][site_info["alt_meth_cd"]]["name"]
                                     if site_info["alt_meth_cd"] else "")
        result["basin_code"] = site_info["basin_cd"]
        result["topographic_setting"] = (app.config['NWIS_CODE_LOOKUP']["topo_cd"][site_info["topo_cd"]]["name"]
                                         if site_info["topo_cd"] else "")
        result["instruments"] = site_info["instruments_cd"]
        result["construction_date"] = site_info["construction_dt"]
        result["inventory_date"] = site_info["inventory_dt"]
        result["drain_area"] = site_info["drain_area_va"]
        result["contributing_drain_area"] = site_info["contrib_drain_area_va"]
        result["time_zone"] = site_info["tz_cd"]
        result["honor_daylight_savings"] = site_info["local_time_fg"]
        result["reliability"] = (app.config['NWIS_CODE_LOOKUP']["reliability_cd"][site_info["reliability_cd"]]["name"]
                                 if site_info["reliability_cd"] else "")
        result["GW_file"] = site_info["gw_file_cd"]
        result["national_aquifer"] = (app.config['NWIS_CODE_LOOKUP']["nat_aqfr_cd"][site_info["nat_aqfr_cd"]]["name"]
                                      if site_info["nat_aqfr_cd"] else "")
        result["aquifer"] = (app.config['NWIS_CODE_LOOKUP']["aqfr_cd"][site_info["aqfr_cd"]]["name"]
                             if site_info["aqfr_cd"] else "")
        result["aquifer_type"] = (app.config['NWIS_CODE_LOOKUP']["aqfr_type_cd"][site_info["aqfr_type_cd"]]["name"]
                                  if site_info["aqfr_type_cd"] else "")
        result["well_depth"] = site_info["well_depth_va"]
        result["hole_depth"] = site_info["hole_depth_va"]
        result["depth_source"] = site_info["depth_src_cd"]
        result["project_number"] = site_info["project_no"]

        return result

    def resolve_monitoring_location(parent, info, site_no):
        # pylint: disable=E0213,W0613,R0201
        """
        Resolver for monitoring location
        """

        result = Query.get_site_properties_from_get_site_parameters(site_no)
        result.update(Query.get_site_properties_from_get_site(site_no))

        return result


# site_types:
# Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
# Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
# Spring; Stream; Subsurface; Well; Wetland

# startDateLo; startDateHi:
# mm-dd-yyyy
