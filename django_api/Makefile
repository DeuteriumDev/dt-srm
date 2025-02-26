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
	@$(DJANGO) makemigrations documents
	@$(DJANGO) migrate
	@$(DJANGO) createinitialrevisions
.PHONY: migrations

# - see [.env](./.env) for admin pass
seed: migrations
	@$(DJANGO) createsuperuser --no-input --email admin@admin.ca
	@$(DJANGO) createapplication --client-id $(CLIENT_ID) --client-secret $(CLIENT_SECRET) --algorithm HS256 --name remix_frontend confidential password
	@$(DJANGO) seed
.PHONY: seed

dev:
	@$(DJANGO) runserver
.PHONY: dev

schema:
	@$(DJANGO) spectacular --color --file schema.yml
	@node ../remix_frontend/node_modules/prettier/bin/prettier.cjs schema.yml --write
.PHONy: schema

shell:
	@$(DJANGO) shell
.PHONY: shell

services:
	@docker compose -f ./docker-compose.yml --env-file .env up
.PHONY: services


scheduler:
	@poetry run celery -A django_api beat -l INFO  --scheduler django_celery_beat.schedulers:DatabaseScheduler
.PHONY: scheduler


worker:
	@poetry run celery -A django_api worker -l INFO
.PHONY: worker
