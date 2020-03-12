"""
Unit tests for waterdata.waterservices classes and functions.

"""
from unittest import TestCase

from pendulum import datetime

from .. import app
from ..location_utils import (
    build_linked_data, get_disambiguated_values, get_state_abbreviation, rollup_dataseries,
    get_period_of_record_by_parm_cd
)


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
        self.assertEqual(
            get_disambiguated_values({}, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            {}
        )

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
            expected_location
        )

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
            'state_cd': {'name': 'Alabama', 'abbreviation': 'AL', 'code': '01'},
            'district_cd': {'name': 'Alaska', 'abbreviation': 'AK', 'code': '02'},
            'county_cd': {'name': 'Baldwin County', 'code': '002'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location
        )

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
            'state_cd': {'name': 'Alabama', 'abbreviation': 'AL', 'code': '01'},
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
            'state_cd': {'name': 'Alberta', 'abbreviation': None, 'code': '01'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location
        )

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
            'state_cd': {'name': '10', 'abbreviation': None, 'code': '10'},
            'district_cd': {'name': '11', 'abbreviation': None, 'code': '11'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(
                test_location, self.test_code_lookups,
                self.test_country_state_county_lookup, {}
            ),
            expected_location
        )

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
            'state_cd': {'name': '10', 'abbreviation': None, 'code': '10'},
            'county_cd': {'name': '004', 'code': '004'}
        }
        self.assertEqual(
            get_disambiguated_values(test_location, self.test_code_lookups, self.test_country_state_county_lookup, {}),
            expected_location
        )

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
            expected_location
        )

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
            expected_location
        )

    def test_missing_county(self):
        test_location = {
            'site_no': '12345678',
            'country_cd': 'US',
            'state_cd': '01',
        }
        expected_location = {
            'site_no': {'name': '12345678', 'code': '12345678'},
            'country_cd': {'name': 'US', 'code': 'US'},
            'state_cd': {'name': 'Alabama', 'abbreviation': 'AL', 'code': '01'},
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
                'huc_cd': {'name': 'New England Region', 'code': '01', 'url': '/hydrological-unit/01/'}
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
                'huc_cd': {'name': 'Upper St. John', 'code': '01010001', 'url': '/hydrological-unit/01010001/'}
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
                'huc_cd': {'name': None, 'code': '01010002', 'url': '/hydrological-unit/01010002/'}
            }
            self.assertEqual(
                get_disambiguated_values(test_location, {}, {}, self.test_huc_lookup),
                expected_location
            )


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


class TestGetStateAbbreviation(TestCase):

    def test_state_found(self):
        self.assertEqual(get_state_abbreviation('California'), 'CA')

    def test_state_not_found(self):
        self.assertIsNone(get_state_abbreviation('Tenochtitlan'))


