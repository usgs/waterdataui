
import os

DEBUG = False

SERVICE_ROOT = 'https://waterservices.usgs.gov'
LEGACY_SITE_INVENTORY_ENDPOINT = 'https://waterdata.usgs.gov/nwis/inventory'

NWIS_CODE_LOOKUP_FILENAME = os.path.join('data', 'nwis_lookup.json')
COUNTRY_STATE_COUNTY_LOOKUP_FILENAME = os.path.join('data', 'nwis_country_state_lookup.json')
