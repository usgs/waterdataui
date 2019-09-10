import json
import os

# proof of concept. should call service to get

JSON_CAMERA_FILE = os.getcwd()+"/data/monitoring_camera_data.json"


def get_json_camera_data():
    with open(JSON_CAMERA_FILE, 'r') as json_file:
        json_raw = json_file.read() 
    return json_raw


def json_raw_to_dictionary(json_raw):
    return json.loads(json_raw)


def get_site_camera_data(site_no):
    json_raw = get_json_camera_data()
    camera = json_raw_to_dictionary(json_raw)
    return find_site_in_cameras(site_no, camera)


def find_site_in_cameras(site_no, cameras):
    for site_camera in cameras:
        if site_no in site_camera['SiteId']:
            return site_camera
    return {}


def get_monitoring_camera_data(site_no):
    camera_data = get_site_camera_data(site_no)
    if 'lastFrame' not in camera_data:
        return {'exists':False}
    monitoring_camera = {
        'exists':True,
        'thumb': camera_data['lastFrame'],
        'video': camera_data['timelapseRoot'] + camera_data['timelapseLarge'],
        'video_index'  : camera_data['timelapseFolder'],
        'frame_gallery': camera_data['timelapseFolder'] + "frame_gallery/"
    }
    return monitoring_camera
