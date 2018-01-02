"""
Main application views.
"""

from flask import render_template

from . import app, __version__
from .utils import execute_get_request, parse_rdb


service_root = app.config['SERVICE_ROOT']


@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html', version=__version__)


@app.route('/monitoring-location/<site_no>')
def monitoring_location(site_no):
    """
    Monitoring Location view
    :param site_no: USGS site number

    """
    resp = execute_get_request(service_root, path='/nwis/site/', params={'site': site_no, 'format': 'rdb'})
    try:
        status = resp.status_code
    except AttributeError:
        return render_template('errors/500.html'), 500
    else:
        if status == 200:
            iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
            station_record = next(iter_data)
            station_name = station_record['station_nm']
            return render_template('monitoring_location.html',
                                   status_code=status,
                                   station_name=station_name
                                   )
        elif 400 <= status < 500:
            return render_template('monitoring_location.html',
                                   status_code=status,
                                   reason=resp.reason
                                   )
        elif 500 <= status <= 511:
            return render_template('errors/500.html'), 503
        else:
            return render_template('errors/500.html'), 500
