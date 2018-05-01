"""
Utility functions and classes for working with
USGS water services.

"""
import itertools

from flask import url_for
import pendulum

from .constants import US_STATES


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
                # if a value can't be found for a parameter group code (usually because there isn't a parameter group),
                # try looking it up based on the value of the parameter code
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


def _collapse_series_by_column(grouped_series, sort_data_col):
    """
    For each grouped series, take each of its timeseries and
    organize them by a data column/key name. Group by the specified
    column/key name and extract metadata from them. This intended
    to help with cases where there are multiple series for a RDB
    column/key (e.g. temperature measured at slightly different depths
    for parameter code 00010 or if a location gets site visits for
    10 years, gets shut down, but is started back up and site visits
    resume).

    :param itertools.groupby grouped_series: dataseries grouped by some value (e.g. parameter group, data type, etc.)
    :param str sort_data_col: value of a key in the time series data
    :return: groupings with one entry for each unique value within a data column/key
    :rtype: dict

    """
    def key_sort(item):
        """
        sort by some code

        :param item:
        :return:

        """
        return item[sort_data_col]['code']

    rolled_up_series = {}
    # for each parameter group grouping...
    for key, grp in grouped_series:
        series_by_pcode = itertools.groupby(sorted(grp, key=key_sort), key=key_sort)
        # for each grouping within a key grouping...
        grp_pcode_series = []
        for key_pc, pc_grp in series_by_pcode:
            series_by_pc = list(pc_grp)
            # determine the start and end dates of the group
            start_dates = [
                pendulum.parse(series['begin_date']['code']) for series in series_by_pc
            ]
            end_dates = [
                pendulum.parse(series['end_date']['code']) for series in series_by_pc
            ]
            # collect data types
            data_types = [series['data_type_cd']['name'] for series in series_by_pc]

            pc_metadata = {
                'start_date': min(start_dates),
                'end_date': max(end_dates),
                'data_types': data_types,
                'parameter_code': key_pc,
                'parameter_name': series_by_pc[0]['parm_cd']['name']
            }
            grp_pcode_series.append(pc_metadata)
        rolled_up_series[key] = grp_pcode_series
    return rolled_up_series


def _extract_group_summary_data(dataseries, name=None):
    """
    Given a list of dataseries, determine the earliest
    start date, latest end date, and create a string
    of their various data types.

    :param list dataseries: dataseries
    :param name: display name for the group if desired
    :type name: str or None
    :return: overall metadata for a bunch of dataseries
    :rtype: dict

    """
    start_dates = [series['start_date'] for series in dataseries]
    end_dates = [series['end_date'] for series in dataseries]
    data_types = set(list(itertools.chain.from_iterable([series['data_types'] for series in dataseries])))
    return {
        'name': name,
        'start_date': min(start_dates),
        'end_date': max(end_dates),
        'data_types': ', '.join(sorted(data_types)),
        'parameters': dataseries
    }


def rollup_dataseries(dataseries):
    """
    Rollup dataseries.

    Roll up a sites data series by parameter group if a series has them. Data
    types for the parameter group is the join of the data types for each measured
    parameter code. Similarly, the start and end dates are the earliest and
    latest date of all the measured parameter codes within a group.

    Data series that do not have a parameter group are rolled up by data type.
    Any individual series within a data type and the start and end dates are
    earliest and latest dates among the individual series within the group.

    :param list dataseries: list of data series aa uvailable at a site
    :return: dataseries grouped by parameter group code and data type code
    :rtype: list

    """
    # handle annual reports, peak value measurements, site visits, and active ground water sites
    # basically everything that doesn't have a parameter code and parameter group separate from the
    # data types that do.
    display_series = list(itertools.filterfalse(
        lambda x: x['parm_cd']['code'] == '' and x['parm_grp_cd']['code'] == '',
        dataseries
    ))
    other_series = [s for s in dataseries if s not in display_series]

    # handle series with parameter groups
    def parm_grp_sort(item):
        """
        parameter group name sort function

        :param item:
        :return:

        """
        return item['parm_grp_cd']['name']

    pg_sorted = sorted(display_series, key=parm_grp_sort)
    pg_grouped_series = itertools.groupby(pg_sorted, key=parm_grp_sort)
    rollup_by_parameter_grp = _collapse_series_by_column(pg_grouped_series, 'parm_cd')
    # remove the `ALL` parameter group
    # it's the amalgamation of the other groups
    rollup_by_parameter_grp.pop('ALL', None)
    parameter_groups = [_extract_group_summary_data(v, k) for k, v in rollup_by_parameter_grp.items()]

    # handle series that don't have parameter codes and parameter group codes
    def data_type_sort(item):
        """
        data type code name sort function

        :param item:
        :return:

        """
        return item['data_type_cd']['name']

    dt_sorted = sorted(other_series, key=data_type_sort)
    dt_grouped_series = itertools.groupby(dt_sorted, key=data_type_sort)
    rollup_by_dt_code = _collapse_series_by_column(dt_grouped_series, 'data_type_cd')
    data_type_groups = [_extract_group_summary_data(v) for v in rollup_by_dt_code.values()]

    return parameter_groups + data_type_groups
