import {post} from '../ajax';

export const mapQuery = `
query($bBox: String,
      $providers: [String] = ["NWIS"],
      $siteType: [String],
      $startDateLo: String,
      $startDateHi: String) {
  allFeatures(bBox: $bBox,
           siteType: $siteType,
           startDateLo: $startDateLo,
           startDateHi: $startDateHi,
           providers: $providers) {
    features {
      geometry {
        coordinates
      }
      properties {
        OrganizationIdentifier
        MonitoringLocationName
        siteUrl
        MonitoringLocationIdentifier
      }
    }
    count
  }
}
`;

export const executeGraphQlQuery = (
    query,
    variables) => {

      const payload = JSON.stringify({
        query,
        variables
      });

      const headers = {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      };

      return post('/graphql', payload, headers);
};
