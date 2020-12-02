# WDFN Compiled Static Assets

This project includes compiled assets for Water Data For The Nation. The assets
produced by this project are dependencies of both [`wdfn-server`](../wdfn-server) (Flask) and
[`graph-server`](../graph-server) (node.js).

## Install dependencies

Javascript and SASS assets are built with Node.js v14.15.0. Usage of
[nvm](https://github.com/creationix/nvm) is a convenient way to use a specific
version of Node.js:

```bash
nvm use v14.15.0
```

Node.js dependencies are installed via:

```bash
npm install
```

## Run a development server

Run the node.js development server at
[http://localhost:9000](http://localhost:9000):

```bash
npm run watch
```

## Test the production static assets build locally

To build the complete production package, built to `./dist`:

```bash
npm run build
```

Rather than using the `watch` task, you can serve the manually built assets.
To locally serve the production build without recompiling on filesystem
changes:

```bash
npm run serve:static
```

## Running tests

To run tests in Chrome via Karma, these are equivalent:

```bash
npm test
npm run test
```

To watch Javascript files for changes and re-run tests with Karma on change,
run:

```bash
npm run test:watch
```

## Run a Local Version on a Mobile Device
Disconnect from Virtual Private Network (VPN) or USGS network.

Install a 'tunneling' application (LocalTunnel is an example (this is not an endorsement)).

Start your local Flask and Static Asset server.

Start the tunneling application; make a tunnel for each server

```bash 
An example using LocalTunnel 
(each command is in a seprate terminal, since each will be a running process)
lt --port 5050 (for the Flask server)
lt --port 9000 (for the Static Assets server)
You will get back two URLs looking something like -- https://bad-lionfish-7.loca.lt
```
Take the URL returned for the Static Assets server and go to the 'instance/config,py'.

You will only have an 'instance/config.py' if you created one using
```bash 
(as described in the WDFN-server setup)
mkdir -p instance
cp config.py.sample instance/config.py
```
If you don't have an 'instance/config' make one and then replace the value of 'STATIC_ROOT' with
the URL returned for the Static Assets server. 

Once you have changed the STATIC_ROOT, go to 'wdfn-server/config.py' and find the code
```bash
if os.getenv('CONTAINER_RUN', False):
```
Change 'False'  to 'True' (noting the capitalization).

Then you will need to build the application so that a manifest file is created with the correct hashed 
values for the tunnel URL to your Assets Server. 
```bash
In the project root directory run:
make build
```

Final step -- grab your phone and enter the URL returned for the Flask server. If the stars have aligned, you
will see your local version of the application running on your phone.

Clean up -- return the values for the STATIC_ROOT and CONTAINER_RUN to their default values.
