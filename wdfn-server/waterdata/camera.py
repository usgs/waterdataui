"""
Proof of concent to disaply site camera data on WDFN.
The JSON data file is currently included in the codebase and should
eventually be some sort of service or s3_bucket dir.
It should also be loaded into memory into a dictionary.
The current data file was fulled from the prior WIM proof of concept.

Usage:
get_monitoring_camera_data(site_id) should be called to fetch camera metadata.
{'exists': False} will be returned if there is no camera data for the given site.
"""
import json
import os

# proof of concept. should call service to get

JSON_CAMERA_FILE = os.getcwd()+"/data/monitoring_camera_data.json"


def get_json_camera_data():
    """Helper method to fetch the JSON data, later it might be a service"""
    with open(JSON_CAMERA_FILE, 'r') as json_file:
        json_raw = json_file.read()
    return json_raw


def json_raw_to_dictionary(json_raw):
    """Helper method to that converts JSON to a dictionary"""
    return json.loads(json_raw)


def find_site_in_cameras(site_no, cameras):
    """
    Helper method that scans a list of cameras for a site ID
    Returns the site dictionary or an empty dictionary if none is found.
    """
    for site_camera in cameras:
        if site_no in site_camera['SiteId']:
            return site_camera
    return {}


def get_site_camera_data(site_no):
    """An orchestration method that fetches camera data and returns the site dictionary"""
    json_raw = get_json_camera_data()
    camera = json_raw_to_dictionary(json_raw)
    return find_site_in_cameras(site_no, camera)


def get_monitoring_camera_data(site_no):
    """
    Returns a dictionary containing site camera metadata.
    The exists key will be false if there is no camera data found for the site.
    """
    camera_data = get_site_camera_data(site_no)
    if 'lastFrame' not in camera_data or not app.config['MONITORING_CAMERA_ENABLED']:
        return {'exists': False}
    monitoring_camera = {
        'exists': True,
        'thumb': camera_data['lastFrame'],
        'video': camera_data['timelapseRoot'] + camera_data['timelapseLarge'],
        'video_index'  : camera_data['timelapseFolder'],
        'frame_gallery': camera_data['timelapseFolder'] + "frame_gallery/"
    }
    return monitoring_camera
