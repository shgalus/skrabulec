SHELL = /bin/sh
RUBY = /usr/bin/ruby2.3 -w
UNZIP = unzip
GZIP = gzip
INSTALL = install

prefix = /usr/local
datadir = $(prefix)/share/skrabulec
# Leave empty for true install.
DESTDIR = .
BUILDDIR = build

# Leave empty unless source maps should be generated.
SOURCE_MAPS = true
ifdef SOURCE_MAPS
BABEL = node_modules/.bin/babel -s inline
BROWSERIFY = /usr/local/bin/browserify -d
else
BABEL = node_modules/.bin/babel
BROWSERIFY = /usr/local/bin/browserify
endif

JQUERYUI = jquery-ui-1.12.1.custom

SRCS_JS = utils.js confen.js confpl.js engine.js game.js testing.js	\
ui.js settings.js main.js

GENERATED = jquery-ui.min.js jquery-ui.min.css images dicten.js	\
dictpl.js dictus.js skrabulec.min.js

ALL = skrabulec.html skrabulec.css jquery-3.2.1.min.js $(GENERATED)

DESTFILES = skrabulec.html skrabulec.css jquery-3.2.1.min.js		\
jquery-ui.min.js jquery-ui.min.css dicten.js dictpl.js dictus.js	\
skrabulec.min.js

$(BUILDDIR)/%.js : %.js | $(BUILDDIR)
	$(BABEL) -o $@ $<

.PHONY: all install uninstall lint clean spotless

all: $(ALL)

jquery-ui.min.js jquery-ui.min.css: $(JQUERYUI).zip
	$(UNZIP) -qo -j -DD $^ $(JQUERYUI)/$@
images: $(JQUERYUI).zip
	$(UNZIP) -qo -j -DD $^ $(JQUERYUI)/images/* -dimages
dicten.js dictpl.js dictus.js: mkdict.rb $(BUILDDIR)/dawg
$(BUILDDIR)/dawg: dawg-0.0.5.gem | $(BUILDDIR)
	cd $(BUILDDIR) && mkdir dawg && tar xvf ../$< data.tar.gz -O	\
        | tar zxv -C dawg --strip-components 1
dicten.js: sowpods.txt.gz
	$(GZIP) -dc $< | $(RUBY) mkdict.rb > $@
dictpl.js: sjp-20170729.zip
	$(UNZIP) -p $< slowa.txt | $(RUBY) mkdict.rb > $@
dictus.js: twl06.txt.gz
	$(GZIP) -dc $< | $(RUBY) mkdict.rb > $@
skrabulec.min.js: $(BUILDDIR)/skrabulec.js
	# uglifyjs $(BUILDDIR)/skrabulec.js -c -m -o skrabulec.min.js
	cp $(BUILDDIR)/skrabulec.js skrabulec.min.js
$(BUILDDIR)/skrabulec.js: $(addprefix $(BUILDDIR)/, $(SRCS_JS))
	$(BROWSERIFY) $^ -o $(BUILDDIR)/skrabulec.js
$(BUILDDIR):
	mkdir $@

install: all
	$(INSTALL) -d $(DESTDIR)$(datadir) $(DESTDIR)$(datadir)/images
	$(INSTALL) -m 644 $(DESTFILES) $(DESTDIR)$(datadir)
	$(INSTALL) -m 644 images/* $(DESTDIR)$(datadir)/images
uninstall:
	rm -rf $(DESTDIR)$(datadir)

lint:
	jshint $(SRCS_JS)

clean:
	rm -rf $(BUILDDIR)
spotless: clean
	rm -rf $(GENERATED)
