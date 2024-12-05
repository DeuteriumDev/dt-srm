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

seed: clean
	@$(DJANGO) makemigrations kits
	@$(DJANGO) migrate
	# see .env for admin pass
	@$(DJANGO) createsuperuser --no-input --username admin --email admin@admin.ca
	@$(DJANGO) createapplication --client-id $(CLIENT_ID) --client-secret $(CLIENT_SECRET) --algorithm HS256 --name remix_frontend confidential password
.PHONY: seed

dev:
	poetry run python manage.py runserver
.PHONY: dev

