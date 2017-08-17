SHELL = /bin/sh

.PHONY: all clean spotless

DICTS = dicten.js dictpl.js dictus.js

all: $(DICTS)

dicten.js: mkdict.rb
	gzip -dc ../lib/sowpods.txt.gz | ./mkdict.rb > $@
dictpl.js: mkdict.rb
	unzip -p ../lib/sjp-20170729.zip slowa.txt | ./mkdict.rb > $@
dictus.js: mkdict.rb
	gzip -dc ../lib/twl06.txt.gz | ./mkdict.rb > $@
clean:

spotless: clean
	rm -f $(DICTS)
