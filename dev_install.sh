#!/bin/bash

ARG1=${1:-""};

echo "You must have python 3.x and virtualenv installed"
if [ ! -s instance/config.py ]; then
	echo "Please create an instance/config.py file before proceeding. See the README.md for what's required."
	return
fi

if [ "$ARG1" == '--clean' ]; then
	echo "Cleaning out current dependencies";

    rm -rf node_modules;
	rm -rf wqp/static;
	rm -rf env;
fi

if [ ! -s env ]; then
    echo "Creating the virtualenv env";
	virtualenv --python=python3 --no-download env;
fi
echo "Installing python requirements";
env/bin/pip install -r requirements.txt;

echo "Running Python tests";
env/bin/python -m unittest

echo "Finished setting up waterdataui";
