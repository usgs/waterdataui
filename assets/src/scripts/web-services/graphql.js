const variables = {
  siteType: ['Well'],
  startDateLo: '07-23-2019',
  providers: ['NWIS']
};

export const mapQuery = `
query($bbox: String,
      $providers: [String] = ['NWIS'],
      $siteType: [String],
      $startDateLo: String,
      $startDateHi: String) {
  features(siteType: $siteType,
           startDateLo: $startDateLo,
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
      .then(json => console.log(JSON.stringify(json)));
};
