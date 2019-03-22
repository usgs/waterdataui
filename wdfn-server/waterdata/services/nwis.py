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


def get_nwis_site(service_root, site_no, agency_cd, format='rdb'):
    resp = execute_get_request(
        service_root,
        path='/nwis/site/',
        params={
            'site': site_no,
            'agencyCd': agency_cd,
            'siteOutput': 'expanded',
            'format': format
        }
    )
    return resp

