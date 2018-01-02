from io import StringIO
from urllib.parse import urljoin

import pandas as pd
import requests as r


def get_water_services_data(hostname, url_path):
    """
    Make a request to USGS water services.

    :param str hostname: Scheme and hostname of the target service
    :param str url_path: Path
    :return: Water services data (in RDB format), request status code, request status code description
    :rtype: tuple

    """
    water_services_target = urljoin(hostname, url_path)
    try:
        ws_resp = r.get(water_services_target)
    except r.exceptions.Timeout:
        retrieved_data = None
        resp_status_code = None
        status_reason = None
    else:
        resp_status_code = ws_resp.status_code
        status_reason = ws_resp.reason
        if resp_status_code == 200:
            retrieved_data = ws_resp.text
        else:
            retrieved_data = None
    return retrieved_data, resp_status_code, status_reason


def parse_rdb(rdb_data):
    """
    Parse USGS RDB formatted data into a Python object.
    All comment lines are discarded as is the first row
    of non-data.

    :param str rdb_data: UTF-8 encoded string of RDB data
    :return: list of dictionaries with key value pairs form the data
    :rtype: list

    """
    rdb_site_data = StringIO(rdb_data)
    df = pd.read_csv(rdb_site_data, sep='\t', comment='#', dtype=str).iloc[1::]
    data = df.to_dict('records')
    return data
