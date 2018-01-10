"""
Main application views.
"""
import json

from flask import render_template, request, Markup

from . import app, __version__
from .location import MonitoringLocation
from .utils import execute_get_request, parse_rdb

# Station Fields Mapping to Descriptions
from .constants import STATION_FIELDS_D

SERVICE_ROOT = app.config['SERVICE_ROOT']


@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html', version=__version__)


@app.route('/monitoring-location/<site_no>', methods=['GET'])
def monitoring_location(site_no):
    """
    Monitoring Location view

    :param site_no: USGS site number

    """
    agency_cd = request.args.get('agency_cd')

    resp = execute_get_request(
        SERVICE_ROOT,
        path='/nwis/site/',
        params={'site'      : site_no,
                'agencyCd'  : agency_cd,
                'siteOutput': 'expanded',
                'format'    : 'rdb'})

    status = resp.status_code
    if status == 200:
        iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
        station_record = next(iter_data)
        template = 'monitoring_location.html'
        context = {'status_code'       : status,
                   'station'           : station_record,
                   'STATION_FIELDS_D'  : STATION_FIELDS_D
                   }
        http_code = 200
        ml = MonitoringLocation(site_no, agency_cd)
        json_ld = ml.build_linked_data()
        # don't want to create more DOM elements if we don't have to
        # define json_ld in the context only if there's json-ld to render
        if json_ld:
            context['json_ld'] = Markup(json.dumps(json_ld, indent=4))
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
