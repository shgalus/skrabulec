import {assert, nextPermutation, Comblex} from "./utils.js";

export class Bag {
  constructor(letter_map) {
    var i, j;
    this.b = [];
    for (i in letter_map)
      if (letter_map.hasOwnProperty(i))
        for (j = 0; j < letter_map[i].nitems; j++)
          this.b.push(i);
  }
  shuffle() {
    // Knuth, vol. 2, section 3.4.2, algorithm P.
    var j, k, t;
    j = this.b.length;
    while (j > 1) {
      k = Math.floor(j * Math.random());
      t = this.b[--j];
      this.b[j] = this.b[k];
      this.b[k] = t;
    }
  }
  issue(n) {
    var i, min, s = String();
    if (n < this.b.length) {
      this.shuffle();
      min = n;
    } else
      min = this.b.length;
    for (i = 0; i < min; i++)
      s += this.b.pop();
    return s;
  }
  must_issue(s) {
    var i, k;
    for (i = 0; i < s.length; i++) {
      k = this.b.indexOf(s.charAt(i));
      assert(k !== -1);
      this.b.splice(k, 1);
    }
    return s;
  }
  exchange(s) {
    var i, t = this.issue(s.length);
    for (i = 0; i < s.length; i++)
      this.b.push(s.charAt(i));
    return t;
  }
  size() {
    return this.b.length;
  }
  show() {
    console.log(this.b);
  }
}

const asc0 = "0".charCodeAt(0),
      asca1 = "A".charCodeAt(0) - 1;
const nrows =       15,
      ncols =       15,
      ncols2 =      ncols + 2,
      center =      144,
      outer_field = "\u0000", // String.fromCharCode(0)
      empty_field = " ";
export const scores = String()
      + "W  l   W   l  W"
      + " w   L   L   w "
      + "  w   l l   w  "
      + "l  w   l   w  l"
      + "    w     w    "
      + " L   L   L   L "
      + "  l   l l   l  "
      + "W  l   w   l  W"
      + "  l   l l   l  "
      + " L   L   L   L "
      + "    w     w    "
      + "l  w   l   w  l"
      + "  w   l l   w  "
      + " w   L   L   w "
      + "W  l   W   l  W";
// Kinds of moves.
export
const mnormal =      0,
      mpause =       1,
      mexchange =    2,
      mresignation = 3;
// Kinds of end of game.
export
const eognormal =    0,
      eogpauses =    1,
      eogresignation =  2;

//
// Board for nrows = 3, ncols = 4 (ncols2 = ncols + 2).
//
//            1    2    3    4
//    +----+----+----+----+----+----+
//    |    |    |    |    |    |    |
//    |  0 |  1 |  2 |  3 |  4 |  5 |
//    |    |    |    |    |    |    |
//    +----#####################----+
//    |    #    |    |    |    #    |
//  A |  6 #  7 |  8 |  9 | 10 # 11 | A
//    |    #    |    |    |    #    |
//    +----#----+----+----+----#----+
//    |    #    |    |    |    #    |
//  B | 12 # 13 | 14 | 15 | 16 # 17 | B
//    |    #    |    |    |    #    |
//    +----#----+----+----+----#----+
//    |    #    |    |    |    #    |
//  C | 18 # 19 | 20 | 21 | 22 # 23 | C
//    |    #    |    |    |    #    |
//    +----#####################----+
//    |    |    |    |    |    |    |
//    | 24 | 25 | 26 | 27 | 28 | 29 |
//    |    |    |    |    |    |    |
//    +----+----+----+----+----+----+
//            1    2    3    4
//
// A1 ... A4:     1 * ncols2 + 1 ...     1 * ncols2 + ncols
// B1 ... B4:     2 * ncols2 + 1 ...     2 * ncols2 + ncols
// C1 ... C4: nrows * ncols2 + 1 ... nrows * ncols2 + ncols
//

