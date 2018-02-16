"""
Utility functions and classes for working with
USGS water services.

"""
from collections import namedtuple
import datetime

from flask import url_for


Parameter = namedtuple('Parameter', ['parameter_cd', 'start_date', 'end_date', 'record_count'])


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
                'code': state_code if state_name != state_code else None
            }

        elif key == 'district_cd' and country_code and district_code:
            state_name = get_state_name(country_code, district_code)
            transformed_value = {
                'name': state_name or district_code,
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
    return Parameter(parameter_cd=parameter_cd,
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
    contexts = ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld']
    linked_data = {'@context': contexts,
                   '@id': 'https://waterdata.usgs.gov/monitoring-location/{}'.format(location_number),
                   '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                   'name': location_name,
                   'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no={}'.format(location_number),
                   'HY_HydroLocationType': 'hydrometricStation',
                   'geo': {'@type': 'schema:GeoCoordinates',
                           'latitude': latitude,
                           'longitude': longitude}}
    if '00060' in location_capabilities:
        linked_data['image'] = ('https://waterdata.usgs.gov/nwisweb/graph?'
                                'agency_cd={0}&site_no={1}&parm_cd=00060&period=100').format(agency_code,
                                                                                             location_number)
    return linked_data
