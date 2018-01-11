"""
Utility functions and classes for working with
USGS water services.

"""
from collections import namedtuple
import datetime

from .utils import execute_get_request, parse_rdb

from . import app


Parameter = namedtuple('Parameter', ['parameter_cd',
                                     'start_date',
                                     'end_date',
                                     'record_count']
                       )


class MonitoringLocation:

    service_endpoint = app.config['SERVICE_ROOT']

    def __init__(self, monitoring_location_number, agency_cd='USGS'):
        """
        A monitoring location object.

        Attributes:
            location_number (str): identifier for the monitoring location
            agency_code (str): agency that "owns" the monitoring location
            location_name (str): full name of the monitoring location
            latitude (str): decimal latitude
            longitude (str): decimal longitude

        :param: str monitoring_location_number: identifier for the monitoring location
        :param: str agency_cd: agency that "owns" the monitoring location; defaults to 'USGS'

        """
        self.location_number = monitoring_location_number
        self.agency_code = agency_cd
        self._resp, self._site_info = self._get_location_info()
        self.location_name = self.__get_location_attribute('station_nm')
        self.latitude = self.__get_location_attribute('dec_lat_va')
        self.longitude = self.__get_location_attribute('dec_long_va')

    def _get_location_info(self):
        """
        Perform a web service call get basic information
        about a site and the types of data available at the
        site.

        :return: records of they types of data at the site
        :rtype: list

        """
        params = {'format': 'rdb',
                  'sites': self.location_number,
                  'seriesCatalogOutput': True,
                  'siteStatus': 'all',
                  'agencyCd': self.agency_code
                  }
        resp = execute_get_request(self.service_endpoint, '/nwis/site/', params)
        if resp.status_code != 200:
            return resp, []
        else:
            parsed_rdb = parse_rdb(resp.iter_lines(decode_unicode=True))
        return resp, list(parsed_rdb)

    def __get_location_attribute(self, attribute_name):
        """
        Internal method to extract the value attribute from a list
        of dictionaries.

        :param str attribute_name: name of the attribute to be retrived.
        :return: attribute value

        """
        try:
            attr_value = self._site_info[0][attribute_name]
        except (IndexError, KeyError):
            attr_value = None
        return attr_value

    def get_expanded_metadata(self):
        """
        Get the expanded metadata for a site.

        Note that the 'siteOutput' query parameter
        cannot be used with the 'seriesCatalogOutput' parameter.
        So, we have to make another webservice call.

        :return: response object and expanded metadata
        :rtype: tuple

        """
        params = {'format': 'rdb',
                  'site': self.location_number,
                  'siteOutput': 'expanded',
                  'agencyCd': self.agency_code
                  }
        resp = execute_get_request(self.service_endpoint, '/nwis/site/', params)
        if resp.status_code != 200:
            return resp, {}
        else:
            parsed_rdb = parse_rdb(resp.iter_lines(decode_unicode=True))
            expanded_data = next(parsed_rdb)
        return resp, expanded_data

    def get_capabilities(self):
        """
        Determine the parameters measured at the site.

        :return: USGS parameter codes measured at a site
        :rtype: set

        """
        supported_params = set([timeseries['parm_cd'] for timeseries in self._site_info])
        return supported_params

    def get_site_parameter(self, parameter_cd):
        """
        Determine the period of record and number of records for a
        parameter being measured at this site. If the parameter code
        value specified is not available at this site, None is returned.

        :param str parameter_cd: the USGS parameter code of interest
        :return: a parameter's "start_date", "end_date", and "record_count" if available; dates are Python date objects
        :rtype: dict or None

        """
        try:
            param_series = next((timeseries for timeseries in self._site_info
                                 if timeseries['parm_cd'] == parameter_cd))
        except StopIteration:
            return None
        else:
            record_start_date = param_series['begin_date']
            record_end_date = param_series['end_date']
            start_date = datetime.datetime.strptime(record_start_date, '%Y-%m-%d').date()
            end_date = datetime.datetime.strptime(record_end_date, '%Y-%m-%d').date()
            record_count = param_series['count_nu']
            parameter = Parameter(parameter_cd=parameter_cd,
                                  start_date=start_date,
                                  end_date=end_date,
                                  record_count=record_count
                                  )
        return parameter

    def build_linked_data(self):
        """
        Given site metadata, construct a dictionary / json-ld for the site.
        The constructed json-ld conforms to the context documents
        at https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld
        and https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld.

        If a site is missing a piece of data that is needed by the json-ld,
        an empty dictionary is returned.

        :return: json-ld key value pairs
        :rtype: dict

        """
        if self._resp.status_code == 200:
            contexts = ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                        'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                        ]
            linked_data = {'@context': contexts,
                           '@id': 'https://waterdata.usgs.gov/monitoring-location/{}'.format(self.location_number),
                           '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                           'name': self.location_name,
                           'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no={}'.format(self.location_number),
                           'HY_HydroLocationType': 'hydrometricStation',
                           'geo': {'@type': 'schema:GeoCoordinates',
                                   'latitude': self.latitude,
                                   'longitude': self.longitude
                                   }
                           }
            location_caps = self.get_capabilities()
            if '00060' in location_caps:
                linked_data['image'] = ('https://waterdata.usgs.gov/nwisweb/graph?'
                                        'agency_cd={0}&site_no={1}&parm_cd=00060&period=100').format(self.agency_code,
                                                                                                     self.location_number
                                                                                                     )
        else:
            linked_data = {}
        return linked_data
