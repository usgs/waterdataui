"""
Functions for calling NWIS services

"""
from ..utils import execute_get_request


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
            if line and line[0] != '#':
                headers = line.split('\t')
                found_header = True
    # skip the next line in the RDB file
    next(rdb_iter_lines)
    for record in rdb_iter_lines:
        # Ignore empty lines
        if not record.strip():
            continue
        record_values = record.split('\t')
        yield dict(zip(headers, record_values))


class NwisWebServices:

    def __init__(self, service_root, path='/nwis/site/'):
        self.service_root = service_root
        self.path = path

    def get_site(self, site_no, agency_cd, data_format='rdb'):
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'site': site_no,
                'agency_cd': agency_cd,
                'siteOutput': 'expanded',
                'format': data_format
            }
        )
        return resp

    def get_site_parameters(self, site_no, agency_cd, data_format='rdb'):
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'sites': site_no,
                'format': data_format,
                'seriesCatalogOutput': True,
                'siteStatus': 'all',
                'agencyCd': agency_cd
            }
        )
        return resp

    def get_huc_sites(self, huc_cd, data_format='rdb'):
        resp = execute_get_request(
            self.service_root,
            path='/nwis/site/',
            params={
                'format': data_format,
                'huc': huc_cd
            }
        )
        return resp

    def get_county_sites(self, state_county_cd, data_format='rdb'):
        resp = execute_get_request(
            self.service_root,
            path=self.path,
            params={
                'format': data_format,
                'countyCd': state_county_cd
            }
        )
        return resp
