SHELL = /bin/sh

.PHONY: all lint clean spotless

JSSRCS = confen.js confpl.js engine.js game.js main.js settings.js	\
testing.js ui.js utils.js

DICTS = dicten.js dictpl.js dictus.js

all: $(DICTS)

dicten.js: mkdict.rb
	gzip -dc ../lib/sowpods.txt.gz | ./mkdict.rb > $@
dictpl.js: mkdict.rb
	unzip -p ../lib/sjp-20170729.zip slowa.txt | ./mkdict.rb > $@
dictus.js: mkdict.rb
	gzip -dc ../lib/twl06.txt.gz | ./mkdict.rb > $@
lint:
	jshint $(JSSRCS)
clean:

spotless: clean
	rm -f $(DICTS)
