PYTHON := wdfn-server/env/bin/python
PIP := wdfn-server/env/bin/pip

.PHONY: env-wdfn test-wdfn clean-wdfn cleanenv-wdfn watch-wdfn

build-wdfn: build-assets
	@echo 'Building wdfn-server...'
	cd wdfn-server && ./env/bin/python setup.py bdist_wheel

clean-wdfn:
	@echo 'Cleaning wdfn-server...'
	rm -rf wdfn-server/dist
	rm -rf wdfn-server/build


#
# Development targets
#
test-wdfn:
	wdfn-server/env/bin/coverage run --omit=wdfn-server/waterdata/tests/*.py,wdfn-server/env/* -m pytest wdfn-server/waterdata
	wdfn-server/env/bin/coverage xml

watch-wdfn:
	$(PYTHON) wdfn-server/run.py


#
# Environment configuration targets
#
env-wdfn: wdfn-server/env wdfn-server/instance/config.py wdfn-env-requirements

wdfn-server/env:
	@echo 'Creating the virtualenv env'
	virtualenv --python=python3 --no-download wdfn-server/env

wdfn-env-requirements:
	@echo 'Installing requirements.txt'
	$(PIP) install -r wdfn-server/requirements.txt -r wdfn-server/requirements-dev.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org

wdfn-server/instance/config.py:
	@echo 'Creating wdfn-server/instance/config.py...'
	mkdir -p wdfn-server/instance
	cp wdfn-server/config.py.sample wdfn-server/instance/config.py

cleanenv-wdfn: clean-wdfn
	@echo 'Cleaning graph-server environment...'
	rm -rf wdfn-server/env