class TestRollupDataseries(TestCase):

    def setUp(self):
        self.test_data = [
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'ad', 'name': 'USGS Annual Water Data Reports Site'},
                'parm_cd': {'code': '', 'name': ''}, 'parm_grp_cd': {'code': '', 'name': ''},
                'begin_date': {'name': '1980', 'code': '1980'}, 'end_date': {'name': '1992', 'code': '1992'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'ad', 'name': 'USGS Annual Water Data Reports Site'},
                'parm_cd': {'code': '', 'name': ''}, 'parm_grp_cd': {'code': '', 'name': ''},
                'begin_date': {'name': '2006', 'code': '2006'}, 'end_date': {'name': '2016', 'code': '2016'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'pk', 'name': 'Peak Measurements'}, 'parm_cd': {'code': '', 'name': ''},
                'parm_grp_cd': {'code': '', 'name': ''}, 'begin_date': {'name': '1942-09-18', 'code': '1942-09-18'},
                'end_date': {'name': '2016-06-13', 'code': '2016-06-13'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'uv', 'name': 'Unit Values'},
                'parm_cd': {'code': '00010', 'name': 'Temperature, water, degrees Celsius', 'group': 'Physical'},
                'parm_grp_cd': {'code': '', 'name': 'Physical'},
                'begin_date': {'name': '1977-06-20', 'code': '1977-06-20'},
                'end_date': {'name': '2015-03-26', 'code': '2015-03-26'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'uv', 'name': 'Unit Values'},
                'parm_cd': {'code': '00060', 'name': 'Discharge, ft3/s', 'group': 'Physical'},
                'parm_grp_cd': {'code': '', 'name': 'Physical'},
                'begin_date': {'name': '1977-06-20', 'code': '1977-06-20'},
                'end_date': {'name': '2015-03-26', 'code': '2015-03-26'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'dv', 'name': 'Daily Values'},
                'parm_cd': {'code': '00010', 'name': 'Temperature, water, degrees Celsius', 'group': 'Physical'},
                'parm_grp_cd': {'code': '', 'name': 'Physical'},
                'begin_date': {'name': '1978-06-20', 'code': '1978-06-20'},
                'end_date': {'name': '2017-03-26', 'code': '2017-03-26'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'sv', 'name': 'Site Visits'}, 'parm_cd': {'code': '', 'name': ''},
                'parm_grp_cd': {'code': '', 'name': ''}, 'begin_date': {'name': '1942-09-18', 'code': '1942-09-18'},
                'end_date': {'name': '2016-06-13', 'code': '2016-06-13'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'qw', 'name': 'Water-quality'},
                'parm_cd': {
                    'code': '00618',
                    'name': 'Nitrate, water, filtered, milligrams per liter as nitrogen',
                    'group': 'Nutrient'
                },
                'parm_grp_cd': {'code': 'NUT', 'name': 'Nutrient'},
                'begin_date': {'name': '1992-05-06', 'code': '1992-05-06'},
                'end_date': {'name': '1993-09-07', 'code': '1993-09-07'}
            },
            {
                'agency_cd': {'code': 'USGS', 'name': 'U.S. Geological Survey'},
                'site_no': {'name': '04891899', 'code': '04891899'},
                'data_type_cd': {'code': 'qw', 'name': 'Water-quality'}, 'parm_cd': {'code': '', 'name': ''},
                'parm_grp_cd': {'code': 'ALL', 'name': 'ALL'},
                'begin_date': {'name': '1967-03-28', 'code': '1967-03-28'},
                'end_date': {'name': '1993-09-07', 'code': '1993-09-07'}
            },
        ]

    def test_series_no_group_and_code(self):
        result = rollup_dataseries(self.test_data[:3])
        start_dates = set([series_grp['start_date'] for series_grp in result])
        end_dates = set([series_grp['end_date'] for series_grp in result])
        self.assertEqual(len(result), 2)
        self.assertIsNone(result[0]['name'])
        self.assertSetEqual(start_dates, {datetime(1942, 9, 18), datetime(1980, 1, 1)})
        self.assertSetEqual(end_dates, {datetime(2016, 1, 1), datetime(2016, 6, 13)})

    def test_series_group_and_code(self):
        result = rollup_dataseries(self.test_data[3:6])
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]['start_date'], datetime(1977, 6, 20))
        self.assertEqual(result[0]['end_date'], datetime(2017, 3, 26))
        self.assertEqual(result[0]['data_types'], 'Daily Values, Unit Values')
        self.assertEqual(result[0]['name'], 'Physical')
        self.assertEqual(len(result[0]['parameters']), 2)

    def test_successful_rollup(self):
        result = rollup_dataseries(self.test_data)
        self.assertEqual(len(result), 5)
        self.assertSetEqual(set(result[0].keys()), {'start_date', 'name', 'parameters', 'end_date', 'data_types'})
        self.assertSetEqual(
            set(result[0]['parameters'][0].keys()),
            {'start_date', 'end_date', 'parameter_name', 'data_types', 'parameter_code'}
        )

class TestGetPeriodOfRecordByParmCd(TestCase):

    def setUp(self):
        self.test_data = [{
            'agency_cd': 'USGS',
            'site_no': '01646500',
            'data_type_cd': 'uv',
            'parm_cd': '00060',
            'ts_id': 'One',
            'begin_date': '2001-01-04',
            'end_date': '2018-03-01'
        }, {
            'agency_cd': 'USGS',
            'site_no': '01646500',
            'data_type_cd': 'uv',
            'parm_cd': '00065',
            'ts_id': 'One',
            'begin_date': '2001-01-04',
            'end_date': '2018-03-01'
        }, {
            'agency_cd': 'USGS',
            'site_no': '01646500',
            'data_type_cd': 'uv',
            'parm_cd': '00065',
            'ts_id': 'Two',
            'begin_date': '2004-01-04',
            'end_date': '2019-03-01'
        }, {
            'agency_cd': 'USGS',
            'site_no': '01646500',
            'data_type_cd': 'dv',
            'parm_cd': '00060',
            'ts_id': 'One',
            'begin_date': '1990-01-04',
            'end_date': '2018-03-01'
        }
    ]

    def test_empty_site_records(self):
        self.assertEqual(get_period_of_record_by_parm_cd([]), {})

    def test_no_data_type_cd(self):
        self.assertEqual(get_period_of_record_by_parm_cd(self.test_data, 'wq'), {})

    def test_one_record_per_parm(self):
        self.assertEqual(get_period_of_record_by_parm_cd(self.test_data, 'dv'), {
            '00060': {
                'begin_date': '1990-01-04',
                'end_date': '2018-03-01'
            }
        })

    def test_two_record_per_parm(self):
        self.assertEqual(get_period_of_record_by_parm_cd(self.test_data), {
            '00060': {
                'begin_date': '2001-01-04',
                'end_date': '2018-03-01'
            },
            '00065': {
                'begin_date': '2001-01-04',
                'end_date': '2019-03-01'
            }
        })