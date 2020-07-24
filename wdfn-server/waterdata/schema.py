from graphene import ObjectType, String, Boolean, ID, List, Field, Int
import json
import os
from collections import namedtuple
from datetime import datetime, timedelta
import requests


def _json_object_hook(d):
    return namedtuple('X', d.keys())(*d.values())


def json2obj(data):
    return json.loads(data, object_hook=_json_object_hook)


class Properties(ObjectType):
    MonitoringLocationName = String()
    ProviderName = String()
    OrganizationIdentifier = String()
    OrganizationFormalName = String()
    MonitoringLocationIdentifier = String()
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


class Query(ObjectType):
    features = List(Feature,
                    siteType=List(String),
                    bBox=String(),
                    startDateLo=String(),
                    startDateHi=String())

    def resolve_features(self,
                        info,
                        **kwargs):
        url = 'https://www.waterqualitydata.us/data/Station/search?mimeType=geojson'
        five_years_ago = datetime.now() - timedelta(days=(365 * 5))
        five_years_ago = five_years_ago.strftime("%m-%d-%Y")
        # data = {"bBox": "-83,36.5,-81,38.5", "characteristicName": ["Nitrate"]}
        data = kwargs
        r = requests.post(url=url, data=data)
        features = json.dumps(r.json()['features'])
        return json2obj(features)

# siteTypes:
# Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
# Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
# Spring; Stream; Subsurface; Well; Wetland

# startDateLo; startDateHi:
# mm-dd-yyyy
