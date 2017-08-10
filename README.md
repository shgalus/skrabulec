skrabulec
*********

Skrabulec is a JavaScript implementation of the
[SCRABBLE®](http://www.scrabble.com/) game. Current revision plays
Polish version of the game according to the rules of the
[Polish Scrabble Federation](http://www.pfs.org.pl/). The program uses
algorithm published by Andrew W. Appel and Guy J. Jacobson in
[_The World's Fastet Scrabble Program_](doc/appeljac.pdf) and a
dictionary based on
[Lista słów do gier](https://sjp.pl/slownik/growy/).

The program is in pre-alpha stage of development.

Current version number can be found in [src/main.js](src/main.js).

A working copy can be found
[here](https://shgalus.github.io/skrabulec-0.1/skrabulec.html).

Development environment is Debian GNU/Linux with Ruby 2.1, [jshint
2.9.4](http://jshint.com/) under Node.js 0.10.29 and Mozilla Firefox
54.

To prepare development environment, say `make`. This unpacks libraries
and generates the dictionary source files. Then
[src/skrabulec.html](src/skrabulec.html) can be open in a browser.

Say `make dist` to prepare distribution file skrabulec-version.tar.gz.

See the file [LICENSE](LICENSE) for licensing information.

Credits
*******

Thanks for [Amnon David](https://github.com/amnond) for user interface
inspirations from his [jscrab](https://github.com/amnond/jscrab)
program.
