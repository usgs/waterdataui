# Water Data For The Nation UI

[![Build Status](https://travis-ci.org/usgs/waterdataui.svg?branch=master)](https://travis-ci.org/usgs/waterdataui)
[![codecov](https://codecov.io/gh/usgs/waterdataui/branch/master/graph/badge.svg)](https://codecov.io/gh/usgs/waterdataui)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/05497ebda0d2450bb11eba0e436f4360)](https://www.codacy.com/app/ayan/waterdataui?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=usgs/waterdataui&amp;utm_campaign=Badge_Grade)
[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=bU1RYk13cEdnTUdmQkd0bzhyODFKNXVIbFdTa216WjdkYkM5UGVlaWNNYz0tLWtnR1ZwZC8rM0diajZXbXVTd1dlRmc9PQ==--0da980361af7531683a3e7245b74bd8bbb7875bc)](https://www.browserstack.com/automate/public-build/bU1RYk13cEdnTUdmQkd0bzhyODFKNXVIbFdTa216WjdkYkM5UGVlaWNNYz0tLWtnR1ZwZC8rM0diajZXbXVTd1dlRmc9PQ==--0da980361af7531683a3e7245b74bd8bbb7875bc)

This repo contains the components of Water Data For The Nation:

- [`wdfn-server`](wdfn-server): A Flask web application that is used to create server-rendered pages for USGS water data
- [`assets`](assets): Client-side Javascript, CSS, images, etc.

The application has been developed using Python 3.6 and Node.js 10.x This is a work in progress.

## Install dependencies

The repository contains a make target to configure a local development environment:

```bash
make env
```

To manually configure your environment, please see the READMEs of each separate project.

## Development server

To run all development servers in a watch mode at the same time, use the make target:

```bash
make watch
```

... and to run each dev server individually:

```bash
make watch-wdfn
make watch-assets
```

See the specific project READMEs for additional information.

## Run tests

To run all project tests:

```bash
make test
```
Optionally, you can run the Python and JavaScript tests separately.
```bash
from the root directory
To start the Python tests:
wdfn-server/env/bin/python -m pytest 

from the assets directory
npm run test:watch (runs the tests and stays active waiting for changes)
or
npm run test (runs the JavaScript tests once and shuts down)
```
Debugging JavaScript tests

Creating units for the JavaScript application is greatly enhanced by using the debugging capabilities built into 
the testing setup.

This works best for debugging single tests using the 'fit' option.

When running the JavaScript tests using 'npm run test:watch' you have the option of debugging using the browser.

When the tests start, a browser tab titled 'Karma' will open, and you will see a green bar at the top with a 'debug' button.

Press the 'debug' button, a new tab titled 'Karma DEBUG RUNNER' will open and show a blank page.

Right click the page and select 'inspect' to bring up the developer tools.

Click 'Console' and you will see a long list of tests that have run.

The long list of tests is awkward to use when working on a single test (or a few select tests),
so you can run only the tests you choose by adding the letter 'f' at the beginning of any test. Since
the tests all start with 'it  . . .', this will form the word 'fit'.

Hit the refresh button of the browser to run your 'fit' selected tests. You will find this a much faster
way to work with a small number of tests.

Note - when working with 'fit' tests in the browser debug window, the terminal that started the process will
continue cycle as you make changes. Depending on the speed of your system, it may show errors related to timeouts.
It is safe to ignore any messages in the host terminal until you finish the debugging session. Once the debugging tab is
closed and the 'Karma' tab of the browser refreshed, the tests in the terminal should run as expected.

Also note - if you don't see the debug button, try a right mouse click and select 'inspect'. This will usually bring the 
debug button back.

## Production build

```bash
make build
```

## Clean targets

```bash
make clean      ; clean build artifacts
make cleanenv   ; clean environment configuration and build artifacts
```

`make` supports chaining targets, so you could also `make clean watch`, etc.

## Run a Local Version on a Mobile Device Using Docker
### Preliminary Steps
- Make sure Docker is installed on your system (process varies with Operating System) 
- Install a 'tunneling' application (LocalTunnel is an example (this is not an endorsement))
- Disconnect from Virtual Private Network (VPN) or USGS network
- Stop any processes using port 5050 (or be prepared to use a different port)

### Build Docker Images from Context in DockerFiles
```bash
From the project root directory run
docker build -t assets assets 
(builds a Docker Image for the Static Assets server named 'assets' 
using the Dockerfile in the 'assets' directory)

docker build -t waterdataui wdfn-server 
(builds a Docker Image for the Flask server named 'waterdataui'
using the Dockerfile in the 'wdfn-server' directory)
```

### Run the Flask Server as a Process in a Docker Container
```bash
docker run -p 5050:5050 waterdataui
(starts the Flask server in Docker container on port 5050
using the 'waterdataui' Docker image)
```
### Is it working?
When the container is running, the terminal should look something like . . .
```bash
[2020-12-04 14:07:25 +0000] [1] [INFO] Starting gunicorn 20.0.4
[2020-12-04 14:07:25 +0000] [1] [INFO] Listening at: http://0.0.0.0:5050 (1)
[2020-12-04 14:07:25 +0000] [1] [INFO] Using worker: sync
[2020-12-04 14:07:25 +0000] [7] [INFO] Booting worker with pid: 7
[2020-12-04 14:07:25 +0000] [8] [INFO] Booting worker with pid: 8
[2020-12-04 14:07:25 +0000] [9] [INFO] Booting worker with pid: 9
[2020-12-04 14:07:25 +0000] [10] [INFO] Booting worker with pid: 10
```
### Access the Flask Server Running in the Container with a Tunnel
```bash
When using LocalTunnel, run (from any directory)
lt --port 5050
You will get back a URL looking something like -- https://bad-lionfish-7.loca.lt
```

Your local version of the application is now ported to the public URL provided by the tunnel. 
From here you can access the application on any internet connected device including your phone. 
If you see only a version of the application with no CSS or JavaScript, it means that the Flask 
server in the Docker container is not connecting with the Static Assets server. Sometimes it takes a minute
for all the pieces to connect. Sometimes, it helps to restart the container.

### Clean up
When testing is finished, you will want to turn off the Docker container
```bash
run 
docker ps (shows all Docker containers on your system)
then run
docker stop <the container id> 
(the container ID will match up an image shown in the 'docker ps' command named 'waterdataui' 
(which is what you named it earlier))

If you don't want the images on your system, you can then remove them with 
docker rmi <image name>
``` 

### Limitations
For each change, you will need to rebuild the Docker image and restart the process -- which isn't optimal.

So this is best reserved for testing implementations that involve touching the screen of the device, 
especially with multiple touch points. Such implementations cannot be tested with normal emulations. 
