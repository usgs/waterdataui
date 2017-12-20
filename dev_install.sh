#!/bin/bash

ARG1=${1:-""};

echo "You must have python 3.x and virtualenv installed"
if [ ! -s instance/config.py ]; then
	echo "Please create an instance/config.py file before proceeding. See the README.md for what's required."
	exit 1
fi

# Read the required node version from package.json
NODE_VERSION=$(python -c "import json; print(json.loads(open('./package.json').read())['engines']['node'])")
echo "Node.js $NODE_VERSION required."
if [ $(node --version) != v$NODE_VERSION ]; then
	echo "Please use node.js version $NODE_VERSION."
	echo "Consider nvm to manage node versions: https://github.com/creationix/nvm"
	exit 1
fi

if [ "$ARG1" == '--clean' ]; then
	echo "Cleaning out current dependencies";
	rm -rf env;
	rm -rf node_modules;
fi

if [ ! -s env ]; then
	echo "Creating the virtualenv env";
	virtualenv --python=python3 --no-download env;
fi
echo "Installing python requirements";
env/bin/pip install -r requirements.txt;

echo "Running Python tests";
env/bin/python -m unittest

echo "Installing node.js dependencies"
npm install

echo "Building static assets"
npm run build

echo "Finished setting up waterdataui";
