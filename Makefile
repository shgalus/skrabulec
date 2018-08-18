SHELL = /bin/sh
RUBY = /usr/bin/ruby2.3
BABEL = node_modules/.bin/babel
BROWSERIFY = /usr/local/bin/browserify

JQUERYUI = jquery-ui-1.12.1.custom
JQUIVER = jquery-ui.js

JSSRC = utils.es6.js confen.es6.js confpl.es6.js engine.es6.js game.es6.js testing.es6.js ui.es6.js settings.es6.js main.es6.js
# OBJS = $(addprefix $(BUILD1)/, $(JSSRC) jquery-3.2.1.min.js $(JQUIVER))
OBJS = $(addprefix $(BUILD1)/, $(JSSRC))

SRCDIR = src
BUILD1 = build/build1
BUILD2 = build/build2
BUILD3 = build/build3

REL = $(addprefix $(BUILD3)/, skrabulec.html skrabulec.css skrabulec.min.js)

rel: $(REL) $(BUILD3)/jquery-3.2.1.min.js $(BUILD3)/jquery-ui.min.js $(BUILD3)/jquery-ui.min.css $(BUILD3)/images $(BUILD3)/dicten.js $(BUILD3)/dictpl.js $(BUILD3)/dictus.js

$(BUILD3)/dicten.js: src/dicten.js
	cp $^ $@
$(BUILD3)/dictpl.js: src/dictpl.js
	cp $^ $@
$(BUILD3)/dictus.js: src/dictus.js
	cp $^ $@
$(BUILD3)/jquery-ui.min.css: lib/$(JQUERYUI).zip
	unzip -qo -j -DD lib/$(JQUERYUI).zip $(JQUERYUI)/jquery-ui.min.css -d$(BUILD3)

$(BUILD3)/jquery-ui.min.js: lib/$(JQUERYUI).zip
	unzip -qo -j -DD lib/$(JQUERYUI).zip $(JQUERYUI)/jquery-ui.min.js -d$(BUILD3)

$(BUILD3)/jquery-3.2.1.min.js: lib/jquery-3.2.1.min.js
	cp $^ $@

$(BUILD3)/images: lib/$(JQUERYUI).zip
	unzip -qo -j -DD lib/$(JQUERYUI).zip $(JQUERYUI)/images/* -d$(BUILD3)/images

$(BUILD3)/skrabulec.min.js: $(BUILD2)/skrabulec.js | $(BUILD3)
	# uglifyjs $(BUILD2)/skrabulec.js -c -m -o $(BUILD3)/skrabulec.min.js
	cp $(BUILD2)/skrabulec.js $(BUILD3)/skrabulec.min.js
$(BUILD2)/skrabulec.js: $(OBJS) | $(BUILD2)
	$(BROWSERIFY) $(OBJS) -d -o $(BUILD2)/skrabulec.js
$(BUILD1)/%.js : $(SRCDIR)/%.js | $(BUILD1)
	$(BABEL) $< -o $@

$(BUILD3)/skrabulec.html: src/skrabulec.html | $(BUILD3)
	cp $^ $@

$(BUILD3)/skrabulec.css: src/skrabulec.css
	cp $^ $@

$(BUILD1):
	mkdir -p $(BUILD1)
$(BUILD2):
	mkdir -p $(BUILD2)
$(BUILD3):
	mkdir -p $(BUILD3)

# Old Makefile:

VERSION = $(shell ruby2.1 -n -e \
'puts $$_.split("\"")[1] if $$_ =~ /version =/' src/main.js)

DIST=skrabulec-$(VERSION)

.PHONY: all dist install clean spotless

all:
	cd lib && $(MAKE) all
	cd src && $(MAKE) all

dist: all
	rm -rf $(DIST) $(DIST).tar.gz
	mkdir $(DIST)
	ruby -n -e \
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
