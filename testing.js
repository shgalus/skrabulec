import {assert, nextPermutation, Comblex} from "./utils.js";
import {Engine, cToi, printBoard} from "./engine.js";
import {configMap as config_map_pl} from "./confpl.js";

var assertArrEq, testMoveGen, testNextPermutation, testComblex,
    doAllTests;

assertArrEq = function(a, b) {
  "use strict";
  var i;
  assert(a.length === b.length);
  for (i = 0; i < a.length; i++)
    assert(a[i] === b[i]);
};

testMoveGen = function() {
  "use strict";
  var dictpl = window.SKRABULEC.dict.pl;
  var engine = new Engine(config_map_pl, dictpl),
      board, rack, state;
  
  board = engine.initBoard();
  board[cToi("F8")] = "m";
  board[cToi("G8")] = "a";
  board[cToi("H8")] = "t";
  board[cToi("I8")] = "k";
  board[cToi("J8")] = "a";
  board[cToi("H6")] = "k";
  board[cToi("H7")] = "i";
  board[cToi("H9")] = "k";
  board[cToi("H10")] = "a";
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
  testMoveGen();
};

doAllTests();   // TODO: remove this.
