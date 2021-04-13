# Water Data For The Nation UI

[![Build Status](https://travis-ci.org/usgs/waterdataui.svg?branch=master)](https://travis-ci.org/usgs/waterdataui)
[![codecov](https://codecov.io/gh/usgs/waterdataui/branch/master/graph/badge.svg)](https://codecov.io/gh/usgs/waterdataui)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/05497ebda0d2450bb11eba0e436f4360)](https://www.codacy.com/manual/usgs_wma_dev/waterdataui/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=usgs/waterdataui&amp;utm_campaign=Badge_Grade)

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

###Special Note - 'lookup files'

The Waterdataui application uses what we call 'lookup files' to provide the application with information related to things like
state and county codes as well as information about agency names and hydrological units. The data for these files is gathered
from various web resources by an Amazon Web Services (AWS) Lambda function. You can find more details about this function in
its GitLab repository: https://code.chs.usgs.gov/wma/iidd/iow/waterdataui-lookup-generation .

The Lambda function runs nightly and creates a new set of three lookup files which are stored in an AWS Simple Storage Solution
(S3) bucket. Although the files are new each night, the contents of the files only change a few times each year. 
Updating the files each night takes less than 30 seconds of compute
time and allows us to retrieve changes within 24 hours of the time that changes were made to the web resources which contribute 
to the creation of the files. Once the files are in S3, they are then copied to each of our eight (dev, staging, and six production)
deployment servers. 

So that is the backstory, what is important here is that for your local development, the lookup files are stored in the 
repository in the folder wdfn-server/data and they are not automatically updated. Please note, that the files in the wdfn-server/data
directory are there for local development; they are not the files used in the deployed versions of the application.


There are not many use cases in which the above deployment detail would make a difference or would
require you to have the most up-to-date lookup files locally. However, if you find the need/desire to update the lookup files,
the most straight forward way is to manually download a copy of the new files from the S3 bucket (labs-test-website/test-lookups) and replace the 
files in your wdfn-server/data directory. These new files can be committed to Git and updated in the repository, so that
others can benefit from your diligence. 

## Run tests

To run all project tests:

```bash
make test
```
Optionally, you can run the Python and JavaScript tests separately.
```bash
# from the root directory
# To start the Python tests:
wdfn-server/env/bin/python -m pytest 

# from the assets directory
npm run test:watch # (runs the tests and stays active waiting for changes)
# or
npm run test # (runs the JavaScript tests once, produces a coverage report and shuts down)
```

If you want to run just a single test file, you can use  "--" to add to the npm script. For example:
```bash
npm run test:watch -- src/scripts/monitoring-location/selectors/daily-value-time_series-selector.test.js
```
### Debugging JavaScript tests

The line number that Jest produces is not correct but the error message is very descriptive and as well as the description of the test that failed and usually is enough to  isolate a failure. However, sometimes running a test in the browser with dev tools is needed to figure out what the error is. The Jest documentation (https://jestjs.io/docs/en/troubleshooting) describes how to do this. We have added an npm script to make this process a little simpler.
```bash
npm run test:debug
```
To debug a single test use '--' after the command to specify a single test file.

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
# From the project root directory run
docker build -t assets assets 
# (builds a Docker Image for the Static Assets server named 'assets' 
# using the Dockerfile in the 'assets' directory)

docker build -t waterdataui wdfn-server 
# (builds a Docker Image for the Flask server named 'waterdataui'
# using the Dockerfile in the 'wdfn-server' directory)
```

### Run the Flask Server as a Process in a Docker Container
```bash
docker run -p 5050:5050 waterdataui
# (starts the Flask server in Docker container on port 5050
# using the 'waterdataui' Docker image)
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
# When using LocalTunnel, run (from any directory)
lt --port 5050
# You will get back a URL looking something like -- https://bad-lionfish-7.loca.lt
```

Your local version of the application is now ported to the public URL provided by the tunnel. 
From here you can access the application on any internet connected device including your phone. 
If you see only a version of the application with no CSS or JavaScript, it means that the Flask 
server in the Docker container is not connecting with the Static Assets server. Sometimes it takes a minute
for all the pieces to connect. Sometimes, it helps to restart the container.

### Clean up
When testing is finished, you will want to turn off the Docker container
```bash
# run 
docker ps # (shows all Docker containers on your system)
then run
docker stop <the container id> 
# (the container ID will match up an image shown in the 'docker ps' command named 'waterdataui' 
# (which is what you named it earlier))

# If you don't want the images on your system, you can then remove them with 
docker rmi <image name>
``` 

### Limitations
For each change, you will need to rebuild the Docker image and restart the process -- which isn't optimal.

So this is best reserved for testing implementations that involve touching the screen of the device, 
especially with multiple touch points. Such implementations cannot be tested with normal emulations. 
