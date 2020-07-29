from . import app
from graphene import ObjectType, String, Boolean, ID, List, Field, Int
import json
import os
from collections import namedtuple
from datetime import datetime, timedelta
from .services.nwis import NwisWebServices
from .location_utils import get_period_of_record_by_parm_cd
import requests
import pprint

SERVICE_ROOT = app.config['SERVER_SERVICE_ROOT']
NWIS = NwisWebServices(SERVICE_ROOT)

def _json_object_hook(d):
    return namedtuple('X', d.keys())(*d.values())


def json2obj(data):
    return json.loads(data, object_hook=_json_object_hook)


class Parameter(ObjectType):
    name = String()
    begin_date = String()
    end_date = String()
    group = String()
    code = String()

class MonitoringLocation(ObjectType):
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
            # do we want to keep data type info?
            period_of_record.update(get_period_of_record_by_parm_cd(data, dt))

        parameters = []
        for pcode in period_of_record:
            pcode_properties = app.config['NWIS_CODE_LOOKUP']["parm_cd"].get(pcode, "")
            period_of_record[pcode].update(pcode_properties)
            period_of_record[pcode].update({"code": pcode})
            parameters.append(period_of_record[pcode])

        return { "parameters": parameters }


# siteTypes:
# Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
# Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
# Spring; Stream; Subsurface; Well; Wetland

# startDateLo; startDateHi:
# mm-dd-yyyy
