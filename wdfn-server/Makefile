PYTHON := wdfn-server/env/bin/python
PIP := wdfn-server/env/bin/pip

.PHONY: env-wdfn test-wdfn clean-wdfn cleanenv-wdfn

test-wdfn:
	$(PYTHON) -m pytest wdfn-server/waterdata

env-wdfn: wdfn-server/env wdfn-server/instance/config.py wdfn-env-requirements
	@echo 'Creating wdfn-server environment...'

wdfn-server/env:
	@echo "Creating the virtualenv env"
	virtualenv --python=python3.6 --no-download wdfn-server/env

wdfn-env-requirements:
	@echo "Installing requirements.txt"
	$(PIP) install -r wdfn-server/requirements.txt

wdfn-server/instance/config.py:
	@echo "Creating wdfn-server/instance/config.py..."
	cp wdfn-server/instance/config.py.sample wdfn-server/instance/config.py

clean-wdfn:
	@echo "Cleaning wdfn-server..."
	rm -rf wdfn-server/dist
	rm -rf wdfn-server/build

cleanenv-wdfn: clean-wdfn
	@echo "Cleaning graph-server environment..."
	rm -rf wdfn-server/env
