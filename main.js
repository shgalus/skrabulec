import {assert} from "./utils.js";
import {getSettings} from "./settings.js";
import {configMap as config_map_en} from "./confen.js";
import {configMap as config_map_pl} from "./confpl.js";
import {startGame} from "./ui.js";

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
