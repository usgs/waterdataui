"""
Utility functions and classes for working with
USGS water services.

"""
from collections import defaultdict, namedtuple
import datetime
import itertools

from flask import url_for

from .constants import US_STATES

Parameter = namedtuple('Parameter', ['parameter_cd', 'start_date', 'end_date', 'record_count'])


def get_state_abbreviation(state_full_name):
    """
    Return a state's two letter abbreviation.

    :param str state_full_name:
    :return: state two letter abbreviation
    :rtype: str
    """
    state = filter(lambda record: record['name'] == state_full_name, US_STATES)
    try:
        state_abbrev = next(state).get('abbreviation')
    except StopIteration:
        state_abbrev = None
    return state_abbrev


def get_disambiguated_values(location, code_lookups, country_state_county_lookups, huc_lookups):
    """
    Convert values for keys that contains codes to human readable names using the lookups
    :param dict location:
    :param dict code_lookups:
    :param dict country_state_county_lookups:
    :rtype: dict
    """

    def get_state_name(country_code, state_code):
        """
        Return the name of the state with country_code and state_code
        :param str country_code:
        :param str state_code:
        :rtype: str
        """
        country_lookup = country_state_county_lookups.get(country_code, {})
        state_lookup = country_lookup.get('state_cd', {})

        return state_lookup.get(state_code, {}).get('name')

    transformed_location = {}

    country_code = location.get('country_cd')
    state_code = location.get('state_cd')
    county_code = location.get('county_cd')
    district_code = location.get('district_cd')

    for (key, value) in location.items():
        if key == 'state_cd' and country_code and state_code:
            state_name = get_state_name(country_code, state_code)
            transformed_value = {
                'name': state_name or state_code,
                'abbreviation': get_state_abbreviation(state_name),
                'code': state_code if state_name != state_code else None
            }

        elif key == 'district_cd' and country_code and district_code:
            state_name = get_state_name(country_code, district_code)
            transformed_value = {
                'name': state_name or district_code,
                'abbreviation': get_state_abbreviation(state_name),
                'code': district_code if state_name != district_code else None
            }

        elif key == 'county_cd' and country_code and state_code and country_code:
            country_lookup = country_state_county_lookups.get(country_code, {})
            state_lookup = country_lookup.get('state_cd', {}).get(state_code, {})
            county_lookup = state_lookup.get('county_cd', {})

            county_name = county_lookup.get(county_code, {}).get('name')
            transformed_value = {
                'name': county_name or county_code,
                'code': county_code if county_name != county_code else None
            }

        elif key in code_lookups:
            if key == 'parm_grp_cd':
                value_dict = code_lookups.get(key).get(value)
                if value_dict is None:
                    parm_code = location['parm_cd']
                    parameter_metadata = code_lookups.get('parm_cd').get(parm_code) or {}
                    value_dict = {'name': parameter_metadata.get('group', value)}
            else:
                value_dict = code_lookups.get(key).get(value) or {'name': value}
            transformed_value = dict(code=value, **value_dict)

        elif key == 'huc_cd':
            transformed_value = {
                'name': huc_lookups['hucs'].get(value, {}).get('huc_nm'),
                'code': value,
                'url': url_for('hydrological_unit', huc_cd=value)
            }

        else:
            transformed_value = {
                'name': value,
                'code': value
            }

        transformed_location[key] = transformed_value

    return transformed_location


def get_capabilities(location_parameter_records):
    """
    Determine the parameters measured at the site.

    :param iterable location_parameter_records: an iterable containing location parameters, the location parameters
        must contain a `parm_cd` key
    :return: USGS parameter codes measured at a site
    :rtype: set

    """
    supported_params = set([parameter_record['parm_cd'] for parameter_record in location_parameter_records])
    return supported_params


def get_site_parameter(location_parameter_records, parameter_cd):
    """
    Determine the period of record and number of records for a
    parameter being measured at this site. If the parameter code
    value specified is not available at this site, None is returned.

    :param iterable location_parameter_records: an iterable containing of location parameter
    :param str parameter_cd: the USGS parameter code of interest
    :return: a parameter's "start_date", "end_date", and "record_count" if available; dates are Python date objects
    :rtype: waterdata.location_utils.Parameter or None

    """
    try:
        param_series = next((parameter_record for parameter_record in location_parameter_records
                             if parameter_record['parm_cd'] == parameter_cd))
    except StopIteration:
        return None
    else:
        record_start_date = param_series['begin_date']
        record_end_date = param_series['end_date']
        start_date = datetime.datetime.strptime(record_start_date, '%Y-%m-%d').date()
        end_date = datetime.datetime.strptime(record_end_date, '%Y-%m-%d').date()
        record_count = param_series['count_nu']
    return Parameter(
        parameter_cd=parameter_cd,
        start_date=start_date,
        end_date=end_date,
        record_count=record_count
    )


