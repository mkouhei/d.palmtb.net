#!/usr/bin/make -f
# -*- makefile -*-

TINKER := tinker
RSYNC := rsync
SRCS := $(glob 20*/*/*/*.rst)

all: build

build: $(SRCES)
	$(TINKER) -b -q

publish: build
	$(RSYNC) -a --delete blog/html/ blogadm@proxy:/var/www/d.palmtb.net/

staging: build
	$(RSYNC) -a --delete blog/html/ /var/www/d.palmtb.net/
