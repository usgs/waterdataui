include assets/Makefile
include graph-server/Makefile
include wdfn-server/Makefile

.PHONY: help env test clean cleanenv

help:
	@echo  'Water Data For The Nation Makefile targets:'
	@echo  '  env - Create a local development environment'
	@echo  '  test - Run all project tests'
	@echo  '  clean - Remove all build artifacts'
	@echo  '  cleanenv - Remove all environment artifacts'

env: env-assets env-graph-server env-wdfn test
test: test-assets test-graph-server test-wdfn
clean: clean-assets clean-graph-server clean-wdfn
cleanenv: cleanenv-assets cleanenv-graph-server cleanenv-wdfn
