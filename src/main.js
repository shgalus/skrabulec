SKRABULEC.main = (function() {
  "use strict";
  var initModule, version;

  version = "0.1";

  initModule = function(container) {
    SKRABULEC.engine.initModule(SKRABULEC.conf);
    SKRABULEC.ui.initModule(container);
    SKRABULEC.testing.doAllTests();
    SKRABULEC.ui.startGame();
  };
  return {
    initModule: initModule,
    varsion: version
  };
}());

$(document).ready(function() {
  "use strict";
  // SKRABULEC.testing.doAllTests();
  SKRABULEC.main.initModule(jQuery('#scrabble'));
});
