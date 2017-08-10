SKRABULEC.engine = (function(engine) {
  "use strict";

  var assert = SKRABULEC.utils.assert;

  engine.checkMove = function(board, move) {
    var i, h, d, f, f1, k,
        l = move.length;
    if (l === 0)
      return this.string_map.set_some_tiles;
    if (l === 1) {
      f = move[0].field;
      if (board[f] !== this.empty_field)
        return this.string_map.move_error; // tile put on another tile
      if (board[f + 1] > this.empty_field ||
          board[f + this.ncols2] >
          this.empty_field ||
          board[f - 1] > this.empty_field ||
          board[f - this.ncols2] >
          this.empty_field)
        return "";
      for (i = 0; i < board.length; i++)
        if (board[i] > this.empty_field)
          // a tile must be adjacent
          return this.string_map.must_be_cont;
      return this.string_map.first_move;
    }
    h = move[1].field - move[0].field < this.ncols2;
    f1 = move[0].field;
    if (board[f1] !== this.empty_field)
      return this.string_map.move_error; // tile put on another tile
    if (h) {
      d = 1;
      k = Math.floor(f1 / this.ncols2);
      for (i = 1; i < l; i++) {
        f = move[i].field;
        if (f <= f1 ||
            Math.floor(f / this.ncols2) !== k ||
            board[f] !== this.empty_field)
          return this.string_map.vert_or_horiz_cont;
        f1 = f;
      }
    } else {
      d = this.ncols2;
      k = f1 % this.ncols2;
      for (i = 1; i < l; i++) {
        f = move[i].field;
        if (f <= f1 || f % this.ncols2 !== k ||
            board[f] !== this.empty_field)
          return this.string_map.vert_or_horiz_cont;
        f1 = f;
      }
    }
    assert(f1 === move[l - 1].field);
    i = 0;
    for (k = move[0].field; k <= f1; k += d)
      if (board[k] === this.empty_field)
        if (i >= l || move[i++].field !== k)
          return this.string_map.vert_or_horiz_cont;
    assert(i === l);
    // Check if a tile is adjacent to a tile on the board.
    for (i = 0; i < l; i++) {
      f = move[i].field;
      if (board[f + 1] > this.empty_field ||
          board[f + this.ncols2] >
          this.empty_field ||
          board[f - 1] > this.empty_field ||
          board[f - this.ncols2] >
          this.empty_field) {
        return "";
      }
    }
    for (i = 0; i < board.length; i++)
      if (board[i] > this.empty_field)
        return this.string_map.must_be_cont; // a tile must be adjacent
    for (i = 0; i < l; i++)
      if (move[i].field === this.center)
        return "";
    return this.string_map.first_move;
  };

  engine.checkWords = function(board, move) {
    var i, k, h, d, f, w,
        that = this,
        words = [],
        l = move.length,
        err = [];

    function check_word() {
      f = move[i].field;
      w = move[i].letter;
      while (board[f - d] > that.empty_field)
        w = board[f -= d] + w;
      f = move[i].field;
      while (board[f + d] > that.empty_field)
        w += board[f += d];
      if (w.length > 1) {
        if (that.wordInDict(w))
          words.push(w);
        else
          err.push(w);
      }
    }

    assert(l > 0);
    if (l === 1) {
      i = 0;
      d = 1;
      check_word();
      d = this.ncols2;
      check_word();
      return {
        words: words,
        errors: err
      };
    }
    h = move[1].field - move[0].field < this.ncols2;
    d = h ? 1 : this.ncols2;
    // Check main word.
    w = String();
    f = move[0].field;
    while (board[f - d] > this.empty_field)
      w = board[f -= d] + w;
    f = move[l - 1].field;
    i = 0;
    for (k = move[0].field; k <= f; k += d) {
      if (board[k] === this.empty_field)
        w += move[i++].letter;
      else
        w += board[k];
    }
    while (board[f + d] > this.empty_field)
      w += board[f += d];
    if (this.wordInDict(w))
      words.push(w);
    else
      err.push(w);
    // Check each cross word.
    h = !h;
    d = h ? 1 : this.ncols2;
    for (i = 0; i < move.length; i++)
      check_word();
    return {
      words: words,
      errors: err
    };
  };

  //
  // Given board and move, calculates points for this move. The
  // function in no way checks if the move is correct. The move is in
  // the form:
  //
  // [
  //  {field: cToi("H7"), isblank: false, letter: "ł"},
  //  {field: cToi("H8"), isblank: true,  letter: "a"},
  //  {field: cToi("H9"), isblank: false, letter: "ń"}
  // ]
  //
  // but the fields may not be sorted.
  //
  engine.calculatePoints = function(board, move) {
    var npoints = 0,
        that = this,
        horiz, d, i, f, np, p, ndoublew, ntriplew;

    function calculate_word() {
      for (i = 0; i < move.length; i++) {
        f = move[i].field;
        np = 0;
        while (board[f - d] > that.empty_field)
          np += that.letterMap[board[f -= d]].npoints;
        f = move[i].field;
        while (board[f + d] > that.empty_field)
          np += that.letterMap[board[f += d]].npoints;
        if (np === 0)
          continue;
        p = move[i].isblank ? 0
          : that.letterMap[move[i].letter].npoints;
        f = move[i].field;
        if (that.scoreBoard[f] === 'l')
          p *= 2;
        else if (that.scoreBoard[f] === 'L')
          p *= 3;
        np += p;
        if (that.scoreBoard[f] === 'w')
          np *= 2;
        else if (that.scoreBoard[f] === 'W')
          np *= 3;
        npoints += np;
      }
    }

    if (move.length === 0)
      return 0;
    // Check if sorted.
    for (i = 1; i < move.length; i++)
      assert(move[i].field > move[i - 1].field);
    if (move.length === 1) {
      d = 1;
      calculate_word();
      d = this.ncols2;
      calculate_word();
      return npoints;
    }
    horiz = move[1].field - move[0].field < this.ncols2;
    d = horiz ? 1 : this.ncols2;
    // Calculate points for the main word.
    np = 0;
    ndoublew = 0;
    ntriplew = 0;
    for (i = 0; i < move.length; i++) {
      p = move[i].isblank ? 0
        : this.letterMap[move[i].letter].npoints;
      f = move[i].field;
      if (this.scoreBoard[f] === "l")
        p *= 2;
      else if (this.scoreBoard[f] === "L")
        p *= 3;
      else if (this.scoreBoard[f] === "w")
        ndoublew += 1;
      else if (this.scoreBoard[f] === "W")
        ntriplew += 1;
      np += p;
    }
    f = move[0].field;
    while (board[f - d] > this.empty_field)
      np += this.letterMap[board[f -= d]].npoints;
    f = move[move.length - 1].field;
    while (board[f + d] > this.empty_field)
      np += this.letterMap[board[f += d]].npoints;
    for (f = move[0].field; f < move[move.length - 1].field; f += d)
      if (board[f] > this.empty_field)
        np += this.letterMap[board[f]].npoints;
    while (ndoublew-- > 0)
      np *= 2;
    while (ntriplew-- > 0)
      np *= 3;
    npoints = np;
    // Calculate points for each cross word.
    horiz = !horiz;
    d = horiz ? 1 : this.ncols2;
    calculate_word();
    if (move.length === 7)
      npoints += 50;
    return npoints;
  };

  engine.validateMove = function(rack, board, move) {
    var i, cm, cw, w, state;

    // Check if all tiles used in the move are on the rack.
    function check_rack() {
      var s = rack, i, k, c;
      for (i = 0; i < move.length; i++) {
        c = move[i].isblank ? "?" : move[i].letter;
        k = s.indexOf(c);
        assert(s.indexOf(c) >= 0);
        s = s.replace(c, "");
      }
    }

    check_rack();
    cm = this.checkMove(board, move);
    assert(cm !== this.string_map.move_error);
    if (cm !== "")
      return cm;
    cw = this.checkWords(board, move);
    if (cw.errors.length > 0) {
      w = cw.errors.length > 1 ?
        this.string_map.no_words : this.string_map.no_word;
      i = 0;
      while (i < cw.errors.length)
        w += cw.errors[i].toUpperCase() +
        (++i === cw.errors.length ? "." : ", ");
      return w;
    }
    state = this.makeState(rack, this.mnormal);
    state.tiles = move;
    state.words = cw.words;
    state.board = board.slice(0);
    for (i = 0; i < move.length; i++)
      state.board[move[i].field] = move[i].letter;
    state.points = this.calculatePoints(board, move);
    return state;
  };

  return engine;
}(SKRABULEC.engine || {}));
