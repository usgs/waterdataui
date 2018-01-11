"""
Unit tests for waterdata.waterservices classes and functions.

"""
import datetime
from unittest import TestCase, mock

import requests as r

from ..location import Parameter, MonitoringLocation


class TestMonitoringLocation(TestCase):

    def setUp(self):
        # an actual test record may include many more columns from an RDB file record
        self.test_record = {'site_no': '01630500',
                            'agency_cd': 'USGS',
                            'station_nm': 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA',
                            'dec_lat_va': '38.94977778',
                            'dec_long_va': '-77.12763889'
                            }
        self.test_rdb_text = ('#\nagency_cd\tsite_no\tstation_nm\tsite_tp_cd\tdec_lat_va\tdec_long_va\tcoord_acy_cd\t'
                              'dec_coord_datum_cd\talt_va\talt_acy_va\talt_datum_cd\thuc_cd\tdata_type_cd\tparm_cd\t'
                              'stat_cd\tts_id\tloc_web_ds\tmedium_grp_cd\tparm_grp_cd\tsrs_id\taccess_cd\tbegin_date\t'
                              'end_date\tcount_nu\n5s\t15s\t50s\t7s\t16s\t16s\t1s\t10s\t8s\t3s\t10s\t16s\t2s\t5s\t5s\t'
                              '5n\t30s\t3s\t3s\t5n\t4n\t20d\t20d\t5n\nUSGS\t01630500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\t'
                              'S\tNAD83\t 37.20\t .1\tNAVD88\t'
                              '02070008\tuv\t00010\t\t69930\t4.1 ft from riverbed (middle)\twat\t\t1645597\t0\t'
                              '2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                              'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69931\t'
                              '1.0 ft from riverbed (bottom)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
                              '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69932\t'
                              '7.1 ft from riverbed (top)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
                              '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69942\t'
                              'From multiparameter sonde\twat\t\t1645597\t0\t2013-11-23\t2018-01-10\t1509\nUSGS\t'
                              '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00060\t\t69928\t\twat\t\t'
                              '1645423\t0\t1972-06-09\t2018-01-10\t16651\nUSGS\t01630500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                              '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00065\t\t69929\t\twat\t\t'
                              '17164583\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                              'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69933\t7.1 ft from riverbed (top)\t'
                              'wat\t\t1646694\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
                              'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                              'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69943\tFrom multiparameter sonde\t'
                              'wat\t\t1646694\t0\t2013-11-23\t2018-01-10\t1509'
                              )
        self.test_rdb_text_lines = self.test_rdb_text.split('\n')
        self.rdb_no_discharge = ('#\nagency_cd\tsite_no\tstation_nm\tsite_tp_cd\tdec_lat_va'
                                 '\tdec_long_va\tcoord_acy_cd\t'
                                 'dec_coord_datum_cd\talt_va\talt_acy_va\talt_datum_cd\thuc_cd\tdata_type_cd\tparm_cd\t'
                                 'stat_cd\tts_id\tloc_web_ds\tmedium_grp_cd\tparm_grp_cd\t'
                                 'srs_id\taccess_cd\tbegin_date\t'
                                 'end_date\tcount_nu\n5s\t15s\t50s\t7s\t16s\t16s\t1s\t'
                                 '10s\t8s\t3s\t10s\t16s\t2s\t5s\t5s\t'
                                 '5n\t30s\t3s\t3s\t5n\t4n\t20d\t20d\t5n\nUSGS\t01630500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\t'
                                 'S\tNAD83\t 37.20\t .1\tNAVD88\t'
                                 '02070008\tuv\t00010\t\t69930\t4.1 ft from riverbed (middle)\twat\t\t1645597\t0\t'
                                 '2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                                 'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69931\t'
                                 '1.0 ft from riverbed (bottom)\twat\t\t1645597\t0\t'
                                 '2007-10-01\t2018-01-10\t3754\nUSGS\t'
                                 '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                                 '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69932\t'
                                 '7.1 ft from riverbed (top)\twat\t\t1645597\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t'
                                 '01630500\tPOTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                                 '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00010\t\t69942\t'
                                 'From multiparameter sonde\twat\t\t1645597\t0\t2013-11-23\t'
                                 '2018-01-10\t1509\nUSGS\t01630500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t'
                                 '-77.12763889\tS\tNAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00065\t\t69929\t\twat\t\t'
                                 '17164583\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                                 'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t'
                                 '69933\t7.1 ft from riverbed (top)\t'
                                 'wat\t\t1646694\t0\t2007-10-01\t2018-01-10\t3754\nUSGS\t01630500\t'
                                 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA\tST\t38.94977778\t-77.12763889\tS\t'
                                 'NAD83\t 37.20\t .1\tNAVD88\t02070008\tuv\t00095\t\t69943\tFrom multiparameter sonde\t'
                                 'wat\t\t1646694\t0\t2013-11-23\t2018-01-10\t1509'
                                 )
        self.rdb_no_discharge_lines = self.rdb_no_discharge.split('\n')
        self.rdb_expanded_metadata = ('#\nagency_cd\tsite_no\tstation_nm\tsite_tp_cd\tlat_va\tlong_va\tdec_lat_va'
                                      '\tdec_long_va\tcoord_meth_cd\tcoord_acy_cd\tcoord_datum_cd\tdec_coord_datum_cd'
                                      '\tdistrict_cd\tstate_cd\tcounty_cd\tcountry_cd\tland_net_ds\tmap_nm'
                                      '\tmap_scale_fc\talt_va\talt_meth_cd\talt_acy_va\talt_datum_cd\thuc_cd'
                                      '\tbasin_cd\ttopo_cd\tinstruments_cd\tconstruction_dt\tinventory_dt'
                                      '\tdrain_area_va\tcontrib_drain_area_va\ttz_cd\tlocal_time_fg\treliability_cd'
                                      '\tgw_file_cd\tnat_aqfr_cd\taqfr_cd\taqfr_type_cd\twell_depth_va'
                                      '\thole_depth_va\tdepth_src_cd\tproject_no\n5s\t15s\t50s\t7s\t16s\t16s\t16s'
                                      '\t16s\t1s\t1s\t10s\t10s\t3s\t2s\t3s\t2s\t23s\t20s\t7s\t8s\t1s\t3s\t10s'
                                      '\t16s\t2s\t1s\t30s\t8s\t8s\t8s\t8s\t6s\t1s\t1s\t30s\t10s\t8s\t1s\t8s\t8s\t1s'
                                      '\t12s\nUSGS\t01630500\tBLAH\tST\t'
                                      '445110\t0921418\t-145.8527318\t-192.2380633\tM\tS\tNAD83\tNAD83\t55\t55'
                                      '\t093\tUS\t  SENES6  T27N  R15W  4\tSPRING VALLEY\t  24000'
                                      '\t 900.04\tL\t.01\tNAVD88\t07050005\t\t'
                                      '\tNNYNYNYNNNNYNNNNYNNNNNNNNNNNNN\t\t\t64\t\tCST\tY'
                                      '\t\tNNNNNNNN\t\t\t\t\t\t\t249100100'
                                      )
        self.rdb_expanded_metadata_lines = self.rdb_expanded_metadata.split('\n')

    @mock.patch('waterdata.location.execute_get_request')
    def test_expanded_metadata(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        m_resp.iter_lines.return_value = iter(self.test_rdb_text_lines)
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
        m_resp.iter_lines.return_value = iter(self.rdb_expanded_metadata_lines)
        resp, expanded_metadata = ml.get_location_metadata(expanded=True)
        expected = {'agency_cd': 'USGS',
                    'site_no': '01630500',
                    'station_nm': 'BLAH',
                    'site_tp_cd': 'ST',
                    'lat_va': '445110',
                    'long_va': '0921418',
                    'dec_lat_va': '-145.8527318',
                    'dec_long_va': '-192.2380633',
                    'coord_meth_cd': 'M',
                    'coord_acy_cd': 'S',
                    'coord_datum_cd': 'NAD83',
                    'dec_coord_datum_cd': 'NAD83',
                    'district_cd': '55',
                    'state_cd': '55',
                    'county_cd': '093',
                    'country_cd': 'US',
                    'land_net_ds': '  SENES6  T27N  R15W  4',
                    'map_nm': 'SPRING VALLEY',
                    'map_scale_fc': '  24000',
                    'alt_va': ' 900.04',
                    'alt_meth_cd': 'L',
                    'alt_acy_va': '.01',
                    'alt_datum_cd': 'NAVD88',
                    'huc_cd': '07050005',
                    'basin_cd': '',
                    'topo_cd': '',
                    'instruments_cd': 'NNYNYNYNNNNYNNNNYNNNNNNNNNNNNN',
                    'construction_dt': '',
                    'inventory_dt': '',
                    'drain_area_va': '64',
                    'contrib_drain_area_va': '',
                    'tz_cd': 'CST',
                    'local_time_fg': 'Y',
                    'reliability_cd': '',
                    'gw_file_cd': 'NNNNNNNN',
                    'nat_aqfr_cd': '',
                    'aqfr_cd': '',
                    'aqfr_type_cd': '',
                    'well_depth_va': '',
                    'hole_depth_va': '',
                    'depth_src_cd': '',
                    'project_no': '249100100'
                    }
        r_mock.assert_called_with('https://waterservices.usgs.gov',
                                  '/nwis/site/',
                                  {'format': 'rdb', 'site': '01630500', 'agencyCd': 'USGS', 'siteOutput': 'expanded'}
                                  )
        self.assertIsInstance(resp, r.Response)
        self.assertDictEqual(expanded_metadata, expected)

    @mock.patch('waterdata.location.execute_get_request')
    def test_basic_metadata_request(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        m_resp.iter_lines.return_value = iter(self.test_rdb_text_lines)
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
        m_resp.iter_lines.return_value = iter(self.rdb_expanded_metadata_lines)  # don't care what the actual data is
        resp, metadata = ml.get_location_metadata(expanded=False)
        r_mock.assert_called_with('https://waterservices.usgs.gov',
                                  '/nwis/site/',
                                  {'format': 'rdb', 'site': '01630500', 'agencyCd': 'USGS'}
                                  )
        self.assertIsInstance(resp, r.Response)

    @mock.patch('waterdata.location.execute_get_request')
    def test_unsuccessful_metadata_request(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        m_resp.iter_lines.return_value = iter(self.test_rdb_text_lines)
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
        m_resp.status_code = 400
        m_resp.iter_lines.return_value = iter(self.rdb_expanded_metadata_lines)
        resp, metadata = ml.get_location_metadata()
        self.assertIsInstance(resp, r.Response)
        self.assertFalse(metadata)

    @mock.patch('waterdata.location.execute_get_request')
    def test_site_with_params(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        m_resp.iter_lines.return_value = iter(self.test_rdb_text_lines)
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
        site_capabilities = ml.get_capabilities()
        expected_capabilities = {'00060', '00010', '00095', '00065'}
        discharge_dates = ml.get_site_parameter('00060')
        expected_dates = Parameter(parameter_cd='00060',
                                   start_date=datetime.date(1972, 6, 9),
                                   end_date=datetime.date(2018, 1, 10),
                                   record_count='16651')
        no_param = ml.get_site_parameter('12345')
        # assertions against attributes
        self.assertEqual(ml.latitude, '38.94977778')
        self.assertEqual(ml.longitude, '-77.12763889')
        self.assertEqual(ml.location_name, 'POTOMAC RIVER NEAR WASH, DC LITTLE FALLS PUMP STA')
        # assertions against methods
        self.assertEqual(ml.location_number, self.test_record['site_no'])
        self.assertSetEqual(site_capabilities, expected_capabilities)
        self.assertEqual(discharge_dates, expected_dates)
        self.assertIsNone(no_param)

    @mock.patch('waterdata.location.execute_get_request')
    def test_no_site_matching_request(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 404
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
        site_capabilities = ml.get_capabilities()
        discharge_dates = ml.get_site_parameter('00060')
        self.assertFalse(site_capabilities)
        self.assertIsNone(discharge_dates)

    @mock.patch('waterdata.location.execute_get_request')
    def test_json_ld(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        m_resp.iter_lines.return_value = iter(self.test_rdb_text_lines)
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
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

    @mock.patch('waterdata.location.execute_get_request')
    def test_json_ld_no_discharge(self, r_mock):
        m_resp = mock.Mock(spec=r.Response)
        m_resp.status_code = 200
        m_resp.iter_lines.return_value = iter(self.rdb_no_discharge_lines)
        r_mock.return_value = m_resp

        ml = MonitoringLocation(self.test_record)
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

    def test_incorrect_instantiation(self):
        with self.assertRaises(AttributeError):
            MonitoringLocation({'blah': 'blah'})
