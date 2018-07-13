#!/usr/bin/make -f
# -*- makefile -*-

SRCES := $(glob 20*/*/*/*.rst)
POST :=
PAGE :=

all: build  ## all

prebuild:  ## prebuild; prepare tinkerer environment on prebuild.
	pipenv shell; \
	pipenv install; \
	exit;

build: prebuild $(SRCES)
build: $(SRCES) ## build; blog articles.
	pipenv shell;\
	tinker -b -q;\
	exit;

post: ## post POST='blog article subject'
	pipenv shell; \
	tinker -p "$(POST)"; \
	exit;

page: ## page PAGE='page subject'
	pipenv shell; \
	tinker --page "$(PAGE)"; \
	exit;

publish: ## publish; rsync to blog server.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ blogadm@proxy:/var/www/d.palmtb.net/

staging: ## staging; rsync to local http document root.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ /var/www/d.palmtb.net/

help:
	@grep -h -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS=":.*?## "};{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: help
#.DEFAULT_GOAL := help
