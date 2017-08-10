SHELL = /bin/sh
JQUERYUI = jquery-ui-1.12.1.custom
.PHONY: all clean spotless

all: dawg images jquery-ui.min.css jquery-ui.min.js

dawg: dawg-0.0.5.gem
	mkdir dawg && tar xvf dawg-0.0.5.gem data.tar.gz -O | \
	tar zxv -C dawg --strip-components 1
images: $(JQUERYUI).zip
	unzip -o -j -DD $(JQUERYUI).zip $(JQUERYUI)/images/* -dimages
jquery-ui.min.css: $(JQUERYUI).zip
	unzip -o -j -DD $(JQUERYUI).zip $(JQUERYUI)/jquery-ui.min.css
jquery-ui.min.js: $(JQUERYUI).zip
	unzip -o -j -DD $(JQUERYUI).zip $(JQUERYUI)/jquery-ui.min.js
clean:
	rm -f slowa.txt
spotless: clean
	rm -rf dawg images jquery-ui.min.css jquery-ui.min.js
