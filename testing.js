import {assert, nextPermutation, Comblex} from "./utils.js";
import {Bag, Engine, ctoi, printBoard} from "./engine.js";
import {configMap as config_map_pl} from "./confpl.js";

var assertArrEq, testMoveGen, generateRecord, testEngine,
    testNextPermutation, testComblex, doAllTests;

assertArrEq = function(a, b) {
  "use strict";
  var i;
  assert(a.length === b.length);
  for (i = 0; i < a.length; i++)
    assert(a[i] === b[i]);
};

// Generates a record of a game for testing. Copy the resulting array
// from console - see record1. The game must consist with normal moves
// only.
generateRecord = function() {
  "use strict";
  var dictpl = window.SKRABULEC.dict.pl;
  var engine = new Engine(config_map_pl, dictpl),
      board, bag, plr_rack, opp_rack, state, s, p;
  board = engine.initBoard();
  bag = new Bag(config_map_pl.letter_map);
  plr_rack = bag.issue(7);
  opp_rack = bag.issue(7);
  for (;;) {
    state = engine.generateMove2(board, plr_rack);
    p = '["' + plr_rack
      + '", "' + engine.getNotation(state.board, state.tiles)
      + '", ' + state.points + ', "';
    board = state.board.slice(0);
    s = engine.supplementRack(plr_rack, state.tiles, bag);
    p += s.new_tiles + '"],';
    console.log(p);
    plr_rack = s.rack + s.new_tiles;
    if (plr_rack === "")
      break;
    state = engine.generateMove2(board, opp_rack);
    p = '["' + opp_rack
      + '", "' + engine.getNotation(state.board, state.tiles)
      + '", ' + state.points + ', "';
    board = state.board.slice(0);
    s = engine.supplementRack(opp_rack, state.tiles, bag);
    p += s.new_tiles + '"],';
    console.log(p);
    opp_rack = s.rack + s.new_tiles;
    if (opp_rack === "")
      break;
  }
};

const record1 = [
  ["weakśot", "KTOŚ H8", 20, "cićr"],
  ["pńoozha", "O(K)OPAŃ 8G", 21, "dwybc"],
  ["weacićr", "(Ś)CIERAĆ 11H", 34, "hebtme"],
  ["zhdwybc", "ZDYB F7", 30, "kgji"],
  ["whebtme", "BE(A)TEM M9", 26, "yrrji"],
  ["hwckgji", "KICH(A)J K4", 24, "spzzi"],
  ["whyrrji", "RWIJ(M)Y 14I", 24, "cęnfd"],
  ["wgspzzi", "WI(Z)G 7D", 16, "łłr"],
  ["hrcęnfd", "(C)HCĘ 6K", 22, "aon"],
  ["spzzłłr", "PŁ(O)SZ(C)Z I6", 21, "szdta"],
  ["rnfdaon", "FADO L1", 34, "seun"],
  ["łrszdta", "SZAR(F) 1H", 27, "ugla"],
  ["rnnseun", "RENU 8A", 34, "na?a"],
  ["łdtugla", "GADUŁ(Ę) N1", 34, "wzp?i"],
  ["nsnna?a", "sANN(Y) 9B", 15, "ioon"],
  ["tlwzp?i", "Li J5", 19, "am"],
  ["snaioon", "NASIONO 15C", 76, "elelymź"],
  ["twzpiam", "WITAM 14B", 36, "skwżó"],
  ["elelymź", "ŹLE 2F", 32, "ąay"],
  ["zpskwżó", "KÓP 13A", 32, "iie"],
  ["elymąay", "MĄ 15K", 28, ""],
  ["zswżiie", "Ż(R)E L10", 26, ""],
  ["elyay", "LE(C) M4", 17, ""],
  ["zswii", "WIS H4", 20, ""],
  ["yay", "(E)(S)Y B8", 8, ""],
  ["zi", "(L)(E)(C)I M4", 7, ""],
  ["ay", "(W)(U)(N)Y D7", 7, ""],
  ["z", "(E)Z K11", 6, ""]
];

