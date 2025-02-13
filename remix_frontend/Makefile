#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)


dev:
	@yarn dev
.PHONY: dev

codegen:
	@npx @hey-api/openapi-ts
.PHONY: codegen

typecheck:
	@yarn run react-router typegen && yarn run tsc
.PHONY: typecheck

format:
	@yarn run eslint ./app --fix
	@yarn run prettier ./app --write
.PHONY: format
