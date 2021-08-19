#!/usr/bin/make -f
# -*- makefile -*-

SRCES := $(glob 20*/*/*/*.rst)
POST :=
PAGE :=
VENV_DIR := .venv

all: build  ## execute all build tasks.

prebuild:  ## prepare tinkerer venv.
	test -d .venv || python -m venv $(VENV_DIR)
	$(VENV_DIR)/bin/python -m pip install -r requirements.txt

build: prebuild $(SRCES)  ## build blog articles.
	. $(VENV_DIR)/bin/activate; \
	tinker -b -q; \
	deactivate

post: ## create a new post with the title `POST`.
	. $(VENV_DIR)/bin/activate; \
	tinker -p \"$(POST)\"; \
	deactivate

page: ## create a new page with the title `PAGE`.
	. $(VENV_DIR)/bin/activate; \
	tinker --page \"$(PAGE)\"; \
	deactivate

publish: ## publish to blog server with rsync.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ blogadm@web:/var/www/d.palmtb.net/

staging: ## copy to local http document root with rsync.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ /var/www/html/

help:
	@grep -h -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS=":.*?## "};{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: help
#.DEFAULT_GOAL := help
