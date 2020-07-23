#!/usr/bin/make -f
# -*- makefile -*-

SRCES := $(glob 20*/*/*/*.rst)
POST :=
PAGE :=

all: build  ## all

prebuild:  ## prebuild; prepare tinkerer environment on prebuild.
	poetry install

#build: prebuild $(SRCES)
build: $(SRCES) ## build; blog articles.
	poetry run tinker -b -q

post: ## post POST='blog article subject'
	poetry run tinker -p \"$(POST)\"

page: ## page PAGE='page subject'
	poetry run tinker --page \"$(PAGE)\"

publish: ## publish; rsync to blog server.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ blogadm@proxy:/var/www/d.palmtb.net/

staging: ## staging; rsync to local http document root.
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ /var/www/html/

help:
	@grep -h -P '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS=":.*?## "};{printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: help
#.DEFAULT_GOAL := help
