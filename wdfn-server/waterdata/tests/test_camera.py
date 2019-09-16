"""
Tests for camera.py module
"""
from unittest import TestCase
import sys
from .. import camera

camera.JSON_CAMERA_FILE = "wdfn-server/data/monitoring_camera_data_test.json"


class TestCamera(TestCase):
    def test_loading_json_file(self):
        json_raw = camera.get_json_camera_data()
        # the test data file should not be and empty string
        self.assertTrue(len(json_raw) > 2000)
        self.assertTrue(len(json_raw) < 3000)
        self.assertTrue("11111" in json_raw)
        self.assertTrue("12345" in json_raw)
        self.assertTrue("22222" in json_raw)

    def test_all_camera_dictionary_list(self):
        json_raw = camera.get_json_camera_data()
        cameras = camera.json_raw_to_dictionary(json_raw)
        self.assertEqual(len(cameras), 3)
        self.assertEqual("12345", cameras[1]['SiteId'])

    def test_get_site_camera_from_list(self):
        json_raw = camera.get_json_camera_data()
        cameras = camera.json_raw_to_dictionary(json_raw)
        camera_data = camera.find_site_in_cameras('12345', cameras)
        self.assertEqual("12345", camera_data['SiteId'])

    def test_get_site_camera_dictionary_by_id(self):
        json_raw = camera.get_json_camera_data()
        cameras = camera.json_raw_to_dictionary(json_raw)
        camera_data1 = camera.find_site_in_cameras('12345', cameras)
        camera_data2 = camera.get_site_camera_data('12345')
        self.assertEqual("12345", camera_data1['SiteId'])
        self.assertEqual("12345", camera_data2['SiteId'])
        self.assertEqual(camera_data2, camera_data1)

    def test_get_site_monitoring_camera_data(self):
        monitoring_camera = camera.get_monitoring_camera_data('12345')
        self.assertTrue("exists" in monitoring_camera)
        self.assertEqual(monitoring_camera["exists"], True)
        self.assertTrue("thumb" in monitoring_camera)
        self.assertTrue("video" in monitoring_camera)
        self.assertTrue("video_index" in monitoring_camera)
        self.assertTrue("frame_gallery" in monitoring_camera)

    def test_get_site_monitoring_camera_data_for_missing(self):
        monitoring_camera = camera.get_monitoring_camera_data('54321')
        self.assertTrue("exists" in monitoring_camera)
        self.assertEqual(monitoring_camera["exists"], False)
        self.assertFalse("thumb" in monitoring_camera)
        self.assertFalse("video" in monitoring_camera)
        self.assertFalse("video_index" in monitoring_camera)
        self.assertFalse("frame_gallery" in monitoring_camera)

    def test_code_snipet_injecting_camera_data_into_context(self):
        context = {
            'status_code': 200,
        }
        monitoring_camera = camera.get_monitoring_camera_data('12345')
        if monitoring_camera:
            context['monitoring_camera'] = monitoring_camera
        self.assertTrue("exists" in context['monitoring_camera'])
        self.assertEqual(context['monitoring_camera']["exists"], True)
        self.assertTrue("thumb" in context['monitoring_camera'])
        self.assertTrue("video" in context['monitoring_camera'])
        self.assertTrue("video_index" in context['monitoring_camera'])
        self.assertTrue("frame_gallery" in context['monitoring_camera'])

    def test_code_snipet_injecting_missing_camera_into_context(self):
        context = {
            'status_code': 200,
        }
        missing_camera = camera.get_monitoring_camera_data('missing')
        if missing_camera:
            context['monitoring_camera'] = missing_camera
        self.assertTrue("exists" in context['monitoring_camera'])
        self.assertEqual(context['monitoring_camera']["exists"], False)
        self.assertFalse("thumb" in context['monitoring_camera'])
        self.assertFalse("video" in context['monitoring_camera'])
        self.assertFalse("video_index" in context['monitoring_camera'])
        self.assertFalse("frame_gallery" in context['monitoring_camera'])
