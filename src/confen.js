export const configMap = {
  letter_map: {
    "a": {npoints:  1, nitems:  9}, "b": {npoints:  3, nitems:  2},
    "c": {npoints:  3, nitems:  2}, "d": {npoints:  2, nitems:  4},
    "e": {npoints:  1, nitems: 12}, "f": {npoints:  4, nitems:  2},
    "g": {npoints:  2, nitems:  3}, "h": {npoints:  4, nitems:  2},
    "i": {npoints:  1, nitems:  9}, "j": {npoints:  8, nitems:  1},
    "k": {npoints:  5, nitems:  1}, "l": {npoints:  1, nitems:  4},
    "m": {npoints:  3, nitems:  2}, "n": {npoints:  1, nitems:  6},
    "o": {npoints:  1, nitems:  8}, "p": {npoints:  3, nitems:  2},
    "q": {npoints: 10, nitems:  1}, "r": {npoints:  1, nitems:  6},
    "s": {npoints:  1, nitems:  4}, "t": {npoints:  1, nitems:  6},
    "u": {npoints:  1, nitems:  4}, "v": {npoints:  4, nitems:  2},
    "w": {npoints:  4, nitems:  2}, "x": {npoints:  8, nitems:  1},
    "y": {npoints:  4, nitems:  2}, "z": {npoints: 10, nitems:  1},
    "?": {npoints:  0, nitems:  2}
  },
  string_map: {
    game_finished:       "The game is already finished",
    move_error:          "Erroneous move",
    set_blank_letter:    "Please set a letter for blank",
    max_three_exchanges: "No more than three exchanges are allowed",
    not_enough_tiles_in_bag: "An exchange cannot be made if " +
      "there are less than seven tiles in the bag",
    // validateMove
    set_some_tiles:      "Please put some tiles on the board",
    vert_or_horiz_cont:  "Tiles must be arranged adjacently in " +
      "one horizontal or vertical line",
    must_be_cont:        "Tiles must be arranged adjacently",
    first_move:          "The first move must have more than two " +
      "tiles and cover the field H8",
    no_word:             "There is no word: ",
    no_words:            "There are no words: ",

    // ui.js
    game_over:           "The game is already finished",
    confirm_btn:         "Confirm",
    clear_btn:           "Clear",
    pause_btn:           "Pause",
    exchange_btn:        "Exchange",
    resign_btn:          "Resignation",
    dialog_title:        "Information",
    repl_blank_title:    "Replacing blank.",
    repl_blank_tile_command: "Please click a letter for the blank.",
    exchange_tiles_title: "Exchange of tiles.",
    exchange_tiles_command: "Please drag to the lower rack " +
      "tiles to exchange.",
    word_list_pause:     "PAUSE",
    word_list_exchange:  "EXCHANGE",

    // Right panel, points.
    plr_points:          "Player's points:",
    total_points:        "Total points:",
    opp_points:          "Opponent's points:",
    n_of_tiles_in_bag:   "Tiles in the bag:",
    last_words:          "Last words:",

    // Dialogs.
    dialog_error_title:  "Error",
    dialog_info_title:   "Information",
    dialog_close_text:   "Close",
    dialog_ok_button:    "OK",
    dialog_repl_blank_button: "Restore blank",
    dialog_exchange_tiles_button: "Exchange",
    end_of_game_info:    "Game is finished.",
    game_has_finished:   "The game has finished",
    opponent_pauses:     "Opponent pauses",
    opponent_exchanges:  "Opponent exchanges tiles"
  }
};
