"""
Main application views.
"""
import json

from flask import render_template, request, Markup

from . import app, __version__
from .location_utils import get_capabilities, build_linked_data, get_disambiguated_values
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

    resp = execute_get_request(SERVICE_ROOT,
                               path='/nwis/site/',
                               params={'site': site_no,
                                       'agencyCd': agency_cd,
                                       'siteOutput': 'expanded',
                                       'format': 'rdb'})
    status = resp.status_code
    if status == 200:
        iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
        station_record = next(iter_data)
        parameter_data_resp = execute_get_request(SERVICE_ROOT,
                                                  path='/nwis/site/',
                                                  params={'format': 'rdb',
                                                          'sites': site_no,
                                                          'seriesCatalogOutput': True,
                                                          'siteStatus': 'all',
                                                          'agencyCd': agency_cd})
        if parameter_data_resp.status_code == 200:
            param_data = parse_rdb(parameter_data_resp.iter_lines(decode_unicode=True))
            location_capabilities = get_capabilities(param_data)
            json_ld = build_linked_data(site_no,
                                        station_record.get('station_nm'),
                                        station_record.get('agency_cd'),
                                        station_record.get('dec_lat_va', ''),
                                        station_record.get('dec_long_va', ''),
                                        location_capabilities)
            safe_json_ld = Markup(json.dumps(json_ld, indent=4))
        else:
            safe_json_ld = None
        template = 'monitoring_location.html'
        context = {
            'status_code'       : status,
            'station'           : station_record,
            'location_with_values' : get_disambiguated_values(
                station_record,
                app.config['NWIS_CODE_LOOKUP'],
                app.config['COUNTRY_STATE_COUNTY_LOOKUP'],
                app.config['HUC_LOOKUP']
            ),
            'STATION_FIELDS_D'  : STATION_FIELDS_D,
            'json_ld': safe_json_ld
        }
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


@app.route('/hydrological-unit', defaults={'huc_cd': None}, methods=['GET'])
@app.route('/hydrological-unit/<huc_cd>', methods=['GET'])
def hydrological_unit(huc_cd, show_locations=False):
    """
    Hydrological unit view

    :param huc_cd: ID for this unit
    """

    # Get the data corresponding to this HUC
    if huc_cd:
        huc = app.config['HUC_LOOKUP']['hucs'].get(huc_cd, None)

    # If we don't have a HUC, display all the root HUC2 units as children.
    else:
        huc = {
            'huc_nm': 'HUC2',
            'children': app.config['HUC_LOOKUP']['classes']['HUC2']
        }

    # If this is a HUC8 site, get the monitoring locations within it.
    monitoring_locations = []
    if show_locations and huc:
        response = execute_get_request(
            SERVICE_ROOT,
            path='/nwis/site/',
            params={'format': 'rdb', 'huc': huc_cd}
        )
        if response.status_code == 200:
            monitoring_locations = parse_rdb(response.iter_lines(decode_unicode=True))

    http_code = 200 if huc else 404
    return render_template(
        'hydrological_unit.html',
        http_code=http_code,
        huc=huc,
        monitoring_locations=monitoring_locations,
        show_locations_link=not show_locations and huc and huc.get('kind') == 'HUC8'
    ), http_code


@app.route('/hydrological-unit/<huc_cd>/monitoring-locations', methods=['GET'])
def hydrological_unit_locations(huc_cd):
    """
    Returns a HUC page with a list of monitoring locations included.
    """
    return hydrological_unit(huc_cd, show_locations=True)
