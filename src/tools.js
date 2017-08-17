SKRABULEC.engine = (function(engine) {
  "use strict";

  var assert = SKRABULEC.utils.assert,
      bagPrototype = {},
      movePrototype = {},
      asc0 = "0".charCodeAt(0),
      asca1 = "A".charCodeAt(0) - 1;

  engine.initModule = function(config, dict) {
    engine.letterMap = config.letter_map;
    engine.string_map = config.string_map;
    engine.dawg = dict;
  };

  engine.nrows =       15;
  engine.ncols =       15;
  engine.ncols2 =      engine.ncols + 2;
  engine.center =      144;
  engine.outer_field = "\u0000"; // String.fromCharCode(0)
  engine.empty_field = " ";
  engine.scores = String()
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
  engine.mnormal =      0;
  engine.mpause =       1;
  engine.mexchange =    2;
  engine.mresignation = 3;
  
  // Kinds of end of game.
  engine.eognormal =    0;
  engine.eogpauses =    1;
  engine.eogresignation =  2;
  
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
  engine.iToc = function(n) {
    var r, c;
    assert(Number.isInteger(n));
    assert(n >= this.ncols2);
    assert(n < (this.nrows + 1) * this.ncols2);
    c = n % this.ncols2;
    assert(c !== 0 && c !== this.ncols + 1);
    r = String.fromCharCode(
      Math.floor(n / this.ncols2) + asca1);
    return r +
      (c >= 10 ?
       String.fromCharCode(asc0 + Math.floor(c / 10))
       + String.fromCharCode(asc0 + c % 10)
       : String.fromCharCode(asc0 + c));
  };

  // Converts normal coordinates to integer coordinates, eg.
  // cToi("H8") === 144. On error returns undefined.
  engine.cToi = function(s) {
    var r, c, d;
    if (typeof s !== "string" ||
        (s.length !== 2 && s.length !== 3))
      return;
    r = s.charCodeAt(0) - asca1;
    if (r < 1 || r > this.nrows)
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
    if (c < 1 || c > this.ncols)
      return;
    return r * this.ncols2 + c;
  };

  engine.initBoard = function() {
    var
    nr1 = this.nrows + 1,
    nr2 = this.nrows + 2,
    nc1 = this.ncols + 1,
    nc2 = this.ncols + 2,
    n = nr2 * nc2,
    m = nr1 * nc2,
    b = [],
    i, c;

    for (i = 0; i < n; i++) {
      if (i < nc2 || i >= m)
        b.push(this.outer_field);
      else {
        c = i % nc2;
        if (c === 0 || c === nc1)
          b.push(this.outer_field);
        else
          b.push(this.empty_field);
      }
    }
    return b;
  };

  engine.initScores = function() {
    var nr1 = this.nrows + 1,
        nr2 = this.nrows + 2,
        nc1 = this.ncols + 1,
        nc2 = this.ncols + 2,
        n = nr2 * nc2,
        m = nr1 * nc2,
        b = [],
        k = 0,
        i, c;
    for (i = 0; i < n; i++) {
      if (i < nc2 || i >= m)
        b.push(this.outer_field);
      else {
        c = i % nc2;
        if (c === 0 || c === nc1)
          b.push(this.outer_field);
        else
          b.push(this.scores.charAt(k++));
      }
    }
    return b;
  };

  engine.scoreBoard = engine.initScores();

  bagPrototype.shuffle = function() {
    // Knuth, vol. 2, section 3.4.2, algorithm P.
    var j, k, t;
    j = this.b.length;
    while (j > 1) {
      k = Math.floor(j * Math.random());
      t = this.b[--j];
      this.b[j] = this.b[k];
      this.b[k] = t;
    }
  };

  bagPrototype.issue = function(n) {
    var i, min, s = String();
    if (n < this.b.length) {
      this.shuffle();
      min = n;
    } else
      min = this.b.length;
    for (i = 0; i < min; i++)
      s += this.b.pop();
    return s;
  };

  bagPrototype.must_issue = function(s) {
    var i, k;
    for (i = 0; i < s.length; i++) {
      k = this.b.indexOf(s.charAt(i));
      assert(k !== -1);
      this.b.splice(k, 1);
    }
    return s;
  };

  bagPrototype.exchange = function(s) {
    var i, t = this.issue(s.length);
    for (i = 0; i < s.length; i++)
      this.b.push(s.charAt(i));
    return t;
  };
  
  bagPrototype.size = function() {
    return this.b.length;
  };
  
  bagPrototype.show = function() {
    console.log(this.b);
  };

  engine.makeBag = function() {
    var i, j,
        b = Object.create(bagPrototype);
    b.b = [];
    for (i in this.letterMap)
      if (this.letterMap.hasOwnProperty(i))
        for (j = 0; j < this.letterMap[i].nitems; j++)
          b.b.push(i);
    return b;
  };

  movePrototype.add = function(field, isblank, letter) {
    this.tiles.push({field: field,
                     isblank: isblank,
                     letter: letter});
  };

  movePrototype.sort = function() {
    this.tiles.sort(
      function(t1, t2) {
        return t1.field - t2.field;
      });
  };

  movePrototype.is_sorted = function() {
    var i;
    for (i = 1; i < this.tiles.length; i++)
      if (this.tiles[i].field <= this.tiles[i - 1].field)
        return false;
    return true;
  };
  
  movePrototype.length = function() {
    return this.tiles.length;
  };

  engine.makeMove = function(kind) {
    var move = Object.create(movePrototype);
    move.kind = kind;
    if (kind === this.mnormal)
      move.tiles = [];
    else if (kind === this.mexchange)
      move.tiles = String();
    return move;
  };
  
  engine.makeState = function(rack, move_kind) {
    var state = {};
    state.rack = rack.slice(0);
    state.move_kind = move_kind;
    return state;
  };

  engine.supplementRack = function(rack, move, bag) {
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
  };

  engine.printBoard = function(b) {
    var i, j,
        k = 0,
        nr2 = this.nrows + 2,
        nc2 = this.ncols2,
        s = String();
    assert(b.length === 289);
    for (i = 0; i < nr2; i++) {
      for (j = 0; j < nc2; j++) {
        if (b[k] === this.outer_field)
          s += "#";
        else if (b[k] === this.empty_field)
          s += ".";
        else
          s += b[k];
        k++;
      }
      s += "\n";
    }
    return s;
  };

  // Returns true if the word is found in the dictionary or false
  // otherwise.
  engine.wordInDict = function(word) {
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
  };

  engine.query_prefix = function(prefix) {
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
  };

  engine.query_postfix = function(node, postfix) {
    var pl = postfix.length,
        next_node, i;
    for (i = 0; i < pl; i++) {
      next_node = node[postfix.charAt(i)];
      if (next_node === undefined)
        return false;
      node = this.dawg[next_node];
    }
    return node[0] ? true : false;
  };

  // Returns an array of all words of length at least two which can be
  // arranged with given letters and can be found in the dictionary.
  // Some words may appear several times: if letters contain
  // "ccegips", then each word found that contains exactly one letter
  // c appears twice on the list.
  //
  // TODO: https://stackoverflow.com/questions/19676109.
  engine.arrange_letters = function(letters) {
    var
    n = letters.length,
    low = [],
    c, a, i, k, s;

    for (k = n; k >= 2; k--) {
      c = SKRABULEC.utils.makeComblex(n, k);
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
        while (SKRABULEC.utils.nextPermutation(a)) {
          s = "";
          for (i = 0; i < k; i++)
            s += a[i];
          if (this.wordInDict(s))
            low.push(s);
        }
      } while (c.next());
    }
    return low;
  };

  // Returns notation of normal move like this: "K(O)nIE 8H". See
  // https://en.wikibooks.org/wiki/Scrabble/Rules#Notation. The board
  // and move must be previously validated.
  engine.getNotation = function(board, move) {
    var mll = move.length,
        mw = String(),
        that = this,
        d, f, i, k, ff;

    function one_tile(d) {
      var m = move[0];
      mw = m.isblank ? m.letter : m.letter.toUpperCase();
      f = m.field;
      while (board[f - d] > that.empty_field)
        mw = "(" + board[f -= d].toUpperCase() + ")" + mw;
      ff = f;
      f = m.field;
      while (board[f + d] > that.empty_field)
        mw += "(" + board[f += d].toUpperCase() + ")";
    }

    assert(mll > 0);
    if (mll === 1) {
      one_tile(1);
      if (mw.length >= 2) {
        mw += " " + this.iToc(ff);
        return mw;
      }
      one_tile(this.ncols2);
      assert(mw.length >= 2);
      ff = this.iToc(ff);
      ff = ff.substr(1) + ff.substr(0, 1);
      mw += " " + ff;
      return mw;
    }
    d = move[1].field - move[0].field < this.ncols2 ?
      1 : this.ncols2;
    f = move[0].field;
    while (board[f - d] > this.empty_field)
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
    while (board[f + d] > this.empty_field)
      mw += "(" + board[f += d].toUpperCase() + ")";
    ff = this.iToc(ff);
    if (d !== 1)
      ff = ff.substr(1) + ff.substr(0, 1);
    mw += " " + ff;
    return mw;
  };

  return engine;
}(SKRABULEC.engine || {}));
