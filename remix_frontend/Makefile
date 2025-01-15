#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)


dev:
	yarn dev
.PHONY: dev

api-lib:
	npx @hey-api/openapi-ts -c @hey-api/client-fetch  -i ../django_api/schema.yml -o app/libs/django-rest
.PHONY: api-lib
