"""
Unit tests for waterdata.waterservices classes and functions.

"""
import datetime
from unittest import TestCase

import requests_mock

from ..location import MonitoringLocation


class TestMonitoringLocation(TestCase):

    def setUp(self):
        self.test_site = '01630500'
        self.test_url = ('https://waterservices.usgs.gov/nwis/site/'
                         '?format=rdb&sites={}&seriesCatalogOutput=true'
                         '&siteStatus=all&agencyCd=USGS'
                         ).format(self.test_site)
        self.test_rdb_text = ('#\nagency_cd\tsite_no\tstation_nm\tsite_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\t'
                              'dec_coord_datum_cd\talt_va\talt_acy_va\talt_datum_cd\thuc_cd\tdata_type_cd\tparm_cd\t'
                              'stat_cd\tts_id\tloc_web_ds\tmedium_grp_cd\tparm_grp_cd\tsrs_id\taccess_cd\tbegin_date\t'
                              'end_date\tcount_nu\n5s\t15s\t50s\t7s\t16s\t16s\t1s\t10s\t8s\t3s\t10s\t16s\t2s\t5s\t5s\t'
                              '5n\t30s\t3s\t3s\t5n\t4n\t20d\t20d\t5n\nUSGS\t01646500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\t'
                              'S\tNAD83\t 37.20\t .1\tNAVD88\t'
                              '02070008\tuv\t00010\t\t69930\t4.1 ft from riverbed (middle)\twat\t\t1645597\t0\t'
                              '2007-10-01\t2018-01-10\t3754\nUSGS\t01646500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                              'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69931\t'
                              '1.0 ft from riverbed (bottom)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
                              '01646500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69932\t'
                              '7.1 ft from riverbed (top)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
                              '01646500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69942\t'
                              'From multiparameter sonde\twat\t\t1645597\t0\t2013-11-23\t2018-01-10\t1509\nUSGS\t'
                              '01646500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00060\t\t69928\t\twat\t\t'
                              '1645423\t0\t1972-06-09\t2018-01-10\t16651\nUSGS\t01646500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00065\t\t69929\t\twat\t\t'
                              '17164583\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01646500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                              'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69933\t7.1 ft from riverbed (top)\t'
                              'wat\t\t1646694\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01646500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                              'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69943\tFrom multiparameter sonde\t'
                              'wat\t\t1646694\t0\t2013-11-23\t2018-01-10\t1509\n'
                              )
        self.rdb_no_discharge = ('#\nagency_cd\tsite_no\tstation_nm\tsite_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\t'
                                 'dec_coord_datum_cd\talt_va\talt_acy_va\talt_datum_cd\thuc_cd\tdata_type_cd\tparm_cd\t'
                                 'stat_cd\tts_id\tloc_web_ds\tmedium_grp_cd\tparm_grp_cd\t'
                                 'srs_id\taccess_cd\tbegin_date\t'
                                 'end_date\tcount_nu\n5s\t15s\t50s\t7s\t16s\t16s\t1s\t'
                                 '10s\t8s\t3s\t10s\t16s\t2s\t5s\t5s\t'
                                 '5n\t30s\t3s\t3s\t5n\t4n\t20d\t20d\t5n\nUSGS\t01646500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\t'
                                 'S\tNAD83\t 37.20\t .1\tNAVD88\t'
                                 '02070008\tuv\t00010\t\t69930\t4.1 ft from riverbed (middle)\twat\t\t1645597\t0\t'
                                 '2007-10-01\t2018-01-10\t3754\nUSGS\t01646500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                                 'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69931\t'
                                 '1.0 ft from riverbed (bottom)\twat\t\t1645597\t0\t'
                                 '2007-10-01\t2018-01-10\t3754\nUSGS\t'
                                 '01646500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                                 '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69932\t'
                                 '7.1 ft from riverbed (top)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
                                 '01646500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                                 '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69942\t'
                                 'From multiparameter sonde\twat\t\t1645597\t0\t2013-11-23\t'
                                 '2018-01-10\t1509\nUSGS\t01646500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                                 '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00065\t\t69929\t\twat\t\t'
                                 '17164583\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01646500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                                 'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t'
                                 '69933\t7.1 ft from riverbed (top)\t'
                                 'wat\t\t1646694\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01646500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                                 'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69943\tFrom multiparameter sonde\t'
                                 'wat\t\t1646694\t0\t2013-11-23\t2018-01-10\t1509\n'
                                 )

    @requests_mock.mock()
    def test_site_with_params(self, r_mock):
        r_mock.get(self.test_url, status_code=200, text=self.test_rdb_text, reason='OK')
        ml = MonitoringLocation(self.test_site)
        site_capabilities = ml.get_capabilities()
        expected_capabilities = {'00060', '00010', '00095', '00065'}
        discharge_dates = ml.get_site_parameter('00060')
        expected_dates = {'parameter_cd': '00060',
                          'start_date': datetime.date(1972, 6, 9),
                          'end_date': datetime.date(2018, 1, 10),
                          'record_count': '16651'
                          }
        no_param = ml.get_site_parameter('12345')
        # assertions against attributes
        self.assertEqual(ml.latitude, '38.94977778')
        self.assertEqual(ml.longitude, '-77.12763889')
        self.assertEqual(ml.location_name, 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA')
        # assertions against methods
        self.assertEqual(ml.location_number, self.test_site)
        self.assertSetEqual(site_capabilities, expected_capabilities)
        self.assertDictEqual(discharge_dates, expected_dates)
        self.assertIsNone(no_param)

    @requests_mock.mock()
    def test_no_site_matching_request(self, r_mock):
        r_mock.get(self.test_url, status_code=404, reason='No sites found matching this request.')
        ml = MonitoringLocation(self.test_site)
        site_capabilities = ml.get_capabilities()
        discharge_dates = ml.get_site_parameter('00060')
        self.assertIsNone(ml.latitude)
        self.assertIsNone(ml.longitude)
        self.assertIsNone(ml.location_name)
        self.assertFalse(site_capabilities)
        self.assertIsNone(discharge_dates)

    @requests_mock.mock()
    def test_json_ld(self, r_mock):
        r_mock.get(self.test_url, status_code=200, text=self.test_rdb_text, reason='OK')
        ml = MonitoringLocation(self.test_site)
        json_ld = ml.build_linked_data()
        expected = {'@context': ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                                 'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                                 ],
                    '@id': 'https://waterdata.usgs.gov/monitoring-location/01630500',
                    '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                    'name': 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA',
                    'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no=01630500',
                    'HY_HydroLocationType': 'hydrometricStation',
                    'geo': {'@type': 'schema:GeoCoordinates', 'latitude': '38.94977778', 'longitude': '-77.12763889'},
                    'image': ('https://waterdata.usgs.gov/nwisweb/graph?'
                              'agency_cd=USGS&site_no=01630500&parm_cd=00060&period=100')
                    }
        self.assertDictEqual(json_ld, expected)

    @requests_mock.mock()
    def test_json_ld_no_discharge(self, r_mock):
        r_mock.get(self.test_url, status_code=200, text=self.rdb_no_discharge, reason='OK')
        ml = MonitoringLocation(self.test_site)
        json_ld = ml.build_linked_data()
        expected = {'@context': ['https://opengeospatial.github.io/ELFIE/json-ld/elf-index.jsonld',
                                 'https://opengeospatial.github.io/ELFIE/json-ld/hyf.jsonld'
                                 ],
                    '@id': 'https://waterdata.usgs.gov/monitoring-location/01630500',
                    '@type': 'http://www.opengeospatial.org/standards/waterml2/hy_features/HY_HydroLocation',
                    'name': 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA',
                    'sameAs': 'https://waterdata.usgs.gov/nwis/inventory/?site_no=01630500',
                    'HY_HydroLocationType': 'hydrometricStation',
                    'geo': {'@type': 'schema:GeoCoordinates', 'latitude': '38.94977778', 'longitude': '-77.12763889'}
                    }
        self.assertDictEqual(json_ld, expected)
        self.assertNotIn('image', json_ld.keys())
