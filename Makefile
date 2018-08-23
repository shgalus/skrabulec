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
BUILDDIR = ./build
SRCS_JS = utils.js confen.js confpl.js engine.js game.js testing.js ui.js settings.js main.js

BUNDLE = jquery-3.2.1.min.js jquery-ui.min.js jquery-ui.min.css images dicten.js dictpl.js dictus.js skrabulec.min.js skrabulec.css skrabulec.html

.PHONY: all new_bin lint clean spotless

$(BUILDDIR)/%.js : %.js | $(BUILDDIR)
	$(BABEL) -o $@ $<

all: new_bin

new_bin: $(addprefix $(DESTDIR)/, $(BUNDLE))
$(addprefix $(DESTDIR)/, $(BUNDLE)): | $(DESTDIR)
$(DESTDIR)/jquery-3.2.1.min.js: jquery-3.2.1.min.js
	cp $^ $@
$(addprefix $(DESTDIR)/, jquery-ui.min.js jquery-ui.min.css): $(JQUERYUI).zip
	$(UNZIP) -qo -j -DD $^ $(JQUERYUI)/$(notdir $@) -d$(DESTDIR)
$(DESTDIR)/images: $(JQUERYUI).zip
	$(UNZIP) -qo -j -DD $^ $(JQUERYUI)/images/* -d$(DESTDIR)/images
$(addprefix $(DESTDIR)/, dicten.js dictpl.js dictus.js): ./mkdict.rb $(BUILDDIR)/dawg
$(BUILDDIR)/dawg: dawg-0.0.5.gem | $(BUILDDIR)
	cd $(BUILDDIR) && mkdir dawg && tar xvf ../dawg-0.0.5.gem data.tar.gz -O | tar zxv -C dawg --strip-components 1
$(DESTDIR)/dicten.js: sowpods.txt.gz
	gzip -dc sowpods.txt.gz | $(RUBY) mkdict.rb > $@
$(DESTDIR)/dictpl.js: sjp-20170729.zip
	$(UNZIP) -p sjp-20170729.zip slowa.txt | $(RUBY) mkdict.rb > $@
$(DESTDIR)/dictus.js: twl06.txt.gz
	gzip -dc twl06.txt.gz | $(RUBY) mkdict.rb > $@
$(DESTDIR)/skrabulec.min.js: $(BUILDDIR)/skrabulec.js
	# uglifyjs $(BUILDDIR)/skrabulec.js -c -m -o $(DESTDIR)/skrabulec.min.js
	cp $(BUILDDIR)/skrabulec.js $(DESTDIR)/skrabulec.min.js
$(BUILDDIR)/skrabulec.js: $(addprefix $(BUILDDIR)/, $(SRCS_JS))
	$(BROWSERIFY) $(addprefix $(BUILDDIR)/, $(SRCS_JS)) -o $(BUILDDIR)/skrabulec.js
$(DESTDIR)/skrabulec.html: skrabulec.html
	cp $^ $@
$(DESTDIR)/skrabulec.css: skrabulec.css
	cp $^ $@
$(DESTDIR) $(BUILDDIR):
	mkdir -p $@

lint:
	jshint $(SRCS_JS)

clean:
	rm -rf $(BUILDDIR)
spotless: clean
	rm -rf $(DESTDIR)