def build_linked_data(location_number, location_name, agency_code, latitude, longitude, location_capabilities):
    """
    Given site metadata, construct a dictionary / json-ld for the site.
    The constructed json-ld conforms to the context documents
    at https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld
    and https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld.

    :param str location_number: location's identification code or number
    :param str location_name: location's name
    :param str agency_code: agency identifier for the agency responsible for the location
    :param str latitude: decimal latitude
    :param str longitude: decimal longitude
    :param set location_capabilities: set containing parameter codes measured at the location
    :return: json-ld key value pairs
    :rtype: dict

    """
    contexts = [
        'https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
        'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
    ]
    linked_data = {
        '@context': contexts,
        '@id': 'https://waterdata.usgs.gov/monitoring-location/{}'.format(location_number),
        '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
        'name': location_name,
        'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no={}'.format(location_number),
        'HY_HydroLocationType': 'hydrometricStation',
        'geo': {
            '@type': 'schema:GeoCoordinates',
            'latitude': latitude,
            'longitude': longitude
        }
    }
    if '00060' in location_capabilities:
        linked_data['image'] = (
            'https://waterdata.usgs.gov/nwisweb/graph?'
            'agency_cd={0}&site_no={1}&parm_cd=00060&period=100'
        ).format(agency_code, location_number)
    return linked_data


def _parameter_group_mappings(dataseries):
    var_to_group_mapping = defaultdict(list)
    for series in dataseries:
        parameter_code = series['parm_cd']['code']
        parameter_group_name = series['parm_grp_cd']['name']
        parameter_group_code = series['parm_grp_cd']['code']
        if (parameter_group_name, parameter_group_code) not in var_to_group_mapping[parameter_code] and parameter_group_name:
            var_to_group_mapping[parameter_code].append((parameter_group_name, parameter_group_code))
    return var_to_group_mapping


def fill_in_missing_parameter_groups(dataseries):
    updated_dataseries = []
    mappings = _parameter_group_mappings(dataseries)
    for series in dataseries:
        if set(series['parm_grp_cd'].values()) == {''}:
            series_parm_cd = series['parm_cd']['code']
            try:
                grp_name, grp_code = mappings[series_parm_cd][0]
            except IndexError:
                pass
            else:
                series['parm_grp_cd'] = {'name': grp_name, 'code': grp_code}
        updated_dataseries.append(series)
    return updated_dataseries


def _collect_rollup_series(grouped_series):

    def parm_cd_sort(x):
        return x['parm_cd']['code']

    rolled_up_series = {}
    # for each parameter group grouping...
    for key, grp in grouped_series:
        pcode_sort = sorted(grp, key=parm_cd_sort)
        series_by_pcode = itertools.groupby(pcode_sort, key=parm_cd_sort)
        # for each parameter code grouping within a parameter group grouping...
        grp_pcode_series = []
        for key_pc, pc_grp in series_by_pcode:
            series_by_pc = list(pc_grp)
            parameter_name = series_by_pc[0]['parm_cd']['name']
            # determine the start and end dates of the group
            start_dates = [
                datetime.datetime.strptime(series['begin_date']['code'], '%Y-%m-%d') for series in series_by_pc
            ]
            end_dates = [
                datetime.datetime.strptime(series['end_date']['code'], '%Y-%m-%d') for series in series_by_pc
            ]
            pc_start_date = min(start_dates)
            pc_end_date = max(end_dates)
            # create data types string
            data_types = [series['data_type_cd']['name'] for series in series_by_pc]
            data_type_str = ', '.join(set(data_types))
            pc_metadata = {
                'start_date': pc_start_date,
                'end_date': pc_end_date,
                'data_types': data_types,
                'parameter_code': key_pc,
                'parameter_name': parameter_name
            }
            grp_pcode_series.append(pc_metadata)
        rolled_up_series[key] = grp_pcode_series
    return rolled_up_series


def rollup_dataseries(dataseries):
    # exclude annual reports
    excluded_data_type_codes = ['ad', 'pv']
    display_series = list(itertools.filterfalse(
        lambda x: x['data_type_cd']['code'].lower() in excluded_data_type_codes,
        dataseries
    ))
    series_w_parm_grp_cd = itertools.filterfalse(lambda x: not bool(x['parm_grp_cd']['name']), display_series)
    series_wo_parm_grp_cd = itertools.filterfalse(lambda x: bool(x['parm_grp_cd']['name']), display_series)

    rolled_up_series = defaultdict(list)
    rolled_up_series = defaultdict(list)

    # handle series with parameter groups
    def parm_grp_sort(x):
        return x['parm_grp_cd']['name']

    pg_sorted = sorted(series_w_parm_grp_cd, key=parm_grp_sort)
    pg_grouped_series = itertools.groupby(pg_sorted, key=parm_grp_sort)

    rollup_by_parameter_grp = _collect_rollup_series(pg_grouped_series)
    # handle series without parameter groups

    def data_type_sort(x):
        return x['data_type_cd']['name']

    dt_sorted = sorted(series_wo_parm_grp_cd, key=data_type_sort)
    dt_grouped_series = itertools.groupby(dt_sorted, key=data_type_sort)

    rollup_by_data_type = _collect_rollup_series(dt_grouped_series)

    for d in (rollup_by_parameter_grp, rollup_by_data_type):
        for k, v in d.items():
            if k.lower() != 'all':  # don't include the all key -- it's just the amalgamation of the other groups
                rolled_up_series[k].append(v)

    def extract_group_date_range(values):
        start_dates = [value['start_date'] for value in values]
        end_dates = [value['end_date'] for value in values]
        data_types = set(list(itertools.chain.from_iterable([value['data_types'] for value in values])))
        range_start_date = min(start_dates).strftime('%Y-%m-%d')
        range_end_date = max(end_dates).strftime('%Y-%m-%d')
        return {
            'start_date': range_start_date,
            'end_date': range_end_date,
            'data_types': ', '.join(data_types),
            'parameters': values
        }

    return {k: extract_group_date_range(list(itertools.chain.from_iterable(v))) for k, v in rolled_up_series.items()}
