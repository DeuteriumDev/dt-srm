#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)


dev:
	@yarn run serve -p $(PORT) www
.PHONY: dev

format:
	@yarn run prettier ./www --write
.PHONY: format

deploy:
	@yarn wrangler pages deploy
.PHONY: deploy

