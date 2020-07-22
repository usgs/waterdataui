#
# Entrypoint Makefile for Water Data For The Nation
#

default: build

help:
	@echo  'Water Data For The Nation Makefile targets:'
	@echo  '  build (default) - Produce the build artifact for each project'
	@echo  '  env - Create a local development environment'
	@echo  '  watch - Run local development servers'
	@echo  '  test - Run all project tests'
	@echo  '  clean - Remove all build artifacts'
	@echo  '  cleanenv - Remove all environment artifacts'

include assets/Makefile
include wdfn-server/Makefile

.PHONY: help env test clean cleanenv coverage

MAKEPID:= $(shell echo $$PPID)

env: env-assets env-wdfn
test: test-assets test-wdfn
clean: clean-assets clean-wdfn
cleanenv: cleanenv-assets cleanenv-wdfn
build: env build-assets build-wdfn
watch:
	(make watch-wdfn & \
	 make watch-assets & \
	 wait) || kill -TERM $(MAKEPID)
