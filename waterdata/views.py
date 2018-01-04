"""
Main application views.
"""

from flask import render_template

from . import app, __version__
from .utils import execute_get_request, parse_rdb


SERVICE_ROOT = app.config['SERVICE_ROOT']


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
    resp = execute_get_request(
        SERVICE_ROOT,
        path='/nwis/site/',
        params={'site': site_no, 'siteOutput':'expanded', 'format': 'rdb'})

    status = resp.status_code
    if status == 200:
        iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
        station_record = next(iter_data)
        template = 'monitoring_location.html'
        context = {'status_code': status, 'station': station_record}
        http_code = 200
    elif 400 <= status < 500:
        template = 'monitoring_location.html'
        context = {'status_code': status, 'reason': resp.reason}
        http_code = 200
    elif 500 <= status <= 511:
        template = 'errors/500.html'
        context = {}
        http_code = 503
    else:
        template = 'errors/500.html'
        context = {}
        http_code = 500
    return render_template(template, **context), http_code
