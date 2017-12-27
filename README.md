# Water Data for the Nation UI

[![Build Status](https://travis-ci.org/danielnaab/waterdataui.svg?branch=wdfn-9-travisci)](https://travis-ci.org/danielnaab/waterdataui)
[![Coverage Status](https://coveralls.io/repos/github/danielnaab/waterdataui/badge.svg?branch=wdfn-9-travisci)](https://coveralls.io/github/danielnaab/waterdataui?branch=wdfn-9-travisci)

This repo contains a Flask web application that is used to create pages for
USGS water data. The application has been developed using Python 3.6 and
Node.js 8.9.3. This is a work in progress.

## Local config module

You will need to create an `instance/config.py` file. For local development,
it should contain the following:

```python
DEBUG = True

# The root location of static assets (Javascript, CSS, Images)
STATIC_ROOT = 'http://localhost:9000'

# If this is not set, live reload will be disabled.
LIVE_RELOAD_PATH = 'ws://localhost:9000/ws'
```

## Install dependencies

The repo contains a bash shell script that can be used to install the dependencies, as well as build the application and run the tests.

```bash
./dev_install.sh
```

Below are the installation instructions if not using the bash script.

### Python dependencies

1. Create a virtualenv and install the project Python requirements.

```bash
virtualenv --python=python3.6 env
env/bin/pip install -r requirements.txt
```

2. To override any Flask configuration parameters, modify `instance/config.py`.
These will override any values in the project's `config.py`.

### Node.js dependencies

Javascript and SASS assets are built with Node.js v8.9.3. Usage of
[nvm](https://github.com/creationix/nvm) is a convenient way to use a specific
version of Node.js:

```bash
nvm use v8.9.3
```

Node.js dependencies are installed via:

```bash
npm install
```

## Development server

### One-step way

To run both the Python and Node.js servers in one step, you may use the `start`
script. This will run Flask on port 5050 and a node.js live-server on port
9000. Note: this step assumes you have a virtualenv installed in `./env`.

```bash
npm start
```

### Two-step way

Run the node.js development server at
[http://localhost:9000](http://localhost:9000):

```bash
npm run watch
```

Run the Flask development server at
[http://localhost:5050](http://localhost:5050):

```bash
env/bin/python run.py
```

### Test the production static assets build locally

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

### Python tests

The Python tests can be run as follows:

```bash
env/bin/python -m unittest
```

### Javascript tests

The Javascript tests may be run via node.js or in a browser.

To run tests in Chrome via Karma, these are all equivalent:

```bash
npm test
npm run test
npm run test:karma
```

To run tests in node.js via Jasmine:

```bash
npm run test:jasmine
```

To watch Javascript files for changes and re-run tests with Karma on change,
run:

```bash
npm run test:watch
```
