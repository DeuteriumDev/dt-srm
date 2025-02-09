#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)


dev:
	@yarn dev
.PHONY: dev

api-lib:
	@npx @hey-api/openapi-ts
.PHONY: api-lib

typecheck:
	@yarn run react-router typegen && yarn run tsc
.PHONY: typecheck

format:
	@yarn run eslint ./app --fix
	@yarn run prettier ./app --write
.PHONY: format
