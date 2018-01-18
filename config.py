"""
Application configuration settings.
"""

import logging
import os


DEBUG = False

SERVICE_ROOT = 'https://waterservices.usgs.gov'
NWIS_ENDPOINTS = {
    'INVENTORY': 'https://waterdata.usgs.gov/nwis/inventory',
    'UV': 'https://waterdata.usgs.gov/nwis/uv'
}

LOGGING_ENABLED = True
LOGGING_DIRECTORY = None
LOGGING_LEVEL = logging.DEBUG

NWIS_CODE_LOOKUP_FILENAME = os.path.join('data', 'nwis_lookup.json')
COUNTRY_STATE_COUNTY_LOOKUP_FILENAME = os.path.join('data', 'nwis_country_state_lookup.json')