testEngine = function() {
  "use strict";
  var dictpl = window.SKRABULEC.dict.pl;
  var engine = new Engine(config_map_pl, dictpl),
      board, bag, rack, plr_rack, opp_rack, state, s;
  board = engine.initBoard();
  bag = new Bag(config_map_pl.letter_map);
  plr_rack = bag.must_issue(record1[0][0]);
  opp_rack = bag.must_issue(record1[1][0]);
  for (let i = 0; i < record1.length; i++) {
    if (i % 2 === 0)
      rack = plr_rack;
    else
      rack = opp_rack;
    assert(rack === record1[i][0]);
    state = engine.generateMove2(board, rack);
    board = state.board.slice(0);
    assert(engine.getNotation(state.board, state.tiles) ===
           record1[i][1]);
    assert(state.points === record1[i][2]);
    s = engine.mustSupplementRack(
      rack, state.tiles, bag, record1[i][3]);
    if (i % 2 === 0)
      plr_rack = s.rack + s.new_tiles;
    else
      opp_rack = s.rack + s.new_tiles;
  }
  assert(plr_rack === "a");
  assert(opp_rack === "");
};

testMoveGen = function() {
  "use strict";
  var dictpl = window.SKRABULEC.dict.pl;
  var engine = new Engine(config_map_pl, dictpl),
      board, rack, state;

  board = engine.initBoard();
  board[ctoi("F8")] = "m";
  board[ctoi("G8")] = "a";
  board[ctoi("H8")] = "t";
  board[ctoi("I8")] = "k";
  board[ctoi("J8")] = "a";
  board[ctoi("H6")] = "k";
  board[ctoi("H7")] = "i";
  board[ctoi("H9")] = "k";
  board[ctoi("H10")] = "a";
  console.log(printBoard(board));
  rack = "kółkorf";
  console.log("Rack: " + rack);
  state = engine.generateMove2(board, rack);
  console.log(state);
};

testNextPermutation = function() {
  "use strict";
  const np = nextPermutation;
  var a;

  a = [];
  assert(np(a) === false);
  assert(a.length === 0);

  a = [0];
  assert(np(a) === false);
  assertArrEq(a, [0]);

  a = [0, 1];
  assert(np(a) === true);
  assertArrEq(a, [1, 0]);
  assert(np(a) === false);
  assertArrEq(a, [0, 1]);

  a = [0, 0];
  assert(np(a) === false);
  assertArrEq(a, [0, 0]);

  a = ['a', 'b', 'c'];
  assert(np(a) === true);
  assertArrEq(a, ['a', 'c', 'b']);
  assert(np(a) === true);
  assertArrEq(a, ['b', 'a', 'c']);
  assert(np(a) === true);
  assertArrEq(a, ['b', 'c', 'a']);
  assert(np(a) === true);
  assertArrEq(a, ['c', 'a', 'b']);
  assert(np(a) === true);
  assertArrEq(a, ['c', 'b', 'a']);
  assert(np(a) === false);
  assertArrEq(a, ['a', 'b', 'c']);

  a = ['a', 'b', 'b'];
  assert(np(a) === true);
  assertArrEq(a, ['b', 'a', 'b']);
  assert(np(a) === true);
  assertArrEq(a, ['b', 'b', 'a']);
  assert(np(a) === false);
  assertArrEq(a, ['a', 'b', 'b']);
};

testComblex = function() {
  "use strict";
  var c, ok;

  c = new Comblex(4, 1);
  assertArrEq(c.a, [0]);
  assert(c.next() === true);
  assertArrEq(c.a, [1]);
  assert(c.next() === true);
  assertArrEq(c.a, [2]);
  assert(c.next() === true);
  assertArrEq(c.a, [3]);
  assert(c.next() === false);

  c = new Comblex(4, 2);
  assertArrEq(c.a, [0, 1]);
  assert(c.next() === true);
  assertArrEq(c.a, [0, 2]);
  assert(c.next() === true);
  assertArrEq(c.a, [0, 3]);
  assert(c.next() === true);
  assertArrEq(c.a, [1, 2]);
  assert(c.next() === true);
  assertArrEq(c.a, [1, 3]);
  assert(c.next() === true);
  assertArrEq(c.a, [2, 3]);
  assert(c.next() === false);

  c = new Comblex(4, 3);
  assertArrEq(c.a, [0, 1, 2]);
  assert(c.next() === true);
  assertArrEq(c.a, [0, 1, 3]);
  assert(c.next() === true);
  assertArrEq(c.a, [0, 2, 3]);
  assert(c.next() === true);
  assertArrEq(c.a, [1, 2, 3]);
  assert(c.next() === false);

  c = new Comblex(4, 4);
  assertArrEq(c.a, [0, 1, 2, 3]);
  assert(c.next() === false);

  ok = true;
  try {
    c = new Comblex(4, 5);
    ok = false;
  } catch (e) {}
  assert(ok);
};

doAllTests = function() {
  "use strict";
  testNextPermutation();
  testComblex();
  // testMoveGen();
  // generateRecord();
  testEngine();
};

doAllTests();   // TODO: remove this.
