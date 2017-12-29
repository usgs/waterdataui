
from io import StringIO
from urllib.parse import urljoin

from flask import render_template
import pandas as pd
import requests as r

from . import app, __version__


water_services = app.config['WATER_SERVICES']


@app.route('/')
def home():
    return render_template('index.html', version=__version__)


@app.route('/monitoringlocation/<site_no>')
def monitoring_location(site_no):
    water_services_target = urljoin(water_services, 'nwis/site/?site={}'.format(site_no))
    ws_resp = r.get(water_services_target)
    rdb_site_data = StringIO(ws_resp.content.decode('utf-8'))
    df = pd.read_csv(rdb_site_data, sep='\t', comment='#', dtype=str).iloc[1::]
    data = df.to_dict('records')[0]
    station_name = data['station_nm']
    return render_template('monitoringlocation.html', station_name=station_name)
