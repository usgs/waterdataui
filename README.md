# Water Data for the Nation UI

This repo contains a Flask web application that is used to create pages for USGS water data. The application
has been developed using Python 3.6. This is a work in progress.

The repo contains a bash shell script that can be used to install the dependencies, as well as build the application and
run the tests. Below are the installation instructions if not using the bash script.

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

## Python dependencies

1. Create a virtualenv and install the project Python requirements.
```bash
% virtualenv --python=python3 env
% env/bin/pip install -r requirements.txt
```
2. The python tests can be run as follows:
```bash
% env/bin/python -m unittest
```
3. To override any Flask configuration parameters, create instance/config.py and add variables. These will override
any values in the project's config.py.
4. To run the development server, execute the following:
```bash
% env/bin/python run.py
```

## Static assets development

Javascript and SASS assets are built against Node.js v8.9.3. Usage of
[nvm](https://github.com/creationix/nvm) is a convenient way to use a specific
version:

```bash
nvm use v8.9.3
```

Node.js dependencies are installed via:

```bash
npm install
```

And a development server hosting both the Python and static assets run with:

```bash
npm run watch
```

To build the complete distributable package, built to `./dist`:

```bash
npm run build
```
