import json
import os
import requests
import pprint
from graphene import ObjectType, String, Boolean, ID, List, Field, Int
from collections import namedtuple
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
                    startDateHi=String())

    def resolve_all_features(self,
                             info,
                             **kwargs):
        url = 'https://www.waterqualitydata.us/data/Station/search?mimeType=geojson'
        five_years_ago = datetime.now() - timedelta(days=(365 * 5))
        five_years_ago = five_years_ago.strftime("%m-%d-%Y")
        # data = {"bBox": "-83,36.5,-81,38.5"}#, "characteristicName": ["Nitrate"]}
        data = kwargs
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

        data_type = {d["data_type_cd"] for d in data}

        period_of_record = {}
        for dt in data_type:
            # @TODO: do we want to keep data type info?
            period_of_record.update(get_period_of_record_by_parm_cd(data, dt))

        parameters = []
        for pcode in period_of_record:
            pcode_properties = app.config['NWIS_CODE_LOOKUP']["parm_cd"].get(pcode, "")
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
        return result


# siteTypes:
# Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
# Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
# Spring; Stream; Subsurface; Well; Wetland

# startDateLo; startDateHi:
# mm-dd-yyyy
