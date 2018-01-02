"""
Main application views.
"""

from flask import render_template

from . import app, __version__
from .utils import get_water_services_data, parse_rdb


water_services = app.config['WATER_SERVICES']


@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html', version=__version__)


@app.route('/monitoringlocation/<site_no>')
def monitoring_location(site_no):
    """
    Monitoring Location view
    :param site_no: USGS site number

    """
    rdb_resp_data = get_water_services_data(water_services, 'nwis/site/?site={}'.format(site_no))
    content, status, reason = rdb_resp_data
    if status == 200:
        data = parse_rdb(content)[0]
        station_name = data['station_nm']
        return render_template('monitoringlocation.html',
                               status_code=status,
                               station_name=station_name
                               )
    elif 400 <= status < 500:
        return render_template('monitoringlocation.html',
                               status_code=status,
                               reason=reason
                               )
    elif status == 500:
        return render_template('errors/500.html'), 502
    else:
        return render_template('errors/500.html'), 500