// Converts integer coordinates to normal coordinates, eg. iToc(144)
// === "H8".
function iToc(n) {
  "use strict";
  var r, c;
  assert(Number.isInteger(n));
  assert(n >= ncols2);
  assert(n < (nrows + 1) * ncols2);
  c = n % ncols2;
  assert(c !== 0 && c !== ncols + 1);
  r = String.fromCharCode(
    Math.floor(n / ncols2) + asca1);
  return r +
    (c >= 10 ?
     String.fromCharCode(asc0 + Math.floor(c / 10))
     + String.fromCharCode(asc0 + c % 10)
     : String.fromCharCode(asc0 + c));
}

// Converts normal coordinates to integer coordinates, eg. cToi("H8")
// === 144. On error returns undefined.
export function cToi(s) {
  "use strict";
  var r, c, d;
  if (typeof s !== "string" ||
      (s.length !== 2 && s.length !== 3))
    return;
  r = s.charCodeAt(0) - asca1;
  if (r < 1 || r > nrows)
    return;
  c = s.charCodeAt(1) - asc0;
  if (c < 1 || c > 9)
    return;
  if (s.length === 3) {
    d = s.charCodeAt(2) - asc0;
    if (d < 0 || d > 9)
      return;
    c = 10 * c + d;
  }
  if (c < 1 || c > ncols)
    return;
  return r * ncols2 + c;
}

export class Move {
  constructor(kind) {
    this.kind = kind;
    if (kind === mnormal)
      this.tiles = [];
    else if (kind === mexchange)
      this.tiles = String();
  }
  add(field, isblank, letter) {
    this.tiles.push({field: field,
                     isblank: isblank,
                     letter: letter});
  }
  sort() {
    this.tiles.sort(
      function(t1, t2) {
        return t1.field - t2.field;
      });
  }
  is_sorted() {
    var i;
    for (i = 1; i < this.tiles.length; i++)
      if (this.tiles[i].field <= this.tiles[i - 1].field)
        return false;
    return true;
  }
  length() {
    return this.tiles.length;
  }
}

export class State {
  constructor(rack, move_kind) {
    this._rack = rack.slice(0);
    this._move_kind = move_kind;
  }
  get rack() {
    return this._rack;
  }
  get move_kind() {
    return this._move_kind;
  }
}

export function printBoard(b) {
  "use strict";
  var i, j,
      k = 0,
      nr2 = nrows + 2,
      nc2 = ncols2,
      s = String();
  assert(b.length === 289);
  for (i = 0; i < nr2; i++) {
    for (j = 0; j < nc2; j++) {
      if (b[k] === outer_field)
        s += "#";
      else if (b[k] === empty_field)
        s += ".";
      else
        s += b[k];
      k++;
    }
    s += "\n";
  }
  return s;
}

export class Engine {
  constructor(conf, dict) {
    function alphabet(letters) {
      var i, a = [];
      for (i = 0; i < letters.length; i++)
        if (letters[i] !== "?")
          a.push(letters[i]);
      return a;
    }
    this.letterMap = conf.letter_map;
    this.string_map = conf.string_map;
    this.dawg = dict;
    this.alphabet = alphabet(Object.keys(this.letterMap));
    // TODO
    // There was
    // prototype.scoreBoard = prototype.initScores();
    // in es5 version.
    this.scoreBoard = this.initScores();
  }

  // TODO: this should be static or plain function.
  initBoard() {
    var
    nr1 = nrows + 1,
    nr2 = nrows + 2,
    nc1 = ncols + 1,
    nc2 = ncols + 2,
    n = nr2 * nc2,
    m = nr1 * nc2,
    b = [],
    i, c;
    for (i = 0; i < n; i++) {
      if (i < nc2 || i >= m)
        b.push(outer_field);
      else {
        c = i % nc2;
        if (c === 0 || c === nc1)
          b.push(outer_field);
        else
          b.push(empty_field);
      }
    }
    return b;
  }

