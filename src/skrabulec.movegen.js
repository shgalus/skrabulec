SKRABULEC.engine.prototype = (function(prototype) {
  "use strict";

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

  var assert = SKRABULEC.utils.assert,
      alphabet = ["a", "ą", "b", "c", "ć", "d", "e", "ę",
                  "f", "g", "h", "i", "j", "k", "l", "ł",
                  "m", "n", "ń", "o", "ó", "p", "r", "s",
                  "ś", "t", "u", "w", "y", "z", "ź", "ż"],
      boardEmpty;

  boardEmpty = function(board) {
    var i;
    for (i = 0; i < board.length; i++)
      if (board[i] > prototype.empty_field)
        return false;
    return true;
  };

  prototype.calculate_simple_points = function(word) {
    var i, s = 0;
    for (i = 0; i < word.length; i++)
      s += this.letterMap[word.charAt(i)].npoints;
    return s;
  };

  prototype.generate_first_move = function(board, rack) {
    var i, low, state, mv, cw, k, np, maxp;
    low = this.arrange_letters(rack);
    if (low.length === 0) {
      state = this.makeState(rack, this.mpause);
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
    mv = this.makeMove(this.mnormal);
    for (i = 0; i < low[k].length; i++)
      mv.add(this.center + i, false, low[k].charAt(i));
    assert(this.checkMove(board, mv.tiles) === "");
    cw = this.checkWords(board, mv.tiles);
    assert(cw.errors.length === 0);
    state = this.makeState(rack, this.mnormal);
    state.tiles = mv.tiles;
    state.words = cw.words;
    state.board = board.slice(0);
    for (i = 0; i < mv.tiles.length; i++)
      state.board[mv.tiles[i].field] = mv.tiles[i].letter;
    state.points = this.calculatePoints(board, mv.tiles);
    return state;
  };

  //
  // hc[i].length === 0 for fields out of the board and for filled
  // fields
  //
  // hc[i].length === 0 for empty fields on the board with really
  // empty cross-checks
  //
  // The same is about vc[i].
  //
  prototype.generate_crosschecks_from_scratch = function(board) {
    var that = this,
        hc = [],
        vc = [],
        k;

    // Generates cross-checks for empty field on the board. For d =
    // prototype.ncols2 generates horizontal cross-checks, for d = 1
    // generates vertical cross-checks.
    function generate(d) {
      var t = [],
          prefix, suffix, node0, i;
      prefix = "";
      i = k;
      while (board[i - d] > that.empty_field)
        prefix = board[i -= d] + prefix;
      suffix = "";
      i = k;
      while (board[i + d] > that.empty_field)
        suffix += board[i += d];
      if (prefix.length === 0 && suffix.length === 0)
        t = alphabet.slice();
      else {
        node0 = that.query_prefix(prefix);
        if (node0 !== null)
          for (i = 0; i < alphabet.length; i++)
            if (that.query_postfix(node0, alphabet[i] + suffix))
              t.push(alphabet[i]);
      }
      return t;
    }

    for (k = 0; k < board.length; k++) {
      if (board[k] === this.outer_field ||
          board[k] > this.empty_field) {
        hc.push([]);
        vc.push([]);
        continue;
      }
      hc.push(generate(this.ncols2));
      vc.push(generate(1));
    }
    return {
      hc: hc,
      vc: vc
    };
  };

  // board - current board,
  // rack - current rack,
  // field - start field,
  // word - word to arrange
  // letters - letters remaining on rack
  // d - direction (1 = horizontal, prototype.ncols2 = vertical)
  // tab - a table to collect moves
  prototype.legal_move = function(board, rack, field, word,
                                  letters, d, tab) {
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
    m = this.makeMove(this.mnormal);
    for (i = 0; i < word.length; i++) {
      c = word.charAt(i);
      if (board[f] > this.empty_field)
        assert(board[f] === c);
      else {
        assert(board[f] === this.empty_field);
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
  };

  prototype.generate_move = function(board, rack, cc) {
    var that = this,
        hc = cc.hc,
        vc = cc.vc,
        rl1 = rack.length - 1,
        rack0 = rack,
        AnchorField, d,
        sf,
        tab = []; // to collect moves

    function isanchor(k) {
      if (board[k] !== that.empty_field)
        return false;
      return board[k - 1] > that.empty_field ||
        board[k + 1] > that.empty_field ||
        board[k - that.ncols2] > that.empty_field ||
        board[k + that.ncols2] > that.empty_field;
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
      if (board[field] === that.empty_field) {
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
      } else if (board[field] > that.empty_field) {
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
      while (board[i - d] > that.empty_field) {
        PartialWord = board[i -= d] + PartialWord;
        sf -= d;
      }
      if (PartialWord.length === 0)
        for (;;) {
          if (l1 === 0)
            break;
          i -= d;
          if (board[i] === that.outer_field)
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
      d = this.ncols2;
      if (vc[AnchorField].length > 0)
        generate(AnchorField);
    }
    tab.sort(function(a, b) {return b[1] - a[1];});
    // console.log(tab);
    return tab;
  };

  prototype.generateMove2 = function(board, rack) {
    var cc, tab, state, state2, i, min, t;

    if (boardEmpty(board))
      return this.generate_first_move(board, rack);

    cc = this.generate_crosschecks_from_scratch(board);
    tab = this.generate_move(board, rack, cc);

    console.log("" + tab.length + " moves found.");
    if (tab.length === 0) {
      state = this.makeState(rack, this.mpause);
      state.board = board.slice(0);
      return state;
    }
    state = this.makeState(rack, this.mnormal);
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
  };

  return prototype;
}(SKRABULEC.engine.prototype || {}));

SKRABULEC.engine.make_engine = function(conf, dict) {
  "use strict";
  var engine = Object.create(SKRABULEC.engine.prototype);
  engine.letterMap = conf.letter_map;
  engine.string_map = conf.string_map;
  engine.dawg = dict;
  return engine;
};
