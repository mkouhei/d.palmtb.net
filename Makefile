#!/usr/bin/make -f
# -*- makefile -*-

RSYNC := rsync
SRCS := $(glob 20*/*/*/*.rst)

all: build

prebuild:
	virtualenv .venv
	.venv/bin/pip install -r requirements.txt

build: prebuild $(SRCES)
build: $(SRCES)
	. .venv/bin/activate; \
	tinker -b -q;\
	deactivate;

publish:
	$(RSYNC) -a --exclude 'glaneuses.json' --delete blog/html/ blogadm@proxy:/var/www/d.palmtb.net/

staging:
	$(RSYNC) -a --exclude 'glaneuses.json' --delete blog/html/ /var/www/d.palmtb.net/
