# WDFN Server-side Graph Renderer

This project includes a node.js server-side rendering agent for Water Data For
The Nation graphs.

## Running the server

The entrypoint is `src/index.js`, which accepts the following environment
variables as arguments:

- NODE_PORT: Port to run http server on. Default 2929.
- SERVICE_ROOT: Default: https://waterservices.usgs.gov/nwis
- PAST_SERVICE_ROOT: Default: https://nwis.waterservices.usgs.gov/nwis
- STATIC_ROOT: Default: https://waterdata.usgs.gov/nwisweb/wsgi/static

For example:

```bash
NODE_PORT=80 node server.js
```

## Development server

There is a run task to start a server in watch mode:

```bash
npm run watch
```
