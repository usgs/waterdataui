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

  return fetch('/graphql', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    }).then(resp => resp.json())
      .then(json => json);
};
