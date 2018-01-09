"""
Utility functions

"""
from urllib.parse import urljoin

import requests as r

from . import app


def execute_get_request(hostname, path=None, params=None):
    """
    Do a get request against a service endpoint.

    :param str hostname: Scheme and hostname of the target service
    :param str path: path part of the url
    :param dict params: dictionary of query parameters
    :return: response of the web service call or an empty response object if call is unsuccessful
    :rtype: requests.Response

    """
    target = urljoin(hostname, path)
    try:
        resp = r.get(target, params=params)
    except (r.exceptions.Timeout, r.exceptions.ConnectionError) as err:
        app.logger.debug(repr(err))
        resp = r.Response()  # return an empty response object
    return resp


def parse_rdb(rdb_iter_lines):
    """
    Parse records in an RDB file into dictionaries.

    :param iterator rdb_iter_lines: iterator containing lines from an RDB file
    :rtype: Iterator

    """
    found_header = False
    headers = []
    while not found_header:
        try:
            line = next(rdb_iter_lines)
        except StopIteration:
            raise Exception('RDB column headers not found.')
        else:
            if line[0] != '#':
                headers = line.split('\t')
                found_header = True
    # skip the next line in the RDB file
    next(rdb_iter_lines)
    for record in rdb_iter_lines:
        record_values = record.split('\t')
        yield dict(zip(headers, record_values))


def build_site_linked_data(site_data):
    """
    Given site metadata, construct a dictionary / json-ld for the site.
    The constructed json-ld conforms to the context documents
    at https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld
    and https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld.

    If a site is missing a piece of data that is needed by the json-ld,
    an empty dictionary is returned.

    :param dict site_data: dictionary derived from RDB with site metadata
    :return: json-ld key value pairs
    :rtype: dict

    """
    contexts = ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                ]
    try:
        monitoring_location_no = site_data['site_no']
        monitoring_location_name = site_data['station_nm']
        latitude = site_data['dec_lat_va']
        longitude = site_data['dec_long_va']
        agency_code = site_data['agency_cd']
    except KeyError:
        linked_data = {}
    else:
        linked_data = {'@context': contexts,
                       '@id': 'https://waterdata.usgs.gov/monitoring-location/{}'.format(monitoring_location_no),
                       '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                       'name': monitoring_location_name,
                       'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no={}'.format(monitoring_location_no),
                       'image': ('https://waterdata.usgs.gov/nwisweb/graph?'
                                 'agency_cd={0}&site_no={1}&parm_cd=00060&period=100').format(agency_code,
                                                                                              monitoring_location_no
                                                                                              ),
                       'HY_HydroLocationType': 'hydrometricStation',
                       'geo': {'@type': 'schema:GeoCoordinates',
                               'latitude': latitude,
                               'longitude': longitude
                               }
                       }
    return linked_data
