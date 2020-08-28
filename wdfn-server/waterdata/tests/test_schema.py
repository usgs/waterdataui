from graphene import Schema
from graphene.test import Client
from  .. import schema

def test_monitoring_location_invalid_site_no():
    client = Client(Schema(query=schema.Query))
    executed = client.execute('''
    { 
        monitoringLocation(siteNo: "1") {
          feature {
            type
            geometry {
              type
              coordinates
            }
            properties {
              monitoringLocationName
              providerName
              organizationIdentifier
              organizationFormalName
              monitoringLocationIdentifier
              monitoringLocationTypeName
              resolvedMonitoringLocationTypeName
              HUCEightDigitCode
              siteUrl
              activityCount
              resultCount
              stateName
              agency
              siteNumber
              name
              siteType
              decimalLatitude
              decimalLongitude
              coordinatesAccuracy
              decimalCoordinatesDatum
              altitude
              altitudeAccuracy
              altitudeDatum
              HUCEightDigitCodeWs
              DMSLatitude
              DMSLongititude
              coordinatesMethod
              coordinatesDatum
              district
              state
              county
              country
              landNetLocationDesc
              mapName
              mapScale
              altitudeMethod
              basinCode
              topographicSetting
              instruments
              constructionDate
              inventoryDate
              drainArea
              contributingDrainArea
              timeZone
              honorDaylightSavings
              reliability
              GWFile
              nationalAquifer
              aquifer
              aquiferType
              wellDepth
              holeDepth
              depthSource
              projectNumber
              parameters {
                name
                group
                code
                dataTypes {
                  code
                  name
                  beginDate
                  endDate
                  count
                }
              }
            }
          }
        }
    }
    ''')
    # print(executed)
    assert executed == {
      "data": {
        "monitoringLocation": {
          "feature": {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [
                None,
                None
              ]
            },
            "properties": {
              "monitoringLocationName": None,
              "providerName": None,
              "organizationIdentifier": None,
              "organizationFormalName": None,
              "monitoringLocationIdentifier": None,
              "monitoringLocationTypeName": None,
              "resolvedMonitoringLocationTypeName": None,
              "HUCEightDigitCode": None,
              "siteUrl": None,
              "activityCount": None,
              "resultCount": None,
              "stateName": None,
              "agency": None,
              "siteNumber": None,
              "name": None,
              "siteType": None,
              "decimalLatitude": None,
              "decimalLongitude": None,
              "coordinatesAccuracy": None,
              "decimalCoordinatesDatum": None,
              "altitude": None,
              "altitudeAccuracy": None,
              "altitudeDatum": None,
              "HUCEightDigitCodeWs": None,
              "DMSLatitude": None,
              "DMSLongititude": None,
              "coordinatesMethod": None,
              "coordinatesDatum": None,
              "district": None,
              "state": None,
              "county": None,
              "country": None,
              "landNetLocationDesc": None,
              "mapName": None,
              "mapScale": None,
              "altitudeMethod": None,
              "basinCode": None,
              "topographicSetting": None,
              "instruments": None,
              "constructionDate": None,
              "inventoryDate": None,
              "drainArea": None,
              "contributingDrainArea": None,
              "timeZone": None,
              "honorDaylightSavings": None,
              "reliability": None,
              "GWFile": None,
              "nationalAquifer": None,
              "aquifer": None,
              "aquiferType": None,
              "wellDepth": None,
              "holeDepth": None,
              "depthSource": None,
              "projectNumber": None,
              "parameters": None
            }
          }
        }
      }
    }

def test_monitoring_location_valid():
    client = Client(Schema(query=schema.Query))
    executed = client.execute('''
    {
        monitoringLocation(siteNo: "03012550") {
            feature {
                type
                geometry {
                    type
                    coordinates
                }
            }
        }
    }
    ''')
    # print(executed)
    assert executed == {
    "data": {
        "monitoringLocation": {
            "feature": {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [
                        "-79.0119846",
                        "41.84144917"
                    ]
                }
            }
        }
    }
}
