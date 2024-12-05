#!make
SHELL:=/bin/bash

include .env
export $(shell sed 's/=.*//' .env)

DJANGO=poetry run python manage.py

install:
	@poetry install
.PHONY: install


clean:
	@rm -f db.sqlite3
	@rm -rf ./**/migrations
.PHONY: clean

# - see [.env](./.env) for admin pass
seed: clean
	@$(DJANGO) makemigrations accounts
	@$(DJANGO) makemigrations kits
	@$(DJANGO) migrate
	@$(DJANGO) createsuperuser --no-input --email admin@admin.ca
	@$(DJANGO) createapplication --client-id $(CLIENT_ID) --client-secret $(CLIENT_SECRET) --algorithm HS256 --name remix_frontend confidential password
.PHONY: seed

dev:
	poetry run python manage.py runserver
.PHONY: dev

