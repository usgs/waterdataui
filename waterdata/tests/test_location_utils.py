"""
Unit tests for waterdata.waterservices classes and functions.

"""
import datetime
from unittest import TestCase

from waterdata import app
from waterdata.location_utils import Parameter, get_capabilities, get_site_parameter, build_linked_data,\
    get_disambiguated_values


class GetDisambiguatedValuesTestCase(TestCase):

    def setUp(self):
        self.test_code_lookups = {
            'agency_cd': {
                'USGS': {'name': 'U.S. Geological Survey'},
                'USEPA': {'name': 'U.S. Environmental Protection Agency'}

            },
            'nat_aqfr_cd': {
                'N100AKUNCD': {
                    'name': 'Alaska unconsolidated-deposit aquifers'
                },
                'N100ALLUVL': {
                    'name': 'Alluvial aquifers'
                },
                'N100BSNRGB': {
                    'name': 'Basin and Range basin-fill aquifers'
                },
            }
        }
        self.test_country_state_county_lookup = {
            'US': {
                'state_cd': {
                    '01': {
                        'name': 'Alabama',
                        'county_cd': {
                            '001': {'name': 'Autauga County'},
                            '002': {'name': 'Baldwin County'}
                        },
                    },
                    '02': {
                        'name': 'Alaska',
                        'county_cd': {
                            '013': 'Aleutians East Borough'
                        }
                    }
                }
            },
            'CA': {
                'state_cd': {
                    '01': {'name': 'Alberta'},
                    '02': {
                        'name': 'British Columbia'
                    },

                }
            }
        }
        self.test_huc_lookup = {
            "hucs": {
                "01": {
                    "children": [
                        "0101"
                    ],
                    "parent": None,
                    "kind": "HUC2",
                    "huc_cd": "01",
                    "huc_class_cd": "Region",
                    "huc_nm": "New England Region"
                },
                "0101": {
                    "children": [
                        "010100"
                    ],
                    "parent": "01",
                    "kind": "HUC4",
                    "huc_cd": "0101",
                    "huc_class_cd": "Subregion",
                    "huc_nm": "St. John"
                },
                "010100": {
                    "children": [
                        "01010001"
                    ],
                    "parent": "0101",
                    "kind": "HUC6",
                    "huc_cd": "010100",
                    "huc_class_cd": "Accounting Unit",
                    "huc_nm": "St. John"
                },
                "01010001": {
                    "children": [],
                    "parent": "010100",
                    "kind": "HUC8",
                    "huc_cd": "01010001",
                    "huc_class_cd": "Cataloging Unit",
                    "huc_nm": "Upper St. John"
                }
            },
            "classes": {
                "HUC2": [
                    "01"
                ],
                "HUC4": [
                    "0101"
                ],
                "HUC6": [
                    "010100"
                ],
                "HUC8": [
                    "01010001"
                ]
            }
        }

    def test_empty_location(self):
        self.assertEqual(get_disambiguated_values({}, self.test_code_lookups, self.test_country_state_county_lookup, {}),
                         {})

    def test_location_with_no_keys_in_lookups(self):
        test_location = {
            'station_name': 'This is a name',
            'site_no': '12345678'
        }
        expected_location = {
            'station_name': {'name': 'This is a name', 'code': 'This is a name'},
            'site_no': {'name': '12345678', 'code': '12345678'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location
        )

    def test_location_with_keys_in_code_lookups(self):
        test_location = {
            'site_no': '12345678',
            'agency_cd': 'USGS',
            'nat_aqfr_cd': 'N100BSNRGB'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'agency_cd': {'name': 'U.S. Geological Survey', 'code': 'USGS'},
            'nat_aqfr_cd': {'name': 'Basin and Range basin-fill aquifers', 'code': 'N100BSNRGB'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_location_with_key_values_not_in_code_lookups(self):
        test_location = {
            'site_no': '12345678',
            'agency_cd': 'USDA',
            'nat_aqfr_cd': 'N100BSNRGB'
        }
        expected_location = {
            'site_no': {'code': '12345678', 'name': '12345678'},
            'agency_cd': {'code': 'USDA', 'name': 'USDA'},
            'nat_aqfr_cd': {'code': 'N100BSNRGB', 'name': 'Basin and Range basin-fill aquifers'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_state_county_in_state_county_lookup(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'US',
            'state_cd': '01',
            'district_cd': '02',
            'county_cd': '002'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'US', 'code': 'US'},
            'state_cd': {'name': 'Alabama', 'code': '01'},
            'district_cd': {'name': 'Alaska', 'code': '02'},
            'county_cd': {'name': 'Baldwin County', 'code': '002'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_state_county_no_county_in_lookup(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'US',
            'state_cd': '01',
            'county_cd': '004'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'US', 'code': 'US'},
            'state_cd': {'name': 'Alabama', 'code': '01'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_state_with_no_counties_in_lookup(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'CA',
            'state_cd': '01',
            'county_cd': '004'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'CA', 'code': 'CA'},
            'state_cd': {'name': 'Alberta', 'code': '01'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_no_state_in_lookup(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'US',
            'state_cd': '10',
            'district_cd': '11',
            'county_cd': '004'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'US', 'code': 'US'},
            'state_cd': {'name': '10', 'code': '10'},
            'district_cd': {'name': '11', 'code': '11'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_no_country_in_lookup(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'MX',
            'state_cd': '10',
            'county_cd': '004'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'MX', 'code': 'MX'},
            'state_cd': {'name': '10', 'code': '10'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_missing_country(self):
        test_location = {
            'site_no': '12345678',
            'state_cd': '10',
            'county_cd': '004'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'state_cd': {'name': '10', 'code': '10'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_missing_state(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'US',
            'county_cd': '001'
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'US', 'code': 'US'},
            'county_cd': {'name': '001', 'code': '001'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location)

    def test_missing_county(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'US',
            'state_cd': '01',
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'US', 'code': 'US'},
            'state_cd': {'name': 'Alabama', 'code': '01'},
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location
        )

    def test_huc2(self):
        with app.test_request_context():
            test_location = {
                'huc_cd': '01'
            }
            expected_location = {
                'huc_cd': {'name': 'New England Region', 'code': '01', 'url': '/hydrological-unit/01'}
            }
            self.assertEqual(
                get_disambiguated_values(test_location, {}, {}, self.test_huc_lookup),
                expected_location
            )

    def test_huc8(self):
        with app.test_request_context():
            test_location = {
                'huc_cd': '01010001'
            }
            expected_location = {
                'huc_cd': {'name': 'Upper St. John', 'code': '01010001', 'url': '/hydrological-unit/01010001'}
            }
            self.assertEqual(
                get_disambiguated_values(test_location, {}, {}, self.test_huc_lookup),
                expected_location
            )

    def test_huc8_missing(self):
        with app.test_request_context():
            test_location = {
                'huc_cd': '01010002'
            }
            expected_location = {
                'huc_cd': {'name': None, 'code': '01010002', 'url': '/hydrological-unit/01010002'}
            }
            self.assertEqual(
                get_disambiguated_values(test_location, {}, {}, self.test_huc_lookup),
                expected_location
            )


class TestGetCapabilities(TestCase):

    def setUp(self):
        self.param_00060 = {'parm_cd': '00060',
                            'begin_date': '1990-07-08',
                            'end_date': '2001-08-12',
                            'count_nu': '871'
                            }
        self.param_00010 = {'parm_cd': '00010',
                            'begin_date': '2007-10-01',
                            'end_date': '2018-01-10',
                            'count_nu': '3754'
                            }
        self.param_00095 = {'parm_cd': '00095',
                            'begin_date': '2007-10-01',
                            'end_date': '2018-01-10',
                            'count_nu': '198'
                            }
        self.param_00065 = {'parm_cd': '00065',
                            'begin_date': '2007-10-01',
                            'end_date': '2018-01-10',
                            'count_nu': '800'
                            }
        self.test_rdb_param_data = [self.param_00010, self.param_00060, self.param_00065, self.param_00095]

    def test_get_capabilities(self):
        result = get_capabilities(self.test_rdb_param_data)
        expected = {'00060', '00010', '00095', '00065'}
        self.assertSetEqual(result, expected)

    def test_get_empty(self):
        result = get_capabilities([])
        self.assertFalse(result)


class TestGetSiteParameter(TestCase):

    def setUp(self):
        self.test_code = '00010'
        self.param_00060 = {'parm_cd': '00060',
                            'begin_date': '1990-07-08',
                            'end_date': '2001-08-12',
                            'count_nu': '871'
                            }
        self.param_00010 = {'parm_cd': '00010',
                            'begin_date': '2007-10-01',
                            'end_date': '2018-01-10',
                            'count_nu': '3754'
                            }
        self.param_00095 = {'parm_cd': '00095',
                            'begin_date': '2007-10-01',
                            'end_date': '2018-01-10',
                            'count_nu': '198'
                            }
        self.param_00065 = {'parm_cd': '00065',
                            'begin_date': '2007-10-01',
                            'end_date': '2018-01-10',
                            'count_nu': '800'
                            }
        self.test_rdb_param_data = [self.param_00010, self.param_00060, self.param_00065, self.param_00095]

    def test_code_found(self):
        result = get_site_parameter(self.test_rdb_param_data, self.test_code)
        expected = Parameter(parameter_cd=self.test_code,
                             start_date=datetime.date(2007, 10, 1),
                             end_date=datetime.date(2018, 1, 10),
                             record_count='3754'
                             )
        self.assertEqual(result, expected)

    def test_code_not_found(self):
        result = get_site_parameter(self.test_rdb_param_data, 'blah')
        self.assertIsNone(result)


class TestBuildLinkedData(TestCase):

    def setUp(self):
        self.loc_number = '09876543'
        self.loc_name = 'Gliese 536 b'
        self.agency_code = 'Cat Leadership Academy'
        self.latitude = '-800.12'
        self.longitude = '12.12'
        self.caps_with_discharge = {'00060', '00065'}
        self.caps_sans_discharge = {'00065', '00090'}

    def test_with_discharge(self):
        result = build_linked_data(self.loc_number,
                                   self.loc_name,
                                   self.agency_code,
                                   self.latitude,
                                   self.longitude,
                                   self.caps_with_discharge
                                   )
        expected = {'@context': ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                                 'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                                 ],
                    '@id': 'https://waterdata.usgs.gov/monitoring-location/09876543',
                    '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                    'name': 'Gliese 536 b',
                    'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no=09876543',
                    'HY_HydroLocationType': 'hydrometricStation',
                    'geo': {'@type': 'schema:GeoCoordinates',
                            'latitude': '-800.12',
                            'longitude': '12.12'
                            },
                    'image': ('https://waterdata.usgs.gov/nwisweb/graph'
                              '?agency_cd=Cat Leadership Academy&site_no=09876543&parm_cd=00060&period=100'
                              )
                    }
        self.assertDictEqual(result, expected)

    def test_sans_discharge(self):
        result = build_linked_data(self.loc_number,
                                   self.loc_name,
                                   self.agency_code,
                                   self.latitude,
                                   self.longitude,
                                   self.caps_sans_discharge
                                   )
        expected = {'@context': ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                                 'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                                 ],
                    '@id': 'https://waterdata.usgs.gov/monitoring-location/09876543',
                    '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                    'name': 'Gliese 536 b',
                    'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no=09876543',
                    'HY_HydroLocationType': 'hydrometricStation',
                    'geo': {'@type': 'schema:GeoCoordinates',
                            'latitude': '-800.12',
                            'longitude': '12.12'
                            }
                    }
        self.assertDictEqual(result, expected)
