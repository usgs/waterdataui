"""
Main application views.
"""
import json

from flask import abort, render_template, request, Markup

from . import app, __version__
from .location_utils import build_linked_data, get_disambiguated_values, rollup_dataseries
from .utils import construct_url, defined_when, execute_get_request, parse_rdb

# Station Fields Mapping to Descriptions
from .constants import STATION_FIELDS_D

SERVICE_ROOT = app.config['SERVICE_ROOT']


@app.route('/')
def home():
    """Render the home page."""
    return render_template('index.html', version=__version__)


@app.route('/monitoring-location/<site_no>/', methods=['GET'])
def monitoring_location(site_no):
    """
    Monitoring Location view

    :param site_no: USGS site number

    """
    agency_cd = request.args.get('agency_cd')
    resp = execute_get_request(
        SERVICE_ROOT,
        path='/nwis/site/',
        params={
            'site': site_no,
            'agencyCd': agency_cd,
            'siteOutput': 'expanded',
            'format': 'rdb'
        }
    )
    status = resp.status_code
    json_ld = None
    if status == 200:
        iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))

        data_list = list(iter_data)

        template = 'monitoring_location.html'

        context = {
            'status_code': status,
            'stations': data_list,
            'STATION_FIELDS_D': STATION_FIELDS_D
        }
        station_record = data_list[0]
        if len(data_list) == 1:
            parameter_data_resp = execute_get_request(
                SERVICE_ROOT,
                path='/nwis/site/',
                params={
                    'format': 'rdb',
                    'sites': site_no,
                    'seriesCatalogOutput': True,
                    'siteStatus': 'all',
                    'agencyCd': agency_cd
                }
            )
            if parameter_data_resp.status_code == 200:
                param_data = [
                    param_datum for param_datum in
                    parse_rdb(parameter_data_resp.iter_lines(decode_unicode=True))
                ]
                site_dataseries = [
                    get_disambiguated_values(
                        param_datum,
                        app.config['NWIS_CODE_LOOKUP'],
                        {},
                        app.config['HUC_LOOKUP']
                    )
                    for param_datum in param_data
                ]
                grouped_dataseries = rollup_dataseries(site_dataseries)
                location_capabilities = set(param_datum['parm_cd'] for param_datum in param_data)
            else:
                grouped_dataseries = None
                location_capabilities = {}

            json_ld = build_linked_data(
                site_no,
                station_record.get('station_nm'),
                station_record.get('agency_cd'),
                station_record.get('dec_lat_va', ''),
                station_record.get('dec_long_va', ''),
                location_capabilities
            )
            location_with_values = get_disambiguated_values(
                station_record,
                app.config['NWIS_CODE_LOOKUP'],
                app.config['COUNTRY_STATE_COUNTY_LOOKUP'],
                app.config['HUC_LOOKUP']
            )
            questions_link = None
            try:
                site_owner_state = (
                    location_with_values['district_cd']['abbreviation']
                    if location_with_values['district_cd']['abbreviation']
                    else location_with_values['state_cd']['abbreviation']
                )
            except KeyError:
                site_owner_state = None
            if site_owner_state is not None:
                questions_link_params = {
                    'pemail': 'gs-w-{}_NWISWeb_Data_Inquiries'.format(site_owner_state.lower()),
                    'subject': 'Site Number: {}'.format(site_no),
                    'viewnote': (
                        '<H1>USGS NWIS Feedback Request</H1><p><b>Please enter a subject in the form '
                        'below that briefly summarizes your request</b></p>'
                    )
                }
                questions_link = construct_url('https://water.usgs.gov', 'contact/gsanswers', questions_link_params)

            context = {
                'status_code': status,
                'stations': data_list,
                'location_with_values': location_with_values,
                'STATION_FIELDS_D': STATION_FIELDS_D,
                'json_ld': Markup(json.dumps(json_ld, indent=4)),
                'parm_grp_summary': grouped_dataseries,
                'questions_link': questions_link
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
    if request.headers.get('Accept', '').lower() == 'application/ld+json':
        # did not use flask.json.jsonify because changing it's default
        # mimetype would require changing the app's JSONIFY_MIMETYPE,
        # which defaults to application/json... didn't really want to change that
        return app.response_class(json.dumps(json_ld), status=http_code, mimetype='application/ld+json')
    return render_template(template, **context), http_code


def return_404(*args, **kwargs):
    return abort(404)


@app.route('/hydrological-unit/', defaults={'huc_cd': None}, methods=['GET'])
@app.route('/hydrological-unit/<huc_cd>/', methods=['GET'])
@defined_when(app.config['HYDROLOGIC_PAGES_ENABLED'], return_404)
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


@app.route('/hydrological-unit/<huc_cd>/monitoring-locations/', methods=['GET'])
@defined_when(app.config['HYDROLOGIC_PAGES_ENABLED'], return_404)
def hydrological_unit_locations(huc_cd):
    """
    Returns a HUC page with a list of monitoring locations included.
    """
    return hydrological_unit(huc_cd, show_locations=True)


@app.route('/states/', defaults={'state_cd': None, 'county_cd': None}, methods=['GET'])
@app.route('/states/<state_cd>/', defaults={'county_cd': None}, methods=['GET'])
@app.route('/states/<state_cd>/counties/<county_cd>/', methods=['GET'])
@defined_when(app.config['STATE_COUNTY_PAGES_ENABLED'], return_404)
def states_counties(state_cd, county_cd, show_locations=False):
    """
    State unit view

    :param state_cd: ID for this political unit - 'state'
    :param county_cd: ID for this political unit - 'county'
    """

    # Get the data associated with this county
    if state_cd and county_cd:
        state_county_cd = state_cd + county_cd
        political_unit = app.config['COUNTRY_STATE_COUNTY_LOOKUP']['US']['state_cd'].get(state_cd, None)['county_cd']\
            .get(county_cd, None)

    # Get the data corresponding to this state
    elif state_cd and not county_cd:
        political_unit = app.config['COUNTRY_STATE_COUNTY_LOOKUP']['US']['state_cd'].get(state_cd, None)

    # If no state and or state and county code is available, display list of states.
    elif not state_cd and not county_cd:
        political_unit = {
            'name': 'United States',
            'children': app.config['COUNTRY_STATE_COUNTY_LOOKUP']['US']['state_cd']
        }

    # If the search is at the county level, get the monitoring locations within that county.
    monitoring_locations = []
    if show_locations and state_cd and county_cd:
        response = execute_get_request(
            SERVICE_ROOT,
            path='/nwis/site/',
            params={'format': 'rdb', 'countyCd': state_county_cd}
        )
        if response.status_code == 200:
            monitoring_locations = parse_rdb(response.iter_lines(decode_unicode=True))

    http_code = 200 if political_unit else 404

    return render_template(
        'states_counties.html',
        http_code=http_code,
        state_cd=state_cd,
        county_cd=county_cd,
        political_unit=political_unit,
        monitoring_locations=monitoring_locations,
        show_locations_link=not show_locations and political_unit and county_cd
    ), http_code


@app.route('/states/<state_cd>/counties/<county_cd>/monitoring-locations/', methods=['GET'])
@defined_when(app.config['STATE_COUNTY_PAGES_ENABLED'], return_404)
def county_station_locations(state_cd, county_cd):
    """
    Returns a page listing monitoring locations within a county.
    """
    return states_counties(state_cd, county_cd, show_locations=True)


@app.route('/components/time-series/<site_no>/', methods=['GET'])
@defined_when(app.config['EMBED_IMAGE_FEATURE_ENABLED'], return_404)
def time_series_component(site_no):
    """
    Returns an unadorned page with the time series component for a site.
    """
    return render_template('monitoring_location_embed.html', site_no=site_no)
