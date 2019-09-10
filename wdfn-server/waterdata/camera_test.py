import camera

json_raw = camera.get_json_camera_data()
# print(json_raw)
cameras = camera.json_raw_to_dictionary(json_raw)
# print(len(cameras))
camera_data1 = camera.find_site_in_cameras('12345', cameras)
# print(camera_data1)
camera_data2 = camera.get_site_camera_data('12345')
# print(camera_data1['SiteId'])
# print(camera_data2['SiteId'])
# print(camera_data1['SiteId'] == camera_data2['SiteId'])
monitoring_camera = camera.get_monitoring_camera_data('12345')
# print(monitoring_camera)

context = {
    'status_code': 200,
}
if monitoring_camera:
    context['monitoring_camera'] = monitoring_camera
# print(context)

context_missing = {
    'status_code': 200,
}
missing_camera = camera.get_monitoring_camera_data('missing')
if missing_camera:
    context_missing['monitoring_camera'] = missing_camera
# print(context_missing)

