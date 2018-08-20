skrabulec
=========

Skrabulec is a JavaScript implementation of the
[SCRABBLE®](http://www.scrabble.com/) game. The program uses algorithm
published by Andrew W. Appel and Guy J. Jacobson in
[_The World's Fastet Scrabble Program_](doc/appeljac.pdf). Current
revision plays English, Polish and American versions of the game,
using dictionaries based respectively on
[_Collins Scrabble Words_](https://en.wikipedia.org/wiki/Collins_Scrabble_Words)
list, [_Lista słów do gier_](https://sjp.pl/slownik/growy/) and
[_Official Tournament and Club Word List_](https://en.wikipedia.org/wiki/Official_Tournament_and_Club_Word_List).


The program is in pre-alpha stage of development.

Current version number can be found in [src/main.js](src/main.js).

A working copy can be found
[here](https://shgalus.github.io/skrabulec-0.11/skrabulec.html).

Development environment is Debian GNU/Linux with Ruby 2.1, [jshint
2.9.4](http://jshint.com/) under Node.js 0.10.29 and Mozilla Firefox
54.

To prepare development environment, say `make`. This unpacks libraries
and generates the dictionary source files. Then
[src/skrabulec.html](src/skrabulec.html) can be open in a browser.

Say `make dist` to prepare distribution file skrabulec-version.tar.gz.

This directory [extern](extern) contains the following files:

* dawg-0.0.5.gem — [dawg Ruby gem](https://rubygems.org/gems/dawg/)
  version 0.0.5
* jQuery 3.2.1 from
  [http://jquery.com/download/](http://jquery.com/download/), June
  2017
  * jquery-3.2.1.js — uncompressed
  * jquery-3.2.1.min.js — compressed
  * jquery-3.2.1.min.map — map file
* jquery-ui-1.12.1.custom.zip — jQuery UI 1.12.1 from
  [http://jqueryui.com/download/](http://jqueryui.com/download/), all
  components, base theme, June 2017
* jshintrc — original .jshintrc from
  [JSHint project repository](https://github.com/jshint/jshint/tree/master/examples),
  June 2017, formatted by emacs js2-mode
* sjp-20170729.zip — GPL-licensed list of Polish words from
  [SJP](https://sjp.pl/slownik/growy/). As I observed, two previous
  versions were 20170608.zip, sjp-20170416.zip.
* sowpods.txt.gz — gzipped
[Collins Scrabble Words](https://en.wikipedia.org/wiki/Collins_Scrabble_Words)
list, downloaded in August 2017 from
[https://www.wordgamedictionary.com/sowpods/download/sowpods.txt](https://www.wordgamedictionary.com/sowpods/download/sowpods.txt)
* twl06.txt.gz — gzipped
[Official Tournament and Club Word List](https://en.wikipedia.org/wiki/Official_Tournament_and_Club_Word_List),
downloaded in August 2017 from
[https://www.wordgamedictionary.com/twl06/download/twl06.txt](https://www.wordgamedictionary.com/twl06/download/twl06.txt)

See the file [LICENSE](LICENSE) for licensing information.

Thanks for [Amnon David](https://github.com/amnond) for user interface
inspirations from his [jscrab](https://github.com/amnond/jscrab)
program.
