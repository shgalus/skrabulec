SHELL = /bin/sh
RUBY = /usr/bin/ruby2.3 -w
UNZIP = unzip

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

# prefix = /usr/local/share
prefix = .

# Destination directory for the bundle.
DESTDIR = $(prefix)/skrabulec
SRCDIR = ./src
BUILDDIR = ./build
EXTERNDIR = ./extern
SRCS_JS = utils.js confen.js confpl.js engine.js game.js testing.js ui.js settings.js main.js

BUNDLE = jquery-3.2.1.min.js jquery-ui.min.js jquery-ui.min.css images dicten.js dictpl.js dictus.js skrabulec.min.js skrabulec.css skrabulec.html

.PHONY: all new_bin lint clean spotless

$(BUILDDIR)/%.js : $(SRCDIR)/%.js | $(BUILDDIR)
	$(BABEL) -o $@ $<

all: new_bin

new_bin: $(addprefix $(DESTDIR)/, $(BUNDLE))
$(addprefix $(DESTDIR)/, $(BUNDLE)): | $(DESTDIR)
$(DESTDIR)/jquery-3.2.1.min.js: $(EXTERNDIR)/jquery-3.2.1.min.js
	cp $^ $@
$(addprefix $(DESTDIR)/, jquery-ui.min.js jquery-ui.min.css): $(EXTERNDIR)/$(JQUERYUI).zip
	$(UNZIP) -qo -j -DD $^ $(JQUERYUI)/$(notdir $@) -d$(DESTDIR)
$(DESTDIR)/images: $(EXTERNDIR)/$(JQUERYUI).zip
	$(UNZIP) -qo -j -DD $^ $(JQUERYUI)/images/* -d$(DESTDIR)/images
$(addprefix $(DESTDIR)/, dicten.js dictpl.js dictus.js): $(SRCDIR)/mkdict.rb $(BUILDDIR)/dawg
$(BUILDDIR)/dawg: $(EXTERNDIR)/dawg-0.0.5.gem | $(BUILDDIR)
	cd $(BUILDDIR) && mkdir dawg && tar xvf ../$(EXTERNDIR)/dawg-0.0.5.gem data.tar.gz -O | tar zxv -C dawg --strip-components 1
$(DESTDIR)/dicten.js: $(EXTERNDIR)/sowpods.txt.gz
	gzip -dc $(EXTERNDIR)/sowpods.txt.gz | $(RUBY) $(SRCDIR)/mkdict.rb > $@
$(DESTDIR)/dictpl.js: $(EXTERNDIR)/sjp-20170729.zip
	$(UNZIP) -p $(EXTERNDIR)/sjp-20170729.zip slowa.txt | $(RUBY) $(SRCDIR)/mkdict.rb > $@
$(DESTDIR)/dictus.js: $(EXTERNDIR)/twl06.txt.gz
	gzip -dc $(EXTERNDIR)/twl06.txt.gz | $(RUBY) $(SRCDIR)/mkdict.rb > $@
$(DESTDIR)/skrabulec.min.js: $(BUILDDIR)/skrabulec.js
	# uglifyjs $(BUILDDIR)/skrabulec.js -c -m -o $(DESTDIR)/skrabulec.min.js
	cp $(BUILDDIR)/skrabulec.js $(DESTDIR)/skrabulec.min.js
$(BUILDDIR)/skrabulec.js: $(addprefix $(BUILDDIR)/, $(SRCS_JS))
	$(BROWSERIFY) $(addprefix $(BUILDDIR)/, $(SRCS_JS)) -o $(BUILDDIR)/skrabulec.js
$(DESTDIR)/skrabulec.html: $(SRCDIR)/skrabulec.html
	cp $^ $@
$(DESTDIR)/skrabulec.css: $(SRCDIR)/skrabulec.css
	cp $^ $@
$(DESTDIR) $(BUILDDIR):
	mkdir -p $@

lint:
	jshint $(addprefix $(SRCDIR)/, $(SRCS_JS))

clean:
	rm -rf $(BUILDDIR)
spotless: clean
	rm -rf $(DESTDIR)