  initScores() {
    var nr1 = nrows + 1,
        nr2 = nrows + 2,
        nc1 = ncols + 1,
        nc2 = ncols + 2,
        n = nr2 * nc2,
        m = nr1 * nc2,
        b = [],
        k = 0,
        i, c;
    for (i = 0; i < n; i++) {
      if (i < nc2 || i >= m)
        b.push(outer_field);
      else {
        c = i % nc2;
        if (c === 0 || c === nc1)
          b.push(outer_field);
        else
          b.push(scores.charAt(k++));
      }
    }
    return b;
  }

  supplementRack(rack, move, bag) {
    var i, c;
    for (i = 0; i < move.length; i++) {
      c = move[i].isblank ? "?" : move[i].letter;
      assert(rack.indexOf(c) >= 0);
      rack = rack.replace(c, "");
    }
    return {
      rack:      rack,
      new_tiles: bag.issue(move.length)
    };
  }

  // Returns true if the word is found in the dictionary or false
  // otherwise.
  wordInDict(word) {
    var node = this.dawg[0],
        wl = word.length,
        next_node, i;
    for (i = 0; i < wl; i++) {
      next_node = node[word.charAt(i)];
      if (next_node === undefined)
        return false;
      node = this.dawg[next_node];
    }
    return node[0] ? true : false;
  }

  query_prefix(prefix) {
    var node = this.dawg[0],
        pl = prefix.length,
        next_node, i;
    for (i = 0; i < pl; i++) {
      next_node = node[prefix.charAt(i)];
      if (next_node === undefined)
        return null;
      node = this.dawg[next_node];
    }
    return node;
  }

  query_postfix(node, postfix) {
    var pl = postfix.length,
        next_node, i;
    for (i = 0; i < pl; i++) {
      next_node = node[postfix.charAt(i)];
      if (next_node === undefined)
        return false;
      node = this.dawg[next_node];
    }
    return node[0] ? true : false;
  }

  // Returns an array of all words of length at least two which can be
  // arranged with given letters and can be found in the dictionary.
  // Some words may appear several times: if letters contain
  // "ccegips", then each word found that contains exactly one letter
  // c appears twice on the list.
  //
  // TODO: https://stackoverflow.com/questions/19676109.
  arrange_letters(letters) {
    var
    n = letters.length,
    low = [],
    c, a, i, k, s;

    for (k = n; k >= 2; k--) {
      c = new Comblex(n, k);
      do {
        a = [];
        for (i = 0; i < k; i++)
          a.push(letters.charAt(c.a[i]));
        a.sort();
        s = "";
        for (i = 0; i < k; i++)
          s += a[i];
        if (this.wordInDict(s))
          low.push(s);
        while (nextPermutation(a)) {
          s = "";
          for (i = 0; i < k; i++)
            s += a[i];
          if (this.wordInDict(s))
            low.push(s);
        }
      } while (c.next());
    }
    return low;
  }

  // TODO: this function may be static or moved out of the class.
  //
  // Returns notation of normal move like this: "K(O)nIE 8H". See
  // https://en.wikibooks.org/wiki/Scrabble/Rules#Notation. The board
  // and move must be previously validated.
  getNotation(board, move) {
    var mll = move.length,
        mw = String(),
        d, f, i, k, ff;

    function one_tile(d) {
      var m = move[0];
      mw = m.isblank ? m.letter : m.letter.toUpperCase();
      f = m.field;
      while (board[f - d] > empty_field)
        mw = "(" + board[f -= d].toUpperCase() + ")" + mw;
      ff = f;
      f = m.field;
      while (board[f + d] > empty_field)
        mw += "(" + board[f += d].toUpperCase() + ")";
    }

    assert(mll > 0);
    if (mll === 1) {
      one_tile(1);
      if (mw.length >= 2) {
        mw += " " + iToc(ff);
        return mw;
      }
      one_tile(ncols2);
      assert(mw.length >= 2);
      ff = iToc(ff);
      ff = ff.substr(1) + ff.substr(0, 1);
      mw += " " + ff;
      return mw;
    }
    d = move[1].field - move[0].field < ncols2 ?
      1 : ncols2;
    f = move[0].field;
    while (board[f - d] > empty_field)
      mw = "(" + board[f -= d].toUpperCase() + ")" + mw;
    ff = f;
    f = move[mll - 1].field;
    i = 0;
    for (k = move[0].field; k <= f; k += d) {
      assert(i < mll);
      if (k === move[i].field) {
        mw += move[i].isblank ?
          move[i].letter : move[i].letter.toUpperCase();
        i++;
      }
      else
        mw += "(" + board[k].toUpperCase() + ")";
    }
    while (board[f + d] > empty_field)
      mw += "(" + board[f += d].toUpperCase() + ")";
    ff = iToc(ff);
    if (d !== 1)
      ff = ff.substr(1) + ff.substr(0, 1);
    mw += " " + ff;
    return mw;
  }

