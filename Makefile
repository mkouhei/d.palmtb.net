#!/usr/bin/make -f
# -*- makefile -*-

SRCES := $(glob 20*/*/*/*.rst)
POST :=
PAGE :=

all: build

prebuild:
	virtualenv ../.venv
	../.venv/bin/pip install -r requirements.txt

build: prebuild $(SRCES)
build: $(SRCES)
	. ../.venv/bin/activate; \
	tinker -b -q;\
	deactivate;

post:
	../.venv/bin/tinker -p "$(POST)"

page:
	../.venv/bin/tinker --page "$(PAGE)"

publish:
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ blogadm@proxy:/var/www/d.palmtb.net/

staging:
	rsync -a --exclude 'glaneuses.json' --delete blog/html/ /var/www/d.palmtb.net/
