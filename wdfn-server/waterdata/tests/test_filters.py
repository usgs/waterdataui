"""
Unit tests for Jinja2 filters.
"""
import datetime
from unittest import TestCase

import pendulum

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
                'parameters': [
                    {
                        'start_date': pendulum.Pendulum(1889, 2, 28),
                        'end_date': pendulum.Pendulum(2017, 5, 27),
                        'data_types': ['Data Types'],
                        'parameter_code': '00060',
                        'parameter_name': 'Discharge, dm3/s'
                    },
                    {
                        'start_date': pendulum.Pendulum(1890, 12, 1),
                        'end_date': pendulum.Pendulum(2018, 3, 25),
                        'data_types': ['Data Types'],
                        'parameter_code': '00010',
                        'parameter_name': 'Temperature, K'
                    }
                ]
            }
        ]

    def test_series_is_empty(self):
        result = filters.data_start_year([])
        self.assertIsNone(result)

    def test_series_has_data(self):
        result = filters.data_start_year(self.test_series)
        expected = '1889'
        self.assertEqual(result, expected)


class TestReadableParmListFilter(TestCase):

    def setUp(self):
        self.now = pendulum.now()
        self.recent = self.now.subtract_timedelta(datetime.timedelta(days=2))
        self.long_ago = self.now.subtract_timedelta(datetime.timedelta(days=10))
        self.physical_series = [
            {
                'start_date': pendulum.Pendulum(1908, 1, 3),
                'end_date': self.now,
                'data_types': ['Unit Values'],
                'parameter_code': '09001',
                'parameter_name': 'Antimatter, liters'
            },
            {
                'start_date': pendulum.Pendulum(1908, 1, 3),
                'end_date': self.recent,
                'data_types': ['Unit Values'],
                'parameter_code': '09002',
                'parameter_name': 'Matter, liters'
            },
            {
                'start_date': pendulum.Pendulum(1908, 1, 19),
                'end_date': self.recent,
                'data_types': ['Unit Values'],
                'parameter_code': '00060',
                'parameter_name': 'Discharge, dm3/s'
            },
            {
                'start_date': pendulum.Pendulum(1908, 1, 19),
                'end_date': self.recent,
                'data_types': ['Unit Values'],
                'parameter_code': '00010',
                'parameter_name': 'Temperature, K'
            },
            {
                'start_date': pendulum.Pendulum(1908, 1, 19),
                'end_date': self.recent,
                'data_types': ['Daily Values'],
                'parameter_code': '22140',
                'parameter_name': 'Turbidity'
            },
            {
                'start_date': pendulum.Pendulum(1908, 1, 19),
                'end_date': self.recent,
                'data_types': ['Daily Values'],
                'parameter_code': '22140',
                'parameter_name': 'Depth'
            }
        ]
        self.inorganic_series = [
            {
                'start_date': pendulum.Pendulum(1908, 1, 3),
                'end_date': self.now,
                'data_types': ['Unit Values', 'Daily Values'],
                'parameter_code': '07242',
                'parameter_name': 'Lead, g/mL'
            },
            {
                'start_date': pendulum.Pendulum(1999, 1, 26),
                'end_date': self.recent,
                'data_types': ['Unit Values', 'Daily Values'],
                'parameter_code': '02220',
                'parameter_name': 'Neptunium, ug/mL'
            }
        ]
        self.old_inorganic_series = [
            {
                'start_date': pendulum.Pendulum(1908, 1, 3),
                'end_date': self.long_ago,
                'data_types': ['Unit Values', 'Daily Values'],
                'parameter_code': '07242',
                'parameter_name': 'Lead, g/mL'
            },
            {
                'start_date': pendulum.Pendulum(1999, 1, 26),
                'end_date': self.long_ago,
                'data_types': ['Unit Values', 'Daily Values'],
                'parameter_code': '02220',
                'parameter_name': 'Neptunium, ug/mL'
            }
        ]

    def test_series_is_empty(self):
        result = filters.readable_param_list([])
        self.assertIsNone(result)

    def test_single_measured_parameter(self):
        result = filters.readable_param_list([{
            'parameters': self.physical_series[:1]
        }])
        expected = 'ANTIMATTER'
        self.assertEqual(result, expected)

    def test_two_measured_parameters(self):
        result = filters.readable_param_list([{
            'parameters': self.physical_series[:2]
        }])
        expected = 'ANTIMATTER and MATTER'
        self.assertEqual(result, expected)

    def test_three_measured_parameters(self):
        result = filters.readable_param_list([{
            'parameters': self.physical_series[:3],
            'data_types': 'Unit Values, Water Quality',
            'end_date': datetime.datetime.now()
        }])
        expected = 'ANTIMATTER, DISCHARGE, and MATTER'
        self.assertEqual(result, expected)

    def test_four_measured_parameters(self):
        result = filters.readable_param_list([{
            'parameters': self.physical_series,
            'data_types': 'Unit Values, Water Quality',
            'end_date': datetime.datetime.now()
        }])
        expected = 'ANTIMATTER, DISCHARGE, MATTER, and MORE'
        self.assertEqual(result, expected)

    def test_no_current_data(self):
        result = filters.readable_param_list([{
            'parameters': self.old_inorganic_series,
        }])
        self.assertIsNone(result)

    def test_no_unit_values(self):
        result = filters.readable_param_list([{
            'parameters': self.physical_series[-2:]
        }])
        self.assertIsNone(result)

    def test_mixed_data_types(self):
        result = filters.readable_param_list([
            {
                'parameters': self.physical_series[-2:]
            },
            {
                'parameters': self.inorganic_series,
            }
        ])
        expected = 'LEAD and NEPTUNIUM'
        self.assertEqual(result, expected)


class TestDateToStringFilter(TestCase):

    def setUp(self):
        self.test_dt = datetime.datetime(2018, 3, 25)
        self.test_pen_dt = pendulum.Pendulum(2018, 3, 25)

    def test_year_month_day(self):
        result = filters.date_to_string(self.test_dt)
        self.assertEqual(result, '2018-03-25')

    def test_pendulum_year_month_day(self):
        result = filters.date_to_string(self.test_pen_dt)
        self.assertEqual(result, '2018-03-25')


class TestTooltipContentIdFilter(TestCase):

    def setUp(self):
        self.test_string = 'Blah_Name'

    def test_create(self):
        result = filters.tooltip_content_id(self.test_string)
        self.assertEqual(result, 'tooltip-blah-name')
