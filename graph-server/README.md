# WDFN Server-side Graph Renderer

This project includes a node.js server-side rendering agent for Water Data For
The Nation graphs.

## API
### Status service - /api/graph-images/status
Returns json object containing the  version of the running service

### Monitoring Location service - /api/graph-images/monitoring-location/\<siteid\>/?parameterCode=xxxxx
Returns a png containing a hydrograph for parameterCode(xxxxxx) for the site(siteid) for the
last seven days. The query parameter parameterCode is required and should be a valid NWIS parameter code (see 
https://help.waterdata.usgs.gov/parameter_cd?group_cd=% )
#### Optional query parameters
- compare - Boolean. By default this is false if not specified. If true, the graph will render two lines,
one representing the time period specified and the second representing the same time period one year ago.

## Running the server

The entrypoint is `src/index.js`, which accepts the following environment
variables as arguments:

- NODE_PORT: Port to run http server on. Default 2929.
- SERVICE_ROOT: Default: https://waterservices.usgs.gov/nwis
- PAST_SERVICE_ROOT: Default: https://nwis.waterservices.usgs.gov/nwis
- STATIC_ROOT: Default: https://waterdata.usgs.gov/nwisweb/wsgi/static

For example:

```bash
% NODE_PORT=80 node src/index.js
```

Alternatively, if you want to use defaults as well as add DEBUG just use
```bash
% npm run start
```

## Development server

There is a run task to start a server in watch mode:

```bash
% npm run watch
```

## Docker

For deployment, a docker image is built and then deployed. To mimic the same thing locally execute the following
from the root level of this repo:
```bash
% docker build -t wdfn_graph_server graph-server/
% docker run -p 2929:2929 --privileged wdfn_graph_server
```
