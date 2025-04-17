#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)


dev:
	@yarn run serve -p $(PORT) www
.PHONY: dev


build:
	@cd www && zip -r ../website.zip *
.PHONY: build