from io import StringIO
from urllib.parse import urljoin

import pandas as pd
import requests as r


def get_water_services_data(hostname, url_path):
    water_services_target = urljoin(hostname, url_path)
    ws_resp = r.get(water_services_target)
    raw_data = ws_resp.content
    return raw_data


def parse_rdb(rdb_data):
    rdb_site_data = StringIO(rdb_data.decode('utf-8'))
    df = pd.read_csv(rdb_site_data, sep='\t', comment='#', dtype=str).iloc[1::]
    data = df.to_dict('records')[0]
    return data
