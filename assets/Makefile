NODE_VERSION=$(shell python3 -c "import json; print(json.loads(open('assets/package.json').read())['engines']['node'])")

.PHONY: env-assets test-assets clean-assets cleanenv-assets watch-assets

build-assets:
	@echo 'Building assets...'
	cd assets && npm run build

clean-assets:
	@echo 'Cleaning assets...'
	rm -rf assets/dist


#
# Development targets
#
test-assets:
	@echo 'Running assets tests...'
	cd assets && npm run test

watch-assets:
	cd assets && npm run watch

#
# Environment configuration targets
#
env-assets: assert-assets-node assets-node-modules

# Assert that we're using the proper node.js version
assert-assets-node:
ifeq ($(shell node --version), v$(NODE_VERSION))
	@echo 'Using node $(NODE_VERSION)'
else
	@echo 'Please use node.js version $(NODE_VERSION).'
	@echo 'Consider nvm to manage node versions: https://github.com/creationix/nvm'
	@exit 1
endif

assets-node-modules:
	@echo 'Installing assets dependencies...'
	cd assets && npm install

cleanenv-assets: clean-assets
	@echo 'Cleaning assets environment...'
	rm -rf assets/node_modules
