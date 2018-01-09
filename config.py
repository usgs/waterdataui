"""
Application configuration settings.
"""
import logging


DEBUG = False

SERVICE_ROOT = 'https://waterservices.usgs.gov'
LEGACY_ENDPOINTS = {
    'INVENTORY': 'https://waterdata.usgs.gov/nwis/inventory',
    'UV': 'https://waterdata.usgs.gov/nwis/uv'
}

LOGGING_ENABLED = True
LOGGING_DIRECTORY = None
LOGGING_LEVEL = logging.DEBUG
