#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)

DJANGO=poetry run python manage.py

install:
	@poetry install
.PHONY: install


migrations:
	@$(DJANGO) makemigrations accounts
	@$(DJANGO) makemigrations kits
	@$(DJANGO) migrate
.PHONY: migrations

# - see [.env](./.env) for admin pass
seed: migrations
	@$(DJANGO) seed
.PHONY: seed

dev:
	@$(DJANGO) runserver
.PHONY: dev

api-schema:
	@$(DJANGO) spectacular --color --file schema.yml
.PHONy: api-schema

shell:
	@$(DJANGO) shell
.PHONY: shell

db:
	@docker compose -f ./docker-compose.yml --env-file .env up
.PHONY: db