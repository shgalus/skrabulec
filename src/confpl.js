SKRABULEC.confpl = (function() {
  "use strict";
  var
  configMap = {
    letter_map: {
      "a": {npoints: 1, nitems: 9}, "ą": {npoints: 5, nitems: 1},
      "b": {npoints: 3, nitems: 2}, "c": {npoints: 2, nitems: 3},
      "ć": {npoints: 6, nitems: 1}, "d": {npoints: 2, nitems: 3},
      "e": {npoints: 1, nitems: 7}, "ę": {npoints: 5, nitems: 1},
      "f": {npoints: 5, nitems: 1}, "g": {npoints: 3, nitems: 2},
      "h": {npoints: 3, nitems: 2}, "i": {npoints: 1, nitems: 8},
      "j": {npoints: 3, nitems: 2}, "k": {npoints: 2, nitems: 3},
      "l": {npoints: 2, nitems: 3}, "ł": {npoints: 3, nitems: 2},
      "m": {npoints: 2, nitems: 3}, "n": {npoints: 1, nitems: 5},
      "ń": {npoints: 7, nitems: 1}, "o": {npoints: 1, nitems: 6},
      "ó": {npoints: 5, nitems: 1}, "p": {npoints: 2, nitems: 3},
      "r": {npoints: 1, nitems: 4}, "s": {npoints: 1, nitems: 4},
      "ś": {npoints: 5, nitems: 1}, "t": {npoints: 2, nitems: 3},
      "u": {npoints: 3, nitems: 2}, "w": {npoints: 1, nitems: 4},
      "y": {npoints: 2, nitems: 4}, "z": {npoints: 1, nitems: 5},
      "ź": {npoints: 9, nitems: 1}, "ż": {npoints: 5, nitems: 1},
      "?": {npoints: 0, nitems: 2}
    },
    string_map: {
      game_finished:       "Gra jest już zakończona",
      move_error:          "Błąd w zapisie ruchu",
      set_blank_letter:    "Proszę ustawić literę dla mydła",
      max_three_exchanges: "Nie można dokonać więcej niż " +
        "trzech wymian",
      not_enough_tiles_in_bag: "Nie można dokonać wymiany, jeśli w " +
        "worku pozostało mniej niż 7 płytek",

      // validateMove
      set_some_tiles:      "Proszę ustawić klocki na planszy",
      vert_or_horiz_cont:  "Klocki muszą być ułożone jednym " +
        "ciągiem w jednej linii poziomej lub pionowej",
      must_be_cont:        "Klocki muszą być ułożone jednym ciągiem",
      first_move:          "Pierwszy ruch musi mieć więcej niż " +
        "jedną literę i zakrywać pole H8",
      no_word:             "Nie istnieje słowo: ",
      no_words:            "Nie istnieją słowa: ",

      // ui.js
      game_over:           "Gra jest już zakończona",
      confirm_btn:         "Zatwierdź",
      clear_btn:           "Wyczyść",
      pause_btn:           "Pauza",
      exchange_btn:        "Wymiana",
      resign_btn:          "Rezygnacja",
      dialog_title:        "Informacja",
      repl_blank_title:    "Zastępowanie mydła.",
      repl_blank_tile_command: "Proszę kliknąć literę, " +
        "którą ma zatępować mydło.",
      exchange_tiles_title: "Wymiana płytek.",
      exchange_tiles_command: "Proszę przeciągnąć na dolny stojak " +
        "płytki, które mają być wymienione.",

      // Right panel, points.
      plr_points:          "Punkty gracza:",
      total_points:        "Suma punktów:",
      opp_points:          "Punkty przeciwnika:",
      n_of_tiles_in_bag:   "Klocków w worku:",
      last_words:          "Ostatnie słowa:",

      // Dialogs.
      dialog_close_text:   "Zamknij",
      dialog_ok_button:    "OK",
      dialog_repl_blank_button: "Przywróć mydło",
      dialog_exchange_tiles_button: "Wymień",
      end_of_game_info:    "Koniec gry."
    }
  };

  return {
    config_map: configMap,
  };
}());

SKRABULEC.conf = SKRABULEC.confpl.config_map;
