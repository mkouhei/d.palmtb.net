#!/usr/bin/make -f
# -*- makefile -*-

SRCES := $(glob 20*/*/*/*.rst)
POST :=
PAGE :=

all: build  ## all

prebuild:  ## prebuild; prepare tinkerer environment on prebuild.
	virtualenv ../.venv
	../.venv/bin/pip install -r requirements.txt

build: prebuild $(SRCES)
build: $(SRCES) ## build; blog articles.
	. ../.venv/bin/activate; \
	tinker -b -q;\
	deactivate;

post: ## post POST='blog article subject'
	../.venv/bin/tinker -p "$(POST)"

page: ## page PAGE='page subject'
	../.venv/bin/tinker --page "$(PAGE)"

publish: ## publish; rsync to blog server.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ blogadm@proxy:/var/www/d.palmtb.net/

staging: ## staging; rsync to local http document root.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ /var/www/d.palmtb.net/

help:
	@grep -h -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS=":.*?## "};{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: help
#.DEFAULT_GOAL := help
