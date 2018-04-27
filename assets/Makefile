NODE_VERSION=$(shell python3 -c "import json; print(json.loads(open('assets/package.json').read())['engines']['node'])")

.PHONY: env-assets test-assets clean-assets cleanenv-assets

# Assert that we're using the proper node.js version
assert-assets-node:
ifeq ($(shell node --version), v$(NODE_VERSION))
	@echo 'Using node $(NODE_VERSION)'
else
	@echo 'Please use node.js version $(NODE_VERSION).'
	@echo 'Consider nvm to manage node versions: https://github.com/creationix/nvm'
	@exit 1
endif

env-assets: assert-assets-node assets/node_modules
	@echo 'Created assets environment!'

assets/node_modules:
	@echo 'Installing assets dependencies...'
	cd assets && npm install

test-assets:
	@echo 'Running assets tests...'
	cd assets && npm run test

clean-assets:
	@echo 'Cleaning assets...'
	rm -rf assets/dist

cleanenv-assets: clean-assets
	@echo 'Cleaning assets environment...'
	rm -rf assets/node_modules

build-assets:
	@echo 'Building assets...'
	cd assets && npm run build
