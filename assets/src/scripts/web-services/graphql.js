const variables = {
  siteType: ['Well'],
  startDateLo: '07-23-2019',
  providers: ['NWIS']
};

export const mapQuery = `
query($bBox: String,
      $providers: [String] = ["NWIS"],
      $siteType: [String],
      $startDateLo: String,
      $startDateHi: String) {
  features(bBox: $bBox,
           siteType: $siteType,
           startDateLo: $startDateLo,
           startDateHi: $startDateHi,
           providers: $providers) {
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
}
`;

export const executeGraphQlQuery = (
    query,
    variables) => {
  console.log(query, variables);
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
