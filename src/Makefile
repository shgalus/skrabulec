SHELL = /bin/sh

.PHONY: all clean spotless

all: dictpl.js

dictpl.js: mkdict.rb
	unzip -p ../lib/sjp-20170729.zip slowa.txt | ./mkdict.rb > $@

clean:

spotless: clean
	rm -f dictpl.js
