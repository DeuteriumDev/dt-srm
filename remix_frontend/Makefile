#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)


dev:
	yarn dev
.PHONY: dev

api-lib:
	npx @hey-api/openapi-ts
.PHONY: api-lib
