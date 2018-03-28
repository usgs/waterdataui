"""
Unit tests for Jinja2 filters.
"""
import datetime
from unittest import TestCase

from waterdata import filters


def test_asset_url_filter_manifest(app, mocker):
    mocker.patch.dict(app.config, {
        'STATIC_ROOT': 'root/path/',
        'ASSET_MANIFEST': {
            'src.css': 'dest.css'
        }
    })
    assert filters.asset_url_filter('src.css') == 'root/path/dest.css'


def test_asset_url_filter_no_manifest(app, mocker):
    mocker.patch.dict(app.config, {'STATIC_ROOT': 'root/path/'})
    assert filters.asset_url_filter('src.css') == 'root/path/src.css'


class TestIndefiniteArticleFilter(TestCase):

    def setUp(self):
        self.non_vowel = 'Mango'
        self.vowel = 'Apple'

    def test_assert_indefinite_article_non_vowel(self):
        self.assertEqual(filters.use_correct_indefinite_article(self.non_vowel), 'a')

    def test_assert_indefinite_article_vowel(self):
        self.assertEqual(filters.use_correct_indefinite_article(self.vowel), 'an')


class TestExtendedDescriptionFilter(TestCase):

    def setUp(self):
        self.location_id = '005667129'
        self.location_type = 'STREAM'
        self.county = 'DANE COUNTY'
        self.state = 'WISCONSIN'
        self.grp_with_one_parm = {
            'Inorganic': {
                'start_date': '1908-01-03',
                'end_date': '2016-03-23',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1908, 1, 3),
                        'end_date': datetime.datetime(2016, 3, 23),
                        'data_types': ['Data Types'],
                        'parameter_code': '09001',
                        'parameter_name': 'Antimatter, liters'
                    }
                ]
            }
        }
        self.grp_with_two_parm = {
            'Inorganic': {
                'start_date': '1908-01-03',
                'end_date': '2016-03-23',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1908, 1, 3),
                        'end_date': datetime.datetime(2016, 3, 23),
                        'data_types': ['Data Types'],
                        'parameter_code': '09001',
                        'parameter_name': 'Antimatter, liters'
                    }
                ]
            },
            'Physical': {
                'start_date': '1918-01-19',
                'end_date': '2018-03-25',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1918, 1, 3),
                        'end_date': datetime.datetime(2018, 3, 25),
                        'data_types': ['Data Types'],
                        'parameter_code': '00060',
                        'parameter_name': 'Discharge, dm3/s'
                    }
                ]
            },
        }
        self.grp_with_three_parm = {
            'Inorganic': {
                'start_date': '1908-01-03',
                'end_date': '2016-03-23',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1908, 1, 3),
                        'end_date': datetime.datetime(2016, 3, 23),
                        'data_types': ['Data Types'],
                        'parameter_code': '09001',
                        'parameter_name': 'Antimatter, liters'
                    }
                ]
            },
            'Physical': {
                'start_date': '1908-01-19',
                'end_date': '2018-03-25',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1908, 1, 19),
                        'end_date': datetime.datetime(2018, 3, 25),
                        'data_types': ['Data Types'],
                        'parameter_code': '00060',
                        'parameter_name': 'Discharge, dm3/s'
                    },
                    {
                        'start_date': datetime.datetime(1908, 1, 19),
                        'end_date': datetime.datetime(2018, 3, 25),
                        'data_types': ['Data Types'],
                        'parameter_code': '00010',
                        'parameter_name': 'Temperature, K'
                    }
                ]
            },
        }
        self.grp_with_four_parm = {
            'Inorganic': {
                'start_date': '1908-01-03',
                'end_date': '2016-03-23',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1908, 1, 3),
                        'end_date': datetime.datetime(2016, 3, 23),
                        'data_types': ['Data Types'],
                        'parameter_code': '09001',
                        'parameter_name': 'Antimatter, liters'
                    },
                    {
                        'start_date': datetime.datetime(1908, 1, 3),
                        'end_date': datetime.datetime(2016, 3, 23),
                        'data_types': ['Data Types'],
                        'parameter_code': '09002',
                        'parameter_name': 'Matter, liters'
                    }
                ]
            },
            'Physical': {
                'start_date': '1908-01-19',
                'end_date': '2018-03-25',
                'data_types': 'Data Types',
                'parameters': [
                    {
                        'start_date': datetime.datetime(1908, 1, 19),
                        'end_date': datetime.datetime(2018, 3, 25),
                        'data_types': ['Data Types'],
                        'parameter_code': '00060',
                        'parameter_name': 'Discharge, dm3/s'
                    },
                    {
                        'start_date': datetime.datetime(1908, 1, 19),
                        'end_date': datetime.datetime(2018, 3, 25),
                        'data_types': ['Data Types'],
                        'parameter_code': '00010',
                        'parameter_name': 'Temperature, K'
                    }
                ]
            },
        }

    def test_rollup_group_is_empty(self):
        result = filters.create_extended_desc({})
        expected = ''
        self.assertEqual(result, expected)

    def test_single_measured_parameter(self):
        result = filters.create_extended_desc(self.grp_with_one_parm)
        expected = (
            'Current conditions of ANTIMATTER are available. Water data back to 1908 are available online.'
        )
        self.assertEqual(result, expected)

    def test_two_measured_parameters(self):
        result = filters.create_extended_desc(self.grp_with_two_parm)
        expected = (
            'Current conditions of DISCHARGE and ANTIMATTER are available. '
            'Water data back to 1908 are available online.'
        )
        self.assertEqual(result, expected)

    def test_three_measured_parameters(self):
        result = filters.create_extended_desc(self.grp_with_three_parm)
        expected = (
            'Current conditions of DISCHARGE, TEMPERATURE, and ANTIMATTER are available. '
            'Water data back to 1908 are available online.'
        )
        self.assertEqual(result, expected)

    def test_four_measured_parameters(self):
        result = filters.create_extended_desc(self.grp_with_four_parm)
        expected = (
            'Current conditions of DISCHARGE, TEMPERATURE, ANTIMATTER, and MORE are available. '
            'Water data back to 1908 are available online.'
        )
        self.assertEqual(result, expected)
