"""
Application configuration settings.
"""

# pylint: disable=line-too-long

import logging
import os

from waterdata import __version__ as APP_VERSION

# controls environment specific behavior
# acceptable values: 'local', 'development', 'staging', 'prod'
DEPLOYMENT_ENVIRONMENT = 'development'

DEBUG = False

SERVICE_ROOT = 'https://waterservices.usgs.gov'
PAST_SERVICE_ROOT = 'https://nwis.waterservices.usgs.gov'
NWIS_ENDPOINTS = {
    'INVENTORY': 'https://waterdata.usgs.gov/nwis/inventory',
    'UV': 'https://waterdata.usgs.gov/nwis/uv'
}

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
