"""
Application configuration settings.
"""

# pylint: disable=line-too-long

import logging
import os


# controls environment specific behavior
# acceptable values: 'local', 'development', 'staging', 'prod'
DEPLOYMENT_ENVIRONMENT = 'development'

# FEATURE FLAGS
TIMESERIES_AUDIO_ENABLED = True
HYDROLOGIC_PAGES_ENABLED = True
STATE_COUNTY_PAGES_ENABLED = True
EMBED_IMAGE_FEATURE_ENABLED = True
COOPERATOR_LOOKUP_ENABLED = True  # may also be set to a list of district codes

DEBUG = False

SERVER_SERVICE_ROOT = 'https://waterservices.usgs.gov'  # Used for webserver calls to waterservices. Allows us to use a private url.
SERVICE_ROOT = 'https://waterservices.usgs.gov'  # Use for client side calls to waterservices. Most be a public url.
PAST_SERVICE_ROOT = 'https://nwis.waterservices.usgs.gov'
NWIS_ENDPOINTS = {
    'INVENTORY': 'https://waterdata.usgs.gov/nwis/inventory',
    'UV': 'https://waterdata.usgs.gov/nwis/uv'
}
WEATHER_SERVICE_ROOT = 'https://api.weather.gov'

FIM_GIS_ENDPOINT = 'https://gis.wim.usgs.gov/arcgis/rest/services/FIMMapper/'
FIM_ENDPOINT = 'https://fim.wim.usgs.gov/fim/'
HYDRO_ENDPOINT = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer'

LOGGING_ENABLED = True
LOGGING_DIRECTORY = None
LOGGING_LEVEL = logging.DEBUG

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
NWIS_CODE_LOOKUP_FILENAME = 'nwis_lookup.json'
COUNTRY_STATE_COUNTY_LOOKUP_FILENAME = 'nwis_country_state_lookup.json'
HUC_LOOKUP_FILENAME = 'huc_lookup.json'

GA_TRACKING_CODE = ''
ENABLE_USGS_GA = False

# To use hashed assets, set this to the gulp-rev-all rev-manifest.json path
ASSET_MANIFEST_PATH = None

# For cooperator site service, current lookup service is temporary, constants may need reconfiguring for the new service
SERVICE_ROOT_COOPERATOR_LOOKUP = 'https://sifta.water.usgs.gov/'
URL_PATH_COOPERATOR_LOOKUP = 'Services/REST/Site/CustomerFunding.ashx'
URL_PARAMS_COOPERATOR_LOOKUP = '&StartDate=10/1/2017&EndDate=09/30/2018'
