"""
Service to return metadata about available camera images
"""

from .. import app
from ..utils import execute_get_request

ML_CAMERA_ENDPOINT = app.config['MONITORING_LOCATION_CAMERA_ENDPOINT']


def _get_camera_details(data):
    site_no = data['usgsSiteNumber']
    video_name_base = data['videoNameBase']
    url_prefix = f'{ML_CAMERA_ENDPOINT}media/cameras/{site_no}_{video_name_base}/'
    video_prefix = f'{url_prefix}/{video_name_base}'
    return {
        'name': data['cameraName'],
        'description': data['cameraDescription'],
        'med_video': f'{video_prefix}_med.webm',
        'small_video': f'{video_prefix}_small.webm',
        'most_recent_image': f'{url_prefix}{site_no}_{video_name_base}_most_recent_frame.jpg',
        'details': f'{ML_CAMERA_ENDPOINT}camera/{site_no}_{video_name_base}'
    }


def fetch_camera_metadata():
    """
    Fetch the camera meta and return the JSON response as a dictionary if successful
    otherwise return an empty dictionary
    :return dict
    """
    result = {}
    resp = execute_get_request(ML_CAMERA_ENDPOINT,
                               'php/getAllEnabledCameras.php')
    if resp.status_code == 200:
        try:
            result = resp.json()
        except ValueError:
            pass
    return result


def get_monitoring_location_camera_details(site_no):
    """
    Returns meta data for the camera images available for site_no
    :param site_no: USGS site number string
    :return list of dictionaries with keys for links to med_video, small_video, and details
    :rtype list
    """
    if 'MONITORING_LOCATION_CAMERA_METADATA' not in app.config:
        app.config['MONITORING_LOCATION_CAMERA_METADATA'] = fetch_camera_metadata().get('data', [])

    ml_camera_data = list(filter(lambda x: x['usgsSiteNumber'] == site_no,
                                 app.config['MONITORING_LOCATION_CAMERA_METADATA']))
    return list(map(_get_camera_details, ml_camera_data))
