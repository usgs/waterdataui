"""
GraphQL API Schema for WDFN and its related functions
"""
from collections import defaultdict
from datetime import datetime

from graphene import ObjectType, String, ID, List, Field, Int
import requests

from . import app
from .services.nwis import NwisWebServices
from .utils import parse_rdb


SERVICE_ROOT = app.config['SERVER_SERVICE_ROOT']
NWIS = NwisWebServices(SERVICE_ROOT)


def get_period_of_record_by_parm_cd_datatype(site_records):
    """
    Input: site_records: results from get_site_properties_from_get_site_parameters
    Returns a dictionary of period of record for each parameter and its datatype

    """
    records_by_parm_cd = {}
    for record in site_records:
        this_parm_cd = record['parm_cd']
        if this_parm_cd not in records_by_parm_cd:
            records_by_parm_cd[this_parm_cd] = defaultdict(dict)
        if not records_by_parm_cd[this_parm_cd][record['data_type_cd']]:
            records_by_parm_cd[this_parm_cd][record['data_type_cd']] = {
                'begin_date': record['begin_date'],
                'end_date': record['end_date'],
                'count': int(record['count_nu'])
            }
        else:
            date_format = '%Y-%m-%d'
            if (datetime.strptime(record['begin_date'], date_format)
                    < datetime.strptime(records_by_parm_cd[this_parm_cd][record['data_type_cd']]['begin_date'],
                                        date_format)):
                records_by_parm_cd[this_parm_cd][record['data_type_cd']]['begin_date'] = record['begin_date']
            if (datetime.strptime(record['end_date'], date_format)
                    > datetime.strptime(records_by_parm_cd[this_parm_cd][record['data_type_cd']]['end_date'],
                                        date_format)):
                records_by_parm_cd[this_parm_cd][record['data_type_cd']]['end_date'] = record['end_date']

            records_by_parm_cd[this_parm_cd][record['data_type_cd']]['count'] += int(record['count_nu'])

    return records_by_parm_cd


class DataType(ObjectType):
    # pylint: disable=R0903
    """
    DataType field
    """
    code = String()
    name = String()
    begin_date = String()
    end_date = String()
    count = Int()


class Parameter(ObjectType):
    # pylint: disable=R0903
    """
    Parameter field
    """
    name = String()
    group = String()  # parm_grp_cd
    code = String()  # parm_cd
    data_types = List(DataType)


class Properties(ObjectType):
    # pylint: disable=R0903
    """
    Properties field for Feature
    """
    # These fields may need to be consolidated and re-evaluated to see if they are needed

    # Fields from Water Quality Portal API
    monitoring_location_name = String()
    provider_name = String()
    organization_identifier = String()
    organization_formal_name = String()
    monitoring_location_identifier = ID()
    monitoring_location_type_name = String()
    resolved_monitoring_location_type_name = String()
    HUC_eight_digit_code = String()
    site_url = String()
    activity_count = String()
    result_count = String()
    state_name = String()

    # Fields from get_site_parameters
    agency = String()  # agency_cd
    site_number = String()  # site_no
    name = String()  # station_nm
    site_type = String()  # site_tp_cd
    decimal_latitude = String()  # dec_lat_va
    decimal_longitude = String()  # dec_long_va
    coordinates_accuracy = String()  # coord_acy_cd
    decimal_coordinates_datum = String()  # dec_coord_datum_cd
    altitude = String()  # alt_va
    altitude_accuracy = String()  # alt_acy_va
    altitude_datum = String()  # alt_datum_cd
    HUC_eight_digit_code_ws = String()  # huc_cd
    parameters = List(Parameter)

    # Fields from get_site
    DMS_latitude = String()  # lat_va
    DMS_longititude = String()  # long_va
    coordinates_method = String()  # coord_meth_cd
    coordinates_datum = String()  # coord_datum_cd
    district = String()  # district_cd
    state = String()  # state_cd
    county = String()  # county_cd
    country = String()  # country_cd
    land_net_location_desc = String()  # lang_net_ds
    map_name = String()  # map_nm
    map_scale = String()  # map_scale_fc
    altitude_method = String()  # alt_meth_cd
    basin_code = String()  # basin_cd
    topographic_setting = String()  # topo_cd
    instruments = String()  # instruments_cd
    construction_date = String()  # construction_dt
    inventory_date = String()  # inventory_dt
    drain_area = String()  # drain_area_va
    contributing_drain_area = String()  # contrib_drain_area_va
    time_zone = String()  # tz_cd
    honor_daylight_savings = String()  # local_time_fg
    reliability = String()  # reliability_cd
    GW_file = String()  # gw_file_cd
    national_aquifer = String()  # nat_aqfr_cd
    aquifer = String()  # aqfr_cd
    aquifer_type = String()  # aqfr_type_cd
    well_depth = String()  # well_depth_va
    hole_depth = String()  # hole_depth_va
    depth_source = String()  # depth_src_cd
    project_number = String()  # project_no


