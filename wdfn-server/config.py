"""
Application configuration settings.
"""

# pylint: disable=line-too-long

import logging
import os

PROJECT_HOME = os.path.dirname(__file__)

# controls environment specific behavior
# acceptable values: 'local', 'development', 'staging', 'prod'
DEPLOYMENT_ENVIRONMENT = 'development'

# FEATURE FLAGS
TIMESERIES_AUDIO_ENABLED = True
HYDROLOGIC_PAGES_ENABLED = True
STATE_COUNTY_PAGES_ENABLED = True
EMBED_IMAGE_FEATURE_ENABLED = True
COOPERATOR_LOOKUP_ENABLED = True  # may also be set to a list of district codes
MONITORING_CAMERA_ENABLED = True
MONITORING_CAMERA_PATH = os.path.join(PROJECT_HOME, 'data/monitoring_camera_data.json')
DAILY_VALUE_HYDROGRAPH_ENABLED = True

DEBUG = False

SERVER_SERVICE_ROOT = 'https://waterservices.usgs.gov'  # Used for webserver calls to waterservices. Allows us to use a private url.
SERVICE_ROOT = 'https://waterservices.usgs.gov'  # Use for client side calls to waterservices. Most be a public url.
PAST_SERVICE_ROOT = 'https://nwis.waterservices.usgs.gov'
NWIS_ENDPOINTS = {
    'INVENTORY': 'https://waterdata.usgs.gov/nwis/inventory',
    'UV': 'https://waterdata.usgs.gov/nwis/uv'
}
WEATHER_SERVICE_ROOT = 'https://api.weather.gov'

OBSERVATIONS_ENDPOINT = 'https://labs.waterdata.usgs.gov/api/observations/collections/monitoring-locations'

FIM_GIS_ENDPOINT = 'https://gis.wim.usgs.gov/arcgis/rest/services/FIMMapper/'
FIM_ENDPOINT = 'https://fim.wim.usgs.gov/fim/'
HYDRO_ENDPOINT = 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer'

CITIES_ENDPOINT = 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Major_Cities/FeatureServer/0'

NLDI_SERVICES_ENDPOINT = 'https://labs.waterdata.usgs.gov/api/nldi/linked-data'
NLDI_SERVICES_DISTANCE = '322'

# Networks
NETWORK_ENDPOINT = 'https://labs.waterdata.usgs.gov/api/observations/collections'

# Waterwatch
WATERWATCH_ENDPOINT = 'https://waterwatch.usgs.gov/webservices'

TOUCHPOINT_SCRIPT = ''
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
COOPERATOR_SERVICE_PATTERN = 'https://water.usgs.gov/customer/stories/{site_no}/approved.json'

# These messages below will be added to a dismissible panel below the main header. It is an array of strings. Markup
# can be used to add things like links, bold text, etc.
BANNER_NOTICES = []

# set this if running in a container
if os.getenv('CONTAINER_RUN', False):
    STATIC_ROOT = os.environ.get('STATIC_ROOT', '/static/')