  checkMove(board, move) {
    var i, h, d, f, f1, k,
        l = move.length;
    if (l === 0)
      return this.string_map.set_some_tiles;
    if (l === 1) {
      f = move[0].field;
      if (board[f] !== empty_field)
        return this.string_map.move_error; // tile put on another tile
      if (board[f + 1] > empty_field ||
          board[f + ncols2] > empty_field ||
          board[f - 1] > empty_field ||
          board[f - ncols2] > empty_field)
        return "";
      for (i = 0; i < board.length; i++)
        if (board[i] > empty_field)
          // a tile must be adjacent
          return this.string_map.must_be_cont;
      return this.string_map.first_move;
    }
    h = move[1].field - move[0].field < ncols2;
    f1 = move[0].field;
    if (board[f1] !== empty_field)
      return this.string_map.move_error; // tile put on another tile
    if (h) {
      d = 1;
      k = Math.floor(f1 / ncols2);
      for (i = 1; i < l; i++) {
        f = move[i].field;
        if (f <= f1 ||
            Math.floor(f / ncols2) !== k ||
            board[f] !== empty_field)
          return this.string_map.vert_or_horiz_cont;
        f1 = f;
      }
    } else {
      d = ncols2;
      k = f1 % ncols2;
      for (i = 1; i < l; i++) {
        f = move[i].field;
        if (f <= f1 || f % ncols2 !== k || board[f] !== empty_field)
          return this.string_map.vert_or_horiz_cont;
        f1 = f;
      }
    }
    assert(f1 === move[l - 1].field);
    i = 0;
    for (k = move[0].field; k <= f1; k += d)
      if (board[k] === empty_field)
        if (i >= l || move[i++].field !== k)
          return this.string_map.vert_or_horiz_cont;
    assert(i === l);
    // Check if a tile is adjacent to a tile on the board.
    for (i = 0; i < l; i++) {
      f = move[i].field;
      if (board[f + 1] > empty_field ||
          board[f + ncols2] > empty_field ||
          board[f - 1] > empty_field ||
          board[f - ncols2] > empty_field) {
        return "";
      }
    }
    for (i = 0; i < board.length; i++)
      if (board[i] > empty_field)
        return this.string_map.must_be_cont; // must be adjacent
    for (i = 0; i < l; i++)
      if (move[i].field === center)
        return "";
    return this.string_map.first_move;
  }

  checkWords(board, move) {
    var i, k, h, d, f, w,
        that = this,
        words = [],
        l = move.length,
        err = [];

    function check_word() {
      f = move[i].field;
      w = move[i].letter;
      while (board[f - d] > empty_field)
        w = board[f -= d] + w;
      f = move[i].field;
      while (board[f + d] > empty_field)
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
      d = ncols2;
      check_word();
      return {
        words: words,
        errors: err
      };
    }
    h = move[1].field - move[0].field < ncols2;
    d = h ? 1 : ncols2;
    // Check main word.
    w = String();
    f = move[0].field;
    while (board[f - d] > empty_field)
      w = board[f -= d] + w;
    f = move[l - 1].field;
    i = 0;
    for (k = move[0].field; k <= f; k += d) {
      if (board[k] === empty_field)
        w += move[i++].letter;
      else
        w += board[k];
    }
    while (board[f + d] > empty_field)
      w += board[f += d];
    if (this.wordInDict(w))
      words.push(w);
    else
      err.push(w);
    // Check each cross word.
    h = !h;
    d = h ? 1 : ncols2;
    for (i = 0; i < move.length; i++)
      check_word();
    return {
      words: words,
      errors: err
    };
  }

