# Water Data for the Nation UI

This repo contains a Flask web application that is used to create pages for USGS water data. The application
has been developed using Python 3.6. This is a work in progress.

The repo contains a bash shell script that can be used to install the dependencies, as well as build the application and
run the tests. Below are the installation instructions if not using the bash script.

1. Create a virtualenv and install the project Python requirements.
```bash
% virtualenv --python=python3 env
% env/bin/pip install -r requirements.txt
```
2. The python tests can be run as follows:
```bash
% env/bin/python -m unittest
```
3. To override any Flask configuration parameters, create instance/config.py and add an variables. These will override
any values in the project's config.py.
4. To run the development server, execute the following:
```bash
% env/bin/python run.py
```