#
# Entrypoint Makefile for Water Data For The Nation
#

default: build

help:
	@echo  'Water Data For The Nation Makefile targets:'
	@echo  '  env - Create a local development environment'
	@echo  '  test - Run all project tests'
	@echo  '  clean - Remove all build artifacts'
	@echo  '  cleanenv - Remove all environment artifacts'

include assets/Makefile
include graph-server/Makefile
include wdfn-server/Makefile

.PHONY: help env test clean cleanenv

MAKEPID:= $(shell echo $$PPID)

env: env-assets env-graph-server env-wdfn
test: test-assets test-graph-server test-wdfn
clean: clean-assets clean-graph-server clean-wdfn
cleanenv: cleanenv-assets cleanenv-graph-server cleanenv-wdfn
build: env build-assets build-wdfn
watch:
	(make watch-wdfn & \
	 make watch-assets & \
	 make watch-graph-server & \
	 wait) || kill -TERM $(MAKEPID)
