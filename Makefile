SHELL = /bin/sh

VERSION = $(shell ruby2.1 -n -e \
'puts $$_.split("\"")[1] if $$_ =~ /version =/' src/main.js)

DIST=skrabulec-$(VERSION)

.PHONY: all dist install clean spotless

all:
	cd lib && $(MAKE) all
	cd src && $(MAKE) all

dist: all
	rm -rf $(DIST)
	mkdir $(DIST)
	ruby2.1 -n -e \
	'puts $$_.gsub(/="\.\.\/lib\//, "=\"")' \
	src/skrabulec.html > $(DIST)/skrabulec.html
	cp -pr lib/images $(DIST)
	cp -p lib/jquery-ui.min.css $(DIST)
	cp -p lib/jquery-3.2.1.min.js $(DIST)
	cp -p lib/jquery-ui.min.js $(DIST)
	cp -p src/skrabulec.css $(DIST)
	cp -p src/*.js $(DIST)
	tar cvf $(DIST).tar $(DIST)
	gzip -9 $(DIST).tar

clean:
	cd aux && $(MAKE) clean
	cd lib && $(MAKE) clean
	cd src && $(MAKE) clean
	rm -rf skrabulec-[0-9]*

spotless:
	cd aux && $(MAKE) spotless
	cd lib && $(MAKE) spotless
	cd src && $(MAKE) spotless
	rm -rf skrabulec-[0-9]* skrabulec-[0-9]*.tar.gz
