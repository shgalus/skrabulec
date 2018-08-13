# Babel 6.26.0, August 2018.

Installing:

    npm install --save-dev babel-cli babel-preset-es2015

Later calling with:

    ./node_modules/.bin/babel src/utils.js

# Structure of the program as of 13 VIII 2018.

## Files included in skrabulec.html in order of inclusion.

1. jquery-ui.min.css
2. skrabulec.css
3. jquery-3.2.1.min.js
4. jquery-ui.min.js
5. utils.js
6. dicten.js
7. dictpl.js
8. dictus.js
9. confen.js
10. confpl.js
11. engine.js
12. game.js
13. ui.js
14. testing.js
15. settings.js
16. main.js

## Structure of JavaScript source code.

### utils.js
    var SKRABULEC = {};
    SKRABULEC.conf = {};
    SKRABULEC.dict = {};
    SKRABULEC.utils = (function() {
      ...
      return {
        assert: assert,
        makeArray: makeArray,
        nextPermutation: nextPermutation,
        makeComblex: makeComblex
      };
    }());
### dicten.js
    SKRABULEC.dict.en = [{a:1,b:7825,c:12438,...},{...},...];
### dictus.js
    SKRABULEC.dict.us = [{a:1,b:5794,c:9182,...},{...},...];
### dictpl.js
    SKRABULEC.dict.pl = [{a:1,b:8109,c:14217,...},{...},...];
### confen.js
    SKRABULEC.conf.en = (function() {
      ...
      return {
        config_map: configMap,
      };
    }());
### confpl.js
    SKRABULEC.conf.pl = (function() {
      ...
      return {
        config_map: configMap,
      };
    }());
### engine.js
    SKRABULEC.engine = SKRABULEC.engine || {};
    SKRABULEC.engine.prototype = (function() {
      ...
      return prototype;
    }());
    SKRABULEC.engine.make_engine = function(conf, dict) {
      ...
      return engine;
    };
### game.js
    SKRABULEC.game = SKRABULEC.game || {};
    SKRABULEC.game.prototype = (function() {
      ...
      return prototype;
    }());
    SKRABULEC.game.make_game = function(conf, dict) {
      ...
      return game;
    };
### ui.js
    SKRABULEC.ui = (function() {
      ...
      return {
        startGame: startGame
      };
    }());
### testing.js
    SKRABULEC.testing = (function() {
      ...
      return {
        doAllTests: doAllTests
      };
    }());
### settings.js
    SKRABULEC.settings = (function() {
      ...
      return {
        getSettings: getSettings
      };
    }());
### main.js
    SKRABULEC.main = (function() {
      ...
      return {
        varsion: version,
        initModule: initModule
      };
    }());
    $(document).ready(function() {
      "use strict";
      SKRABULEC.settings.getSettings(jQuery('#scrabble'),
                                     SKRABULEC.main.initModule);
    });
