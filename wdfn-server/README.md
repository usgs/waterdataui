# WDFN Flask Server

This project produces server-rendered HTML pages for Water Data For The Nation.

## Install dependencies

1. Create a virtualenv and install the project's Python requirements.

```bash
virtualenv --python=python3.6 env
env/bin/pip install -r requirements.txt
```

2. To override any Flask configuration parameters, modify `instance/config.py`.
These will override any values in the project's `config.py`. There is a sample
available:

```bash
mkdir -p instance
cp config.py.sample instance/config.py
```

## Run a development server

To run the Flask development server at
[http://localhost:5050](http://localhost:5050):

```bash
env/bin/python run.py
```

## Running tests

The Python tests can be run as follows:

```bash
env/bin/python -m pytest waterdata
```
