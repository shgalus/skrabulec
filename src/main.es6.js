import {assert} from "./utils.es6.js";
import {getSettings} from "./settings.es6.js";
import {configMap as config_map_en} from "./confen.es6.js";
import {configMap as config_map_pl} from "./confpl.es6.js";
import {startGame} from "./ui.es6.js";

var $ = window.$;
var jQuery = window.jQuery;
var dicten = window.SKRABULEC.dict.en;
var dictpl = window.SKRABULEC.dict.pl;
var dictus = window.SKRABULEC.dict.us;

var initModule;

export const version = "0.11";

initModule = function(container, option) {
  "use strict";

  var conf, dict;
  if (option === "en") {
    conf = config_map_en;
    dict = dicten;
  } else if (option === "pl") {
    conf = config_map_pl;
    dict = dictpl;
  } else if (option === "us") {
    conf = config_map_en;
    dict = dictus;
  } else
    assert(false);
  startGame(container, conf, dict);
};

$(document).ready(function() {
  "use strict";
  getSettings(jQuery('#scrabble'), initModule);
});
