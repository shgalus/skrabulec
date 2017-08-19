SKRABULEC.main = (function() {
  "use strict";
  var version, initModule;

  version = "0.11";

  initModule = function(container, option) {
    var conf, dict;
    if (option === "en") {
      conf = SKRABULEC.conf.en.config_map;
      dict = SKRABULEC.dict.en;
    } else if (option === "pl") {
      conf = SKRABULEC.conf.pl.config_map;
      dict = SKRABULEC.dict.pl;
    } else if (option === "us") {
      conf = SKRABULEC.conf.en.config_map;
      dict = SKRABULEC.dict.us;
    } else
      SKRABULEC.utils.assert(false);
    SKRABULEC.ui.startGame(container, conf, dict);
  };

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
