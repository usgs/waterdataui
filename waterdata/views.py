
from flask import render_template

from . import app, __version__
from .utils import get_water_services_data, parse_rdb


water_services = app.config['WATER_SERVICES']


@app.route('/')
def home():
    return render_template('index.html', version=__version__)


@app.route('/monitoringlocation/<site_no>')
def monitoring_location(site_no):
    raw_rdb_data = get_water_services_data(water_services, 'nwis/site/?site={}'.format(site_no))
    data = parse_rdb(raw_rdb_data)
    station_name = data['station_nm']
    return render_template('monitoringlocation.html', station_name=station_name)
