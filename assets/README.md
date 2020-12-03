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

Start your local Flask and Static Asset server.
```bash
Flask server on port 5050 - from the WDFN-server directory run
env/bin/python run.py

Static Assets on port 9000 - from the assets direcory run
npm run watch
```

Before you grab your phone, save some time and test that everything is working
as expected on your computer. 

Both, localhost:5050 (Flask server) and the tunnel URL for the Flask server should work, and the application should run as expected.

But, you may end up with a webpage with no CSS or Javascript. If you look in the console, there will 
be an error about CORS or an incorrect MIME type related to the tunnel URL for the Static Assets server.

The solution to this seems to be, oddly enough, using the tunnel URL for the Static Assets server in the browser.
If you take the tunnel URL for the Static Assets server and paste it into a browser and then go to the location, 
you will see a list of all the files on the Static Assets server (assuming all is working). Once, you have poked
around, you can leave. Upon returning to the tunnel URL for the Flask server, you should find that the CSS and JavaScript
are now functioning as expected.

Now, grab your phone and enter the URL returned for the Flask server. If the stars have aligned, you
will see your local version of the application running on your phone.

Clean up -- when testing is finished, return the values for the STATIC_ROOT and CONTAINER_RUN to their default values.
