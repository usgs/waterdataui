"""
Application configuration settings.
"""

DEBUG = False

SERVICE_ROOT = 'https://waterservices.usgs.gov'
LEGACY_ENDPOINTS = {
    'INVENTORY': 'https://waterdata.usgs.gov/nwis/inventory',
    'UV': 'https://waterdata.usgs.gov/nwis/uv'
}