  // Given board and move, calculates points for this move. The
  // function in no way checks if the move is correct. The move is in
  // the form:
  //
  // [
  //  {field: cToi("H7"), isblank: false, letter: "b"},
  //  {field: cToi("H8"), isblank: true,  letter: "o"},
  //  {field: cToi("H9"), isblank: false, letter: "y"}
  // ]
  //
  // but the fields may not be sorted.
  //
  calculatePoints(board, move) {
    var npoints = 0,
        that = this,
        horiz, d, i, f, np, p, ndoublew, ntriplew;

    function calculate_word() {
      for (i = 0; i < move.length; i++) {
        f = move[i].field;
        np = 0;
        while (board[f - d] > empty_field)
          np += that.letterMap[board[f -= d]].npoints;
        f = move[i].field;
        while (board[f + d] > empty_field)
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
      d = ncols2;
      calculate_word();
      return npoints;
    }
    horiz = move[1].field - move[0].field < ncols2;
    d = horiz ? 1 : ncols2;
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
    while (board[f - d] > empty_field)
      np += this.letterMap[board[f -= d]].npoints;
    f = move[move.length - 1].field;
    while (board[f + d] > empty_field)
      np += this.letterMap[board[f += d]].npoints;
    for (f = move[0].field; f < move[move.length - 1].field; f += d)
      if (board[f] > empty_field)
        np += this.letterMap[board[f]].npoints;
    while (ndoublew-- > 0)
      np *= 2;
    while (ntriplew-- > 0)
      np *= 3;
    npoints = np;
    // Calculate points for each cross word.
    horiz = !horiz;
    d = horiz ? 1 : ncols2;
    calculate_word();
    if (move.length === 7)
      npoints += 50;
    return npoints;
  }

  validateMove(rack, board, move) {
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
    state = new State(rack, this.mnormal);
    state.tiles = move;
    state.words = cw.words;
    state.board = board.slice(0);
    for (i = 0; i < move.length; i++)
      state.board[move[i].field] = move[i].letter;
    state.points = this.calculatePoints(board, move);
    return state;
  }

  //*** Generating moves.

  // Explanation of anchors and cross-checks.
  //
  //    123456789012345
  //   #################
  // A #...............#
  // B #...............#
  // C #...............#
  // D #...............#
  // E #.......h.......#
  // F #......vXv......#
  // G #.....hbXbh.....#
  // H #....vXXXXXv....#
  // I #.....hbXbh.....#
  // J #......vXv......#
  // K #.......h.......#
  // L #...............#
  // M #...............#
  // N #...............#
  // O #...............#
  //   #################
  //
  // X - filled field, h - non-trivial horizontal cross-check, v -
  // non-trivial vertical cross-check, b - non-trivial horizontal and
  // vertical cross-checks (both). The fields marked with h, v or b
  // are anchors for both horizontal and vertical moves. Trivial
  // cross-check means that all letters are allowed. Fields marked
  // with a dot have trivial cross-checks.

  // TODO: this method may be static or function.
  board_empty(board) {
    var i;
    for (i = 0; i < board.length; i++)
      if (board[i] > empty_field)
        return false;
    return true;
  }

  calculate_simple_points(word) {
    var i, s = 0;
    for (i = 0; i < word.length; i++)
      s += this.letterMap[word.charAt(i)].npoints;
    return s;
  }

  generate_first_move(board, rack) {
    var i, low, state, mv, cw, k, np, maxp;
    low = this.arrange_letters(rack);
    if (low.length === 0) {
      state = new State(rack, mpause);
      state.board = board.slice(0);
      return state;
    }
    maxp = -1;
    k = -1;
    for (i = 0; i < low.length; i++) {
      np = this.calculate_simple_points(low[i]);
      if (np > maxp) {
        maxp = np;
        k = i;
      }
    }
    assert(k >= 0);
    mv = new Move(mnormal);
    for (i = 0; i < low[k].length; i++)
      mv.add(this.center + i, false, low[k].charAt(i));
    assert(this.checkMove(board, mv.tiles) === "");
    cw = this.checkWords(board, mv.tiles);
    assert(cw.errors.length === 0);
    state = new State(rack, mnormal);
    state.tiles = mv.tiles;
    state.words = cw.words;
    state.board = board.slice(0);
    for (i = 0; i < mv.tiles.length; i++)
      state.board[mv.tiles[i].field] = mv.tiles[i].letter;
    state.points = this.calculatePoints(board, mv.tiles);
    return state;
  }

  //
  // hc[i].length === 0 for fields out of the board and for filled
  // fields
  //
  // hc[i].length === 0 for empty fields on the board with really
  // empty cross-checks
  //
  // The same is about vc[i].
  //
  generate_crosschecks_from_scratch(board) {
    var that = this,
        hc = [],
        vc = [],
        k;

    // Generates cross-checks for empty field on the board. For d =
    // ncols2 generates horizontal cross-checks, for d = 1 generates
    // vertical cross-checks.
    function generate(d) {
      var t = [],
          prefix, suffix, node0, i;
      prefix = "";
      i = k;
      while (board[i - d] > empty_field)
        prefix = board[i -= d] + prefix;
      suffix = "";
      i = k;
      while (board[i + d] > empty_field)
        suffix += board[i += d];
      if (prefix.length === 0 && suffix.length === 0)
        t = that.alphabet.slice();
      else {
        node0 = that.query_prefix(prefix);
        if (node0 !== null)
          for (i = 0; i < that.alphabet.length; i++)
            if (that.query_postfix(node0, that.alphabet[i] + suffix))
              t.push(that.alphabet[i]);
      }
      return t;
    }

    for (k = 0; k < board.length; k++) {
      if (board[k] === outer_field || board[k] > empty_field) {
        hc.push([]);
        vc.push([]);
        continue;
      }
      hc.push(generate(ncols2));
      vc.push(generate(1));
    }
    return {
      hc: hc,
      vc: vc
    };
  }

  // board - current board,
  // rack - current rack,
  // field - start field,
  // word - word to arrange
  // letters - letters remaining on rack
  // d - direction (1 = horizontal, prototype.ncols2 = vertical)
  // tab - a table to collect moves
  legal_move(board, rack, field, word, letters, d, tab) {
    var i, c, f, m,
        u, // letters from rack used in the word
        state,
        s;
    var re = new RegExp('\\)\\(', 'g');

    assert(letters.length < rack.length);
    u = rack;
    for (i = 0; i < letters.length; i++) {
      c = letters.charAt(i);
      assert(u.indexOf(c) >= 0);
      u = u.replace(c, "");
    }
    assert(u.length + letters.length === rack.length);
    f = field;
    m = new Move(mnormal);
    for (i = 0; i < word.length; i++) {
      c = word.charAt(i);
      if (board[f] > empty_field)
        assert(board[f] === c);
      else {
        assert(board[f] === empty_field);
        assert(u.indexOf(c) >= 0);
        u = u.replace(c, "");
        m.add(f, false, c);
      }
      f += d;
    }
    assert(m.is_sorted());
    // assert(this.checkMove(board, m.tiles) === "");
    state = this.validateMove(rack, board, m.tiles);
    assert(typeof state !== "string");
    s = this.getNotation(board, m.tiles);
    s = s.replace(re, "");
    // console.log(s + ": " + state.points);
    tab.push([s, state.points, m.tiles, state.words]);
  }

  generate_move(board, rack, cc) {
    var that = this,
        hc = cc.hc,
        vc = cc.vc,
        rl1 = rack.length - 1,
        rack0 = rack,
        AnchorField, d,
        sf,
        tab = []; // to collect moves

    function isanchor(k) {
      if (board[k] !== empty_field)
        return false;
      return board[k - 1] > empty_field ||
        board[k + 1] > empty_field ||
        board[k - ncols2] > empty_field ||
        board[k + ncols2] > empty_field;
    }

    function LeftPart(PartialWord, N, limit) {
      var letter;
      ExtendRight(PartialWord, N, AnchorField);
      if (limit > 0) {
        for (letter in N)
          if (rack.indexOf(letter) >= 0) {
            rack = rack.replace(letter, "");
            sf -= d;
            LeftPart(PartialWord + letter,
                     that.dawg[N[letter]],
                     limit - 1);
            rack += letter;
            sf += d;
          }
      }
    }

    function letter_in_cross_check_set(letter, field) {
      var i;
      var ccs = d === 1 ? hc[field] : vc[field];
      for (i = 0; i < ccs.length; i++)
        if (letter === ccs[i])
          return true;
      return false;
    }

    function ExtendRight(PartialWord, N, field) {
      var letter;
      if (board[field] === empty_field) {
        if (field !== AnchorField)
          if (N[0])
            that.legal_move(board, rack0, sf, PartialWord,
                            rack, d, tab);
        for (letter in N) {
          if (rack.indexOf(letter) >= 0 &&
              letter_in_cross_check_set(letter, field)) {
            rack = rack.replace(letter, "");
            ExtendRight(PartialWord + letter,
                        that.dawg[N[letter]],
                        field + d);
            rack += letter;
          }
        }
      } else if (board[field] > empty_field) {
        letter = board[field];
        if (N[letter] !== undefined)
          ExtendRight(PartialWord + letter,
                      that.dawg[N[letter]],
                      field + d);
      }
    }

    function generate(k) {
      var l1 = rl1,
          i = k,
          PartialWord = "",
          lim = 0,
          node;
      sf = k; // === AnchorField
      while (board[i - d] > empty_field) {
        PartialWord = board[i -= d] + PartialWord;
        sf -= d;
      }
      if (PartialWord.length === 0)
        for (;;) {
          if (l1 === 0)
            break;
          i -= d;
          if (board[i] === outer_field)
            break;
          if (isanchor(i))
            break;
          lim++;
          l1--;
        }
      if ((node = that.query_prefix(PartialWord)) === null)
        return;

      LeftPart(PartialWord, node, lim);
    }

    assert(rack.length > 0);

    for (AnchorField = 0; AnchorField < board.length; AnchorField++) {
      if (!isanchor(AnchorField))
        continue;
      d = 1;
      if (hc[AnchorField].length > 0)
        generate(AnchorField);
      d = ncols2;
      if (vc[AnchorField].length > 0)
        generate(AnchorField);
    }
    tab.sort(function(a, b) {return b[1] - a[1];});
    // console.log(tab);
    return tab;
  }

  generateMove2(board, rack) {
    var cc, tab, state, state2, i, min, t;

    if (this.board_empty(board))
      return this.generate_first_move(board, rack);

    cc = this.generate_crosschecks_from_scratch(board);
    tab = this.generate_move(board, rack, cc);

    console.log("" + tab.length + " moves found.");
    if (tab.length === 0) {
      state = new State(rack, mpause);
      state.board = board.slice(0);
      return state;
    }
    state = new State(rack, mnormal);
    state.tiles = tab[0][2];
    state.words = tab[0][3];
    state.board = board.slice(0);
    for (i = 0; i < state.tiles.length; i++)
      state.board[state.tiles[i].field] = state.tiles[i].letter;
    state.points = tab[0][1];

    // If there is a blank tile on the rack, force the use of it
    // instead of the letter with lowest number of points.
    for (i = 0; i < rack.length; i++)
      if (rack.charAt(i) === "?")
        break;
    if (i >= rack.length)
      return state;
    min = 100;
    t = -1;
    for (i = 0; i < state.tiles.length; i++)
      if (this.letterMap[state.tiles[i].letter].npoints < min) {
        t = i;
        min = this.letterMap[state.tiles[i].letter].npoints;
      }
    assert(t >= 0);
    state.tiles[t].isblank = true;
    state2 = this.validateMove(rack, board, state.tiles);
    assert(typeof state2 !== "string");
    return state2;
  }
}
