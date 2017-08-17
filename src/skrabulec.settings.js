SKRABULEC.settings = (function() {
  "use strict";
  var
  configMap = {
    main_html : String()
      + '<div id="set-main">'
      + '<h1>Skrabulec</h1>'
      + '  <fieldset>'
      + '    <div id="set-lang">'
      + '      <input type="radio" id="set-lang-en" '
      + 'name="language" checked="checked">'
      + '      <label for="set-lang-en"></label>'
      + '      <input type="radio" id="set-lang-pl" name="language">'
      + '      <label for="set-lang-pl"></label>'
      + '    </div>'
      + '  </fieldset>'
      + '  <fieldset>'
      + '    <legend id="set-game-legend"></legend>'
      + '    <div id="set-game">'
      + '      <input type="radio" id="set-game-en" '
      + 'name="game" checked="checked">'
      + '      <label for="set-game-en"></label>'
      + '      <input type="radio" id="set-game-pl" name="game">'
      + '      <label for="set-game-pl"></label>'
      + '      <input type="radio" id="set-game-us" name="game">'
      + '      <label for="set-game-us"></label>'
      + '    </div>'
      + '  </fieldset>'
      + '  <div>'
      + '    <button id="set-main-ok" type="button"></button>'
      + '  </div>'
      + '</div>',
    lang_map : {
      "set-lang-en": {
        "en": "English",
        "pl": "angielski"
      },
      "set-lang-pl": {
        "en": "Polish",
        "pl": "polski"
      },
      "set-game-legend": {
        "en": "Please select language",
        "pl": "Proszę wybrać język"
      },
      "set-game-en": {
        "en": "English",
        "pl": "angielski"
      },
      "set-game-pl": {
        "en": "Polish",
        "pl": "polski"
      },
      "set-game-us": {
        "en": "English with TWL06 dictionary",
        "pl": "angielski ze słownikiem TWL06"
      },
      "set-main-ok": {
        "en": "OK",
        "pl": "Zatwierdź"
      }
    }
  },
  getSettings;

  // https://stackoverflow.com/questions/13903556/, August 2017.
  $.fn.center = function() {
    this.css("position", "absolute");
    this.css("top", ($(window).height() - this.height()) / 2  + "px");
    this.css("left", ($(window).width() - this.width()) / 2 + "px");
    return this;
  };

  getSettings = function(container, callback) {
    
    function create_control_groups() {
      $("input[type='radio']").checkboxradio({
        classes: {
          "ui-checkboxradio-label": "set-radio-label",
          "ui-checkboxradio-checked": "set-radio-label"
        },
        icon: true
      });
      $("#set-lang").controlgroup({
        classes: {
          "ui-controlgroup-item": "set-controlgroup-item",
        }
      });
      $("#set-game").controlgroup({
        direction: "vertical",
        classes: {
          "ui-controlgroup-item": "set-controlgroup-item",
        }
      });
    }

    function set_language(lang) {
      function radio_label(i) {
        $("#" + i).checkboxradio({
          label: configMap.lang_map[i][lang]
        });
      }
      function other_control(i) {
        $("#" + i).text(configMap.lang_map[i][lang]);
      }
      radio_label("set-lang-en");
      radio_label("set-lang-pl");
      other_control("set-game-legend");
      radio_label("set-game-en");
      radio_label("set-game-pl");
      radio_label("set-game-us");
      other_control("set-main-ok");
    }
    
    container.append(configMap.main_html);
    create_control_groups();
    set_language("en");
    $("#set-main").center();
    $("input[name='language']").change(function() {
      var id = $("#set-lang :radio:checked").attr("id");
      if (id === "set-lang-pl")
        set_language("pl");
      else if (id === "set-lang-en")
        set_language("en");
      else
        SKRABULEC.utils.assert(false);
    });
    $("#set-main-ok").click(function() {
      var id = $("#set-game :radio:checked").attr("id"), s;
      if (id === "set-game-en")
        s = "en";
      else if (id === "set-game-pl")
        s = "pl";
      else if (id === "set-game-us")
        s = "us";
      else
        SKRABULEC.utils.assert(false);
      container.empty();
      callback(container, s);
    });
  };

  return {
    getSettings: getSettings
  };
}());