class Geometry(ObjectType):
    # pylint: disable=R0903
    """
    Geometry field for Feature
    """
    type = String(default_value='Point')
    coordinates = List(String)


class Feature(ObjectType):
    # pylint: disable=R0903
    """
    Feature field for Monitoring Location
    """
    type = String(default_value='Feature')
    geometry = Field(Geometry)
    properties = Field(Properties)


class MonitoringLocation(ObjectType):
    # pylint: disable=R0903
    """
    Monitoring location field
    """
    feature = Field(Feature)


class MonitoringLocations(ObjectType):
    # pylint: disable=R0903
    """
    A list of features with count
    """
    count = Int()
    type = String(default_value='FeatureCollection')
    features = List(Feature)


class Query(ObjectType):
    """
    Queries
    """
    monitoring_locations = Field(MonitoringLocations,
                                 siteType=List(String),
                                 providers=List(String),
                                 bBox=String(),
                                 startDateLo=String(),
                                 startDateHi=String(),
                                 pCode=List(String))

    def resolve_monitoring_locations(parent,
                                     info,
                                     **kwargs):
        # pylint: disable=E0213,W0613,R0201
        """
        Resolver for All Features
        """
        url = 'https://www.waterqualitydata.us/data/Station/search?mimeType=geojson'
        data = kwargs
        resp = requests.post(url=url, data=data)
        features_obj = resp.json().get('features', [])
        for feature in features_obj:
            properties = feature['properties']
            properties['monitoring_location_name'] = properties.pop('MonitoringLocationName', None)
            properties['provider_name'] = properties.pop('ProviderName', None)
            properties['organization_identifier'] = properties.pop('OrganizationIdentifier', None)
            properties['organization_formal_name'] = properties.pop('OrganizationFormalName', None)
            properties['monitoring_location_identifier'] = properties.pop('MonitoringLocationIdentifier', None)
            properties['monitoring_location_type_name'] = properties.pop('MonitoringLocationTypeName', None)
            properties['resolved_monitoring_location_type_name'] = properties.pop('ResolvedMonitoringLocationTypeName',
                                                                                  None)
            properties['HUC_eight_digit_code'] = properties.pop('HUCEightDigitCode', None)
            properties['site_url'] = properties.pop('siteUrl', None)
            properties['activity_count'] = properties.pop('activityCount', None)
            properties['result_count'] = properties.pop('resultCount', None)
            properties['state_name'] = properties.pop('StateName', None)

            # This piece below is supposed to fill out all the details for each monitoring location
            # but due to the fact that it is calling the water services and process the data, it will
            # take too long.  So commenting out for now
            # if properties['monitoring_location_identifier'].startswith('USGS-'):
            #     site_no = properties['monitoring_location_identifier'].replace('USGS-', '')
            #     properties.update(Query.get_site_properties_from_get_site_parameters(site_no))
            #     properties.update(Query.get_site_properties_from_get_site(site_no))

        return {'count': len(features_obj), 'features': features_obj}

    monitoring_location = Field(MonitoringLocation, site_no=String())

    @staticmethod
    def get_site_properties_from_get_site_parameters(site_no, agency='USGS'):
        """
        Get site properties from the NWIS.get_site_parameters function and return a dictionary
        """
        data = NWIS.get_site_parameters(site_no, agency)
        period_of_record = get_period_of_record_by_parm_cd_datatype(data)

        parameters = []
        for pcode in period_of_record:
            pcode_properties = app.config['NWIS_CODE_LOOKUP']['parm_cd'].get(pcode, {}).copy()
            pcode_properties['data_types'] = []
            pcode_properties.update({'code': pcode})
            for data_type in period_of_record[pcode]:
                d_t_properties = app.config['NWIS_CODE_LOOKUP']['data_type_cd'].get(data_type, {}).copy()
                d_t_properties.update({'code': data_type})
                d_t_properties.update(period_of_record[pcode][data_type])
                pcode_properties['data_types'].append(d_t_properties)

            parameters.append(pcode_properties)

        result = {}
        # Just use one entry because the monitoring location properties are the same
        if not data:
            return {}

        prop = data[0]
        result['agency'] = (app.config['NWIS_CODE_LOOKUP']['agency_cd'][prop['agency_cd']]['name']
                            if prop.get('agency_cd')
                            and app.config['NWIS_CODE_LOOKUP']['agency_cd'].get(prop['agency_cd'])
                            else prop.get('agency_cd'))
        result['site_number'] = prop.get('site_no')
        result['name'] = prop.get('station_nm')
        result['site_type'] = (app.config['NWIS_CODE_LOOKUP']['site_tp_cd'][prop['site_tp_cd']]['name']
                               if prop.get('site_tp_cd')
                               and app.config['NWIS_CODE_LOOKUP']['site_tp_cd'].get(prop['site_tp_cd'])
                               else prop.get('site_tp_cd'))
        result['decimal_latitude'] = prop.get('dec_lat_va')
        result['decimal_longitude'] = prop.get('dec_long_va')
        result['coordinates_accuracy'] = (app.config['NWIS_CODE_LOOKUP']['coord_acy_cd'][prop['coord_acy_cd']]['name']
                                          if prop.get('coord_acy_cd')
                                          and app.config['NWIS_CODE_LOOKUP']['coord_acy_cd'].get(prop['coord_acy_cd'])
                                          else prop.get('coord_acy_cd'))
        result['decimal_coordinates_datum'] = (app.config['NWIS_CODE_LOOKUP']
                                               ['dec_coord_datum_cd'][prop['dec_coord_datum_cd']]['name']
                                               if prop.get('dec_coord_datum_cd')
                                               and app.config['NWIS_CODE_LOOKUP']
                                               ['dec_coord_datum_cd'].get(prop['dec_coord_datum_cd'])
                                               else prop.get('dec_coord_datum_cd'))
        result['altitude'] = prop.get('alt_va')
        result['altitude_accuracy'] = prop.get('alt_acy_va')
        result['altitude_datum'] = (app.config['NWIS_CODE_LOOKUP']['alt_datum_cd'][prop['alt_datum_cd']]['name']
                                    if prop.get('alt_datum_cd')
                                    and app.config['NWIS_CODE_LOOKUP']['alt_datum_cd'].get(prop['alt_datum_cd'])
                                    else prop.get('alt_datum_cd'))
        result['HUC_eight_digit_code_ws'] = prop.get('huc_cd')
        result['parameters'] = parameters

        return result

    @staticmethod
    def get_site_properties_from_get_site(site_no, agency='USGS'):
        """
        Get site properties from the NWIS.get_site function and return a dictionary
        """
        result = {}
        resp = NWIS.get_site(site_no, agency)
        if resp.status_code != 200:
            return {}

        iter_data = parse_rdb(resp.iter_lines(decode_unicode=True))
        data_list = list(iter_data)

        if not data_list:
            return {}

        # expecting one item here
        site_info = data_list[0]

        result['DMS_latitude'] = site_info.get('lat_va')
        result['DMS_longititude'] = site_info.get('long_va')
        result['coordinates_method'] = (app.config['NWIS_CODE_LOOKUP']['coord_meth_cd']
                                        [site_info['coord_meth_cd']]['name']
                                        if site_info.get('coord_meth_cd')
                                        and app.config['NWIS_CODE_LOOKUP']['coord_meth_cd']
                                        .get(site_info['coord_meth_cd'])
                                        else site_info.get('coord_meth_cd'))
        result['coordinates_datum'] = (app.config['NWIS_CODE_LOOKUP']['coord_datum_cd']
                                       [site_info['coord_datum_cd']]['name']
                                       if site_info.get('coord_datum_cd')
                                       and app.config['NWIS_CODE_LOOKUP']['coord_datum_cd']
                                       .get(site_info['coord_datum_cd'])
                                       else site_info.get('coord_datum_cd'))
        result['district'] = site_info.get('district_cd')
        result['state'] = (app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                           [site_info['country_cd']]['state_cd'][site_info['state_cd']]['name']
                           if site_info.get('state_cd')
                           and site_info.get('country_cd')
                           and app.config['COUNTRY_STATE_COUNTY_LOOKUP'].get(site_info['country_cd'])
                           and app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                           [site_info['country_cd']]['state_cd'].get(site_info['state_cd'])
                           else site_info.get('state_cd'))
        result['county'] = (app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                            [site_info['country_cd']]['state_cd'][site_info['state_cd']]
                            ['county_cd'][site_info['county_cd']]['name']
                            if site_info.get('county_cd')
                            and site_info.get('state_cd')
                            and site_info.get('country_cd')
                            and app.config['COUNTRY_STATE_COUNTY_LOOKUP'].get(site_info['country_cd'])
                            and app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                            [site_info['country_cd']]['state_cd'].get(site_info['state_cd'])
                            and app.config['COUNTRY_STATE_COUNTY_LOOKUP']
                            [site_info['country_cd']]['state_cd'][site_info['state_cd']]
                            ['county_cd'].get(site_info['county_cd'])
                            else site_info.get('county_cd'))
        result['country'] = site_info.get('country_cd')
        result['land_net_location_desc'] = site_info.get('land_net_ds')
        result['map_name'] = site_info.get('map_nm')
        result['map_scale'] = site_info.get('map_scale_fc')
        result['altitude_method'] = (app.config['NWIS_CODE_LOOKUP']['alt_meth_cd'][site_info['alt_meth_cd']]['name']
                                     if site_info.get('alt_meth_cd')
                                     and app.config['NWIS_CODE_LOOKUP']['alt_meth_cd'].get(site_info['alt_meth_cd'])
                                     else site_info.get('alt_meth_cd'))
        result['basin_code'] = site_info.get('basin_cd')
        result['topographic_setting'] = (app.config['NWIS_CODE_LOOKUP']['topo_cd'][site_info['topo_cd']]['name']
                                         if site_info.get('topo_cd')
                                         and app.config['NWIS_CODE_LOOKUP']['topo_cd'].get(site_info['topo_cd'])
                                         else site_info.get('topo_cd'))
        result['instruments'] = site_info.get('instruments_cd')
        result['construction_date'] = site_info.get('construction_dt')
        result['inventory_date'] = site_info.get('inventory_dt')
        result['drain_area'] = site_info.get('drain_area_va')
        result['contributing_drain_area'] = site_info.get('contrib_drain_area_va')
        result['time_zone'] = site_info.get('tz_cd')
        result['honor_daylight_savings'] = site_info.get('local_time_fg')
        result['reliability'] = (app.config['NWIS_CODE_LOOKUP']['reliability_cd'][site_info['reliability_cd']]['name']
                                 if site_info.get('reliability_cd')
                                 and app.config['NWIS_CODE_LOOKUP']['reliability_cd'].get(site_info['reliability_cd'])
                                 else site_info.get('reliability_cd'))
        result['GW_file'] = site_info.get('gw_file_cd')
        result['national_aquifer'] = (app.config['NWIS_CODE_LOOKUP']['nat_aqfr_cd'][site_info['nat_aqfr_cd']]['name']
                                      if site_info.get('nat_aqfr_cd')
                                      and app.config['NWIS_CODE_LOOKUP']['nat_aqfr_cd'].get(site_info['nat_aqfr_cd'])
                                      else site_info.get('nat_aqfr_cd'))
        result['aquifer'] = (app.config['NWIS_CODE_LOOKUP']['aqfr_cd'][site_info['aqfr_cd']]['name']
                             if site_info.get('aqfr_cd')
                             and app.config['NWIS_CODE_LOOKUP']['aqfr_cd'].get(site_info['aqfr_cd'])
                             else site_info.get('aqfr_cd'))
        result['aquifer_type'] = (app.config['NWIS_CODE_LOOKUP']['aqfr_type_cd'][site_info['aqfr_type_cd']]['name']
                                  if site_info.get('aqfr_type_cd')
                                  and app.config['NWIS_CODE_LOOKUP']['aqfr_type_cd'].get(site_info['aqfr_type_cd'])
                                  else site_info.get('aqfr_type_cd'))
        result['well_depth'] = site_info.get('well_depth_va')
        result['hole_depth'] = site_info.get('hole_depth_va')
        result['depth_source'] = site_info.get('depth_src_cd')
        result['project_number'] = site_info.get('project_no')

        return result

    def resolve_monitoring_location(parent, info, site_no):
        # pylint: disable=E0213,W0613,R0201
        """
        Resolver for monitoring location
        """
        result = {'feature': {'geometry': {}, 'properties': {}}}
        result['feature']['properties'] = Query.get_site_properties_from_get_site_parameters(site_no)
        result['feature']['properties'].update(Query.get_site_properties_from_get_site(site_no))
        result['feature']['geometry']['coordinates'] = [
            result['feature']['properties'].get('decimal_longitude'),
            result['feature']['properties'].get('decimal_latitude')
        ]

        return result


# siteTypes:
# Aggregate groundwater use; Aggregate surface-water-use; Atmosphere;
# Estuary; Facility; Glacier; Lake, Reservoir, Impoundment; Land; Ocean;
# Spring; Stream; Subsurface; Well; Wetland

# startDateLo; startDateHi:
# mm-dd-yyyy
