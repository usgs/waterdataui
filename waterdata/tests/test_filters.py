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

    def test_non_vowel(self):
        self.assertEqual(filters.use_correct_indefinite_article(self.non_vowel), 'a')

    def test_article_vowel(self):
        self.assertEqual(filters.use_correct_indefinite_article(self.vowel), 'an')


class TestDataStartYearFilter(TestCase):

    def setUp(self):
        self.test_series = [
            {
                'start_date': datetime.datetime(1889, 2, 28),
                'end_date': datetime.datetime(2017, 5, 27),
                'data_types': ['Data Types'],
                'parameter_code': '00060',
                'parameter_name': 'Discharge, dm3/s'
            },
            {
                'start_date': datetime.datetime(1890, 12, 1),
                'end_date': datetime.datetime(2018, 3, 25),
                'data_types': ['Data Types'],
                'parameter_code': '00010',
                'parameter_name': 'Temperature, K'
            }
        ]

    def test_series_is_empty(self):
        result = filters.data_start_year([])
        expected = 'unknown'
        self.assertEqual(result, expected)

    def test_series_has_data(self):
        result = filters.data_start_year(self.test_series)
        expected = '1889'
        self.assertEqual(result, expected)


class TestReadableParmListFilter(TestCase):

    def setUp(self):
        self.test_series = [
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
            },
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

    def test_series_is_empty(self):
        result = filters.readable_param_list([])
        expected = 'unknown'
        self.assertEqual(result, expected)

    def test_single_measured_parameter(self):
        result = filters.readable_param_list(self.test_series[:1])
        expected = 'ANTIMATTER'
        self.assertEqual(result, expected)

    def test_two_measured_parameters(self):
        result = filters.readable_param_list(self.test_series[:2])
        expected = 'ANTIMATTER and MATTER'
        self.assertEqual(result, expected)

    def test_three_measured_parameters(self):
        result = filters.readable_param_list(self.test_series[:3])
        expected = 'DISCHARGE, ANTIMATTER, and MATTER'
        self.assertEqual(result, expected)

    def test_four_measured_parameters(self):
        result = filters.readable_param_list(self.test_series)
        expected = 'DISCHARGE, TEMPERATURE, ANTIMATTER, and MORE'
        self.assertEqual(result, expected)
