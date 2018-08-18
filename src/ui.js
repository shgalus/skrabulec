import {assert, makeArray} from "./utils.js";
import {Game} from "./game.js";
import {scores, Move, mnormal} from "./engine.js";

// TODO: make it a class.

var $ = window.$;
//var jQuery = window.jQuery;
var stringMap,
    letterMap;
const configMap = {
  color_map: {
    normal_field:        "rgb(23, 149, 135)",
    double_letter_score: "rgb(155, 188, 229)",
    triple_letter_score: "rgb(42, 132, 210)",
    double_word_score:   "rgb(243, 176, 147)",
    triple_word_score:   "rgb(231, 62, 23)",
    grid:                "rgb(140, 198, 183)",
    exterior:            "rgb(0, 72, 68)",
    coordinate:          "rgb(113, 189, 189)",
    tile_background:     "rgb(254, 244, 183)",
    tile_foreground:     "rgb(27, 112, 105)"
  },
  rack_size: 9
};
var uiEngine,
    blockedInput,
    oppRackVisible,
    currentGame;

export var startGame;

var modalDialog,
    errorDialog,
    infoDialog,
    gameIsOverDialog,
    getLetterPoints,
    tileDiv,
    moveActiveTilesToRack,
    addToWordList,
    markLettersAsPlayed,
    setPoints,
    exchangeTiles,
    markDroppable,
    putPlayerRack,
    putOpponentRack,
    blockInput,
    unblockInput,
    onClickOppRack,
    onClickButtonConfirm,
    onClickButtonClear,
    onClickButtonPause,
    onClickButtonExchange,
    onClickButtonResign,
    onClickBlankTile,
    onClickReplacingLetter,
    onDropTile,
    animateDivDrop,
    clearOpponentRack,
    displayOpponentRack,
    getOpponentMove,
    gameOverInfo;

modalDialog = function(title, text) {
  "use strict";
  $('#iddialog').dialog('option', 'title', title);
  $('#iddialogtext').text(text);
  $('#iddialog').dialog('open');
};

errorDialog = function(text) {
  "use strict";
  text = text.trim();
  if (text.slice(-1) !== '.')
    text += '.';
  modalDialog(stringMap.dialog_error_title, text);
};

infoDialog = function(text) {
  "use strict";
  text = text.trim();
  if (text.slice(-1) !== '.')
    text += '.';
  modalDialog(stringMap.dialog_info_title, text);
};

gameIsOverDialog = function() {
  "use strict";
  infoDialog(stringMap.game_over);
};

getLetterPoints = function(c) {
  "use strict";
  return (uiEngine.letterMap[c].npoints).toString();
};

// Builds div for letter c.
tileDiv = function(c) {
  "use strict";
  if (c === "?")
    return '<div class="tile ntile"><sub></sub></div>';
  return '<div class="tile ntile">' + c.toUpperCase() +
    '<sub>' + getLetterPoints(c) + '</sub></div>';
};

startGame = function(container, conf, dict) {
  "use strict";
  var i, j, k, html, h, r, hcoord, c, cl, letters, dlgbuttons;

  stringMap = conf.string_map;
  letterMap = conf.letter_map;
  currentGame = new Game(conf, dict);
  uiEngine = currentGame.engine;
  console.log(uiEngine);

  html = '<div id="idleftpanel">';
  html += '<table id="idgame" class="game"><tbody>';

  // Opponent's rack.
  h = '<table id="idopprack" class="rack"><tbody><tr>';
  for (i = 1; i <= configMap.rack_size; i +=1) {
    h += '<td id="idor' + i + '"></td>';
  }
  h += '</tr></tbody></table>';
  html += '<tr><td>' + h + '</td></tr>';

  // Board.
  h = '<table id="idboard" class="board"><tbody>';
  hcoord = '<tr><td class="ext"></td>';
  for (i = 1; i <= 15; i += 1) {
    hcoord += '<td class="ext">' + i + '</td>';
  }
  hcoord += '<td class="ext"></td></tr>';
  h += hcoord;

  k = 0;
  for (i = 1; i <= 15; i += 1) {
    c = String.fromCharCode(64 + i);
    r = '<tr><td class="ext">' + c + '</td>';
    for (j = 1; j <= 15; j += 1) {
      switch (scores.charAt(k)) {
      case " ": cl = "nscore"; break;
      case "W": cl = "twscore"; break;
      case "w": cl = "dwscore"; break;
      case "L": cl = "tlscore"; break;
      case "l": cl = "dlscore"; break;
      default:  assert(false);
      }
      k += 1;
      r += '<td id="idbdf' +
        String.fromCharCode(64 + i) + j +
        '" class = "int ' + cl + '"></td>';
    }
    r += '<td class="ext">' + c + '</td></tr>';
    h += r;
  }
  h += hcoord;
  h += '</tbody></table>';
  html += '<tr><td>' + h + '</td></tr>';

  // Player's rack.
  h = '<table id="idplrrack" class="rack"><tbody><tr>';
  for (i = 1; i <= configMap.rack_size; i +=1) {
    h += '<td id="idpr' + i + '"></td>';
  }
  h += '</tr></tbody></table>';
  html += '<tr><td>' + h + '</td></tr>';

  // Buttons.
  h = '<table class="buttons"><tbody><tr>';
  r = '<td><button id="';
  c = '" type="button" class="pbutton">';
  h += r + 'idbutconfirm' + c + stringMap.confirm_btn +
    '</button></td>';
  h += r + 'idbutclear' + c + stringMap.clear_btn +
    '</button></td>';
  h += r + 'idbutpause' + c + stringMap.pause_btn +
    '</button></td>';
  h += r + 'idbutexchange' + c + stringMap.exchange_btn +
    '</button></td>';
  h += r + 'idbutresign' + c + stringMap.resign_btn +
    '</button></td>';
  h += '</tr></tbody></table>';
  html += '<tr><td>' + h + '</td></tr>';
  html += '</tbody></table>';

  // Dialog.
  html += '<div id="iddialog" title="' + stringMap.dialog_title +
    '">' + '<div id="iddialogtext"></div></div>';

  // Dialog for replacing a blank tile.
  h = '<div id="idblrepldiv" title="' + stringMap.repl_blank_title +
    '">' + '<p>' + stringMap.repl_blank_tile_command + '</p>' +
    '<table id="idblrepltab" class="mydlotable">' +
    '<tbody>';
  letters = Object.keys(letterMap);
  j = 0;
  for (k = 0; k < letters.length; k++)
    if (letters[k] !== '?') {
      if (j === 0)
        h += '<tr>';
      h += '<td><div class="tile ntile">' +
        letters[k].toUpperCase() + '</div></td>';
      if (++j === 8) {
        h += '</tr>';
        j = 0;
      }
    }
  if (j > 0)
    h += '</tr>';
  h += '</tbody></table></div>';
  html += h;

  // Dialog for exchanging tiles.
  h = '<div id="idexchg" title="' + stringMap.exchange_tiles_title +
    '">' + '<p>' + stringMap.exchange_tiles_command + '</p>';
  h += '<table id="idexchgtab0" class="exchgrack"><tbody><tr>';
  for (i = 1; i <= 7; i +=1)
    h += '<td id="idex0' + i + '"></td>';
  h += '</tr></tbody></table>';
  h += '<table id="idexchgtab1" class="exchgrack"><tbody><tr>';
  for (i = 1; i <= 7; i +=1)
    h += '<td id="idex1' + i + '"></td>';
  h += '</tr></tbody></table></div></div>';
  html += h;

  // Right panel, letterlist.
  var td;
  h = '<div id="idrightpanel">';
  h += '<div id="idletterlist">';
  h += '<table class="letterlist"><tbody>';
  k = 0;
  for (i in letterMap)
    if (letterMap.hasOwnProperty(i)) {
      td = '<td class="notplayed">';
      if (i !== "?")
        td += i.toUpperCase() +
        '<sub>' + letterMap[i].npoints + '</sub>';
      for (j = 0; j < letterMap[i].nitems; j++) {
        if (k++ % 10 === 0)
          h += '<tr>';
        h += td;
      }
    }
  h += '</tbody></table></div>';
  html += h;

  // Right panel, points and the number of tiles in bag.
  h = '<div id="idpoints">';
  h += '<table class="points"><tbody>';
  h += '<tr><td class="left">' + stringMap.plr_points + '<td>' +
    '<td id="idplp" class="right">';
  h += '<tr><td class="left">' + stringMap.total_points + '<td>' +
    '<td id="idtplp" class="right">';
  h += '<tr><td class="left">' + stringMap.opp_points + '<td>' +
    '<td id="idopp" class="right">';
  h += '<tr><td class="left">' + stringMap.total_points + '<td>' +
    '<td id="idtopp" class="right">';
  h += '<tr><td class="left">' + stringMap.n_of_tiles_in_bag +
    '<td>' + '<td id="idnotb" class="right">';
  h += '</tbody></table></div>';

  // Right panel, wordlist.
  h += '<p>' + stringMap.last_words + '</p>';
  h += '<div id="idwordlist" class="wordlist">';
  h += '</div>';

  // Finish right panel div, scrabble div and body.
  h += '</div></div></body></html>';
  html += h;

  // console.log(html);
  container.append(html);
  markDroppable();
  $("body").on("selectstart", function() {
    return false;
  });
  $("#scrabble").css("cursor", "default");
  $("#idopprack").click(function() {onClickOppRack();});
  $("#idbutconfirm").click(function() {onClickButtonConfirm();});
  $("#idbutclear").click(function() {onClickButtonClear();});
  $("#idbutpause").click(function() {onClickButtonPause();});
  $("#idbutexchange").click(function() {onClickButtonExchange();});
  $("#idbutresign").click(function() {onClickButtonResign();});

  // Dialog.
  dlgbuttons = {};
  dlgbuttons[stringMap.dialog_ok_button] = function() {
    $(this).dialog('close');
  };
  $("#iddialog").dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    closeText: stringMap.dialog_close_text,
    buttons: dlgbuttons
  });

  // Dialog for replacing a blank tile.
  dlgbuttons = {};
  dlgbuttons[stringMap.dialog_repl_blank_button] = function() {
    var id = $("#idblrepldiv").data("id");
    $("#" + id + " > div").html("<sub></sub>");
    $(this).dialog('close');
  };
  $("#idblrepldiv").css("cursor", "default");
  $("#idblrepldiv").dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    width: 350,
    height: 300,
    closeText: stringMap.dialog_close_text,
    buttons: dlgbuttons
  });
  $("#idblrepltab td div").click(onClickReplacingLetter);

  // Dialog for exchanging tiles.
  dlgbuttons = {};
  dlgbuttons[stringMap.dialog_exchange_tiles_button] = function() {
    $(this).dialog('close');
    exchangeTiles();
  };
  $("#idexchg").css("cursor", "default");
  $("#idexchg").dialog({
    autoOpen: false,
    resizable: false,
    modal: true,
    width: 400,
    height: 300,
    closeText: stringMap.dialog_close_text,
    close: function() {unblockInput();},
    buttons : dlgbuttons
  });
  blockedInput = true;

  oppRackVisible = false;
  console.log("Przed putPlayerRack");
  console.log(currentGame.player_rack);
  putPlayerRack(currentGame.player_rack);
  $("#idnotb").text(currentGame.bag.size());
  blockedInput = false;
  console.log("Koniec startGame");
};

// If there are active tiles left on the board, move them back to
// the player's rack.
moveActiveTilesToRack = function() {
  "use strict";
  var a = [],
      k = 0,
      i, t, d;
  $(".atile").each(function() {
    a.push(this.closest("td"));
  });
  for (i = 0; i < a.length; i++) {
    do
      t = $("#idpr" + (++k));
    while (t.html());
    d = $(a[i]).children().first().detach();
    d.removeClass("atile").addClass("ntile");
    t.append(d);
    $(a[i]).droppable({disabled: false});
    t.droppable({disabled: true});
  }
};

addToWordList = function() {
  "use strict";
  var ml = currentGame.move_list,
      l, h, d;
  l = ml.length;
  if (l-- === 0)
    return;
  h = l % 2 === 0 ? '<span class="player">'
    : '<span class="opponent">';
  if (ml[l].move_kind === uiEngine.mnormal) {
    h += uiEngine.iToc(ml[l].tiles[0].field) + " ";
    h += ml[l].words[0].toUpperCase();
  } else if (ml[l].move_kind === uiEngine.mpause) {
    h += "&lt;" + stringMap.word_list_pause + "&gt;";
  } else if (ml[l].move_kind === uiEngine.mexchange) {
    h += "&lt;" + stringMap.word_list_exchange + "&gt;";
  }
  h += '<br></span>';
  $("#idwordlist").append(h);
  d = $("#idwordlist");
  //d.scrollTop(d.prop("scrollHeight"));
  d.animate({scrollTop: d.prop("scrollHeight")}, 1000);
};

markLettersAsPlayed = function(s) {
  "use strict";
  var i, j, c, z;
  for (i = 0; i < s.length; i++) {
    z = $(".notplayed");
    c = s.charAt(i);
    if (c === "?")
      for (j = 0; j < z.length; j++) {
        if ($(z[j]).text() === "")
          break;
      }
    else
      for (j = 0; j < z.length; j++)
        if ($(z[j]).text()[0] === c)
          break;
    assert(j < z.length);
    $(z[j]).removeClass("notplayed").addClass("played");
  }
};

setPoints = function() {
  "use strict";
  var ml = currentGame.move_list,
      l, z;
  $("#idnotb").text(currentGame.bag.size());
  l = ml.length;
  if (l-- === 0)
    return;
  z = l % 2 === 0 ? "plp" : "opp";
  $("#id" + z).text(ml[l].points);
  $("#idt" + z).text(ml[l].total_points);
};

exchangeTiles = function() {
  "use strict";
  var move = uiEngine.makeMove(uiEngine.mexchange),
      response, i, d;
  for (i = 1; i <= 7; i++) {
    d = $("#idex1" + i).children()[0];
    if ($(d).html() !== undefined) {
      if ($(d).text() !== '')
        move.tiles += $(d).text()[0].toLowerCase();
      else
        move.tiles += "?";
    }
  }
  if (move.tiles.length === 0) {
    unblockInput();
    return;
  }
  response = currentGame.register_player_move(move);
  if (response.hasOwnProperty("error")) {
    infoDialog(response.error);
    unblockInput();
    return;
  }
  moveActiveTilesToRack();
  $("#idplrrack div").remove();       // Clears player's rack.
  putPlayerRack(response.tiles);
  addToWordList();
  setPoints();
  getOpponentMove();
};

markDroppable = function() {
  "use strict";
  var i, j, c, d;
  for (i = 1; i <= 15; i += 1) {
    c = String.fromCharCode(64 + i);
    for (j = 1; j <= 15; j += 1) {
      d = "#idbdf" + c + j;
      $(d).droppable({
        scope: "grascope",
        disabled: false,
        drop: onDropTile
      });
      $(d).css("z-index", 0);
    }
  }
  for (i = 1; i <= configMap.rack_size; i++) {
    d = "#idpr" + i;
    $(d).droppable({
      scope: "grascope",
      disabled: true,
      drop: onDropTile
    });
    $(d).css("z-index", 0);
  }
  for (i = 1; i <= 7; i++) {
    d = "#idex0" + i;
    $(d).droppable({
      scope: "exscope",
      disabled: true,
      drop: onDropTile
    });
    $(d).css("z-index", 0);
  }
  for (i = 1; i <= 7; i++) {
    d = "#idex1" + i;
    $(d).droppable({
      scope: "exscope",
      disabled: false,
      drop: onDropTile
    });
    $(d).css("z-index", 0);
  }
};

putPlayerRack = function(s) {
  "use strict";
  var i, c, d;

  for (i = 0; i < s.length; i++) {
    c = s.charAt(i);
    d = "#idpr" + (i + 1);
    $(d).append(tileDiv(c));
    $(d + " > div").draggable({
      scope: "grascope",
      containment: "#idgame",
      disabled: false,
      cursor: "pointer",
      opacity: 1.0,
      revert: true,
      zIndex: 1,
      revertDuration: 0
    });
    if (c === "?") {
      $(d + " > div").click(onClickBlankTile);
    }
  }
  while (i <= configMap.rack_size)
    $("#idpr" + i++).droppable({disabled: false});
};

putOpponentRack = function(s) {
  "use strict";
  var i, c, d;

  for (i = 0; i < s.length; i++) {
    c = s.charAt(i);
    d = "#idor" + (i + 1);
    $(d).append(tileDiv(c));
  }
};

blockInput = function() {
  "use strict";
  if (blockedInput)
    return;
  blockedInput = true;
  $('.atile').draggable('disable');
  $('[id^=idpr]:has(div) > div').draggable('disable');
};

unblockInput = function() {
  "use strict";
  if (!blockedInput)
    return;
  blockedInput = false;
  $('.atile').draggable('enable');
  $('[id^=idpr]:has(div) > div').draggable('enable');
};

//------------------- BEGIN EVENT HANDLERS -------------------

onClickOppRack = function() {
  "use strict";
  if (blockedInput)
    return;
  if (currentGame.is_finished) {
    gameIsOverDialog();
    return;
  }
  if (oppRackVisible) {
    oppRackVisible = false;
    clearOpponentRack();
  } else {
    oppRackVisible = true;
    displayOpponentRack();
  }
};

onClickButtonConfirm = function() {
  "use strict";
  var ids = [],
      lp = "",
      move,
      i, d, isblank, letter, response;

  function supplement_player_rack(new_tiles) {
    var i, c, d,
        tab = [];
    $(".atile").removeClass("atile").addClass("ntile");
    $('[id^=idpr]:not(:has(div))').each(function() {
      tab.push(this.id);
    });
    assert(tab.length >= new_tiles.length);
    for (i = 0; i < new_tiles.length; i++) {
      c = new_tiles.charAt(i);
      d = "#" + tab[i];
      $(d).append(tileDiv(c));
      $(d + " > div").draggable({
        scope: "grascope",
        containment: "#idgame",
        disabled: true,
        cursor: "pointer",
        opacity: 1.0,
        revert: true,
        zIndex: 1,
        revertDuration: 0
      });
      $(d).droppable({disabled: true});
      if (c === "?") {
        $(d + " > div").click(onClickBlankTile);
      }
    }
  }

  if (blockedInput)
    return;
  if (currentGame.is_finished) {
    gameIsOverDialog();
    return;
  }
  blockInput();
  $(".atile").each(function() {
    ids.push(this.closest("td").id);
  });
  move = new Move(mnormal);
  for (i = 0; i < ids.length; i++) {
    d = $("#" + ids[i] + " > div");
    // $(d).text() === "A1" for letter A
    //             === "" for blank with no replacing letter
    //             === "A" for blank replacing letter A
    isblank = $(d).text().length <= 1;
    letter = $(d).text()[0]; // undefined for blank with no
    // replacing letter
    lp += isblank ? "?" : letter;
    move.add(ids[i].substring(5), isblank, letter);
  }
  response = currentGame.register_player_move(move);
  if (response.hasOwnProperty("error")) {
    errorDialog(response.error);
    unblockInput();
  } else {
    markLettersAsPlayed(lp);
    setPoints();
    addToWordList();
    if (currentGame.is_finished) {
      gameOverInfo();
      unblockInput();
      return;
    } else {
      supplement_player_rack(response.new_tiles);
      getOpponentMove();
    }
  }
};

onClickButtonClear = function() {
  "use strict";
  if (blockedInput)
    return;
  moveActiveTilesToRack();
};

onClickButtonPause = function() {
  "use strict";
  var move, response;
  if (blockedInput)
    return;
  if (currentGame.is_finished) {
    gameIsOverDialog();
    return;
  }
  blockInput();
  moveActiveTilesToRack();
  move = uiEngine.makeMove(uiEngine.mpause);
  response = currentGame.register_player_move(move);
  setPoints();
  addToWordList();
  if (currentGame.is_finished) {
    gameOverInfo();
    infoDialog(stringMap.game_has_finished);
    unblockInput();
    return;
  } else
    getOpponentMove();
};

onClickButtonExchange = function() {
  "use strict";
  var move, response;

  function copy_rack() {
    var s, i, c, d;
    $("#idexchgtab0 div").remove();
    $("#idexchgtab1 div").remove();
    for (i = 1; i <= 7; i++) {
      $("#idex0" + i).droppable({disabled: false});
      $("#idex1" + i).droppable({disabled: false});
    }
    s = currentGame.player_rack;
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i);
      d = "#idex0" + (i + 1);
      $(d).append(tileDiv(c));
      $(d + " > div").draggable({
        scope: "exscope",
        containment: "#idexchg",
        disabled: false,
        cursor: "pointer",
        opacity: 1.0,
        revert: true,
        zIndex: 1,
        revertDuration: 0
      });
      $(d).droppable({disabled: true});
    }
  }

  if (blockedInput)
    return;
  if (currentGame.is_finished) {
    gameIsOverDialog();
    return;
  }
  blockInput();
  move = uiEngine.makeMove(uiEngine.mexchange);
  response = currentGame.register_player_move(move);
  if (response.hasOwnProperty("error")) {
    infoDialog(response.error);
    unblockInput();
    return;
  }
  copy_rack();
  $('#idexchg').dialog('open');
};

onClickButtonResign = function() {
  "use strict";
  var move, response;
  if (blockedInput)
    return;
  if (currentGame.is_finished) {
    gameIsOverDialog();
    return;
  }
  blockInput();
  move = uiEngine.makeMove(uiEngine.mresignation);
  response = currentGame.register_player_move(move);
  assert(currentGame.is_finished);
  gameOverInfo();
  infoDialog(stringMap.game_has_finished);
  unblockInput();
};

// Opens dialog on replacing a blank tile.
onClickBlankTile = function(ev) {
  "use strict";
  if (blockedInput)
    return;
  $('#idblrepldiv').data({
    'id': $(ev.target).closest('td').prop('id')
  }).dialog('open');
};

// Replaces the blank tile with the clicked letter.
onClickReplacingLetter = function(ev) {
  "use strict";
  $(this).closest('.ui-dialog-content').dialog('close');
  var container = $('#idblrepldiv').data('id'),
      letter = ev.target.childNodes[0].data,
      blank = $('#' + container + ' > div');
  blank.html((letter + '<sub></sub>'));
};

onDropTile = function(event, ui) {
  "use strict";
  var dragid = "#" + ui.draggable.closest("td").prop("id"),
      dropid = "#" + event.target.id,
      q = $(dragid).children().first().detach();
  if (dragid.substr(3, 2) === "pr" &&
      dropid.substr(3, 3) === "bdf") {
    q.removeClass("ntile");
    q.addClass("atile");
  } else if (dragid.substr(3, 3) === "bdf" &&
             dropid.substr(3, 2) === "pr") {
    q.removeClass("atile");
    q.addClass("ntile");
  }
  $(dropid).append(q);
  $(dragid).droppable({disabled: false});
  $(dropid).droppable({disabled: true});
};

//-------------------- END EVENT HANDLERS --------------------

// https://stackoverflow.com/questions/907279, 13 VII 2017.
animateDivDrop = function(id1, id2) {
  "use strict";
  function callback() {
    d1.show();
    d0.remove();
    t.remove();
  }
  var d0 = $(id1 + " div"),
      o0 = d0.offset(),
      d1 = d0.clone().appendTo(id2),
      o1 = d1.offset(),
      t = d0.clone().appendTo("body");
  t.css("position", "absolute")
    .css("left", o0.left)
    .css("top", o0.top)
    .css("zIndex", 0); // 1000?
  d1.hide();
  d0.hide();
  t.animate({
    "top": o1.top,
    "left":o1.left
  }, "slow", callback);
};

clearOpponentRack = function() {
  "use strict";
  $("#idopprack div").remove();
};

displayOpponentRack = function() {
  "use strict";
  putOpponentRack(currentGame.opponent_rack);
};

getOpponentMove = function() {
  "use strict";
  var response = currentGame.get_opponent_move();

  // Returns div for letter c to put on blank tile (no points).
  function tile_div_for_blank(c) {
    assert(c !== "?");
    return '<div class="tile ntile">' + c.toUpperCase() +
      '<sub></sub></div>';
  }

  function display_opponent_move2(move) {
    var
    marked = makeArray(8, false),
    lp = "",
    i, j, c, upc, p, d, s;

    // If opponent's rack is not visible, put on it tiles to be laid
    // on the board.
    if (!oppRackVisible) {
      s = String();
      for (i = 0; i < move.length; i++)
        s += move[i].isblank ? "?" : move[i].letter;
      putOpponentRack(s);
    }
    // TODO:
    // complement_rack(move);

    // Send tiles one by one from the rack to the board.
    for (i = 0; i < move.length; i++) {
      c = move[i].letter;
      upc = c.toUpperCase();
      if (move[i].isblank) {
        p = "";
        lp += "?";
      }
      else {
        p = getLetterPoints(c);
        lp += upc;
      }
      if (move[i].isblank) {
        for (j = 1; j <= 7; j++) {
          if ($("#idor" + j).text() === "" && !marked[j]) {
            $("#idor" + j + " div").remove();
            $("#idor" + j).append(tile_div_for_blank(c));
            break;
          }
        }
      } else {
        for (j = 1; j <= 7; j++) {
          if ($("#idor" + j).text()[0] === upc && !marked[j])
            break;
        }
      }
      assert(1 <= j && j <= 7);
      d = "#idbdf" + uiEngine.iToc(move[i].field);
      animateDivDrop("#idor" + j, d);
      marked[j] = true;
    }
    markLettersAsPlayed(lp);
    setPoints();
    addToWordList();
  }

  if (response.hasOwnProperty("tiles")) {
    display_opponent_move2(response.tiles);
  }
  else if (response.hasOwnProperty("pause")) {
    setPoints();
    addToWordList();
    infoDialog(stringMap.opponent_pauses);
  } else if (response.hasOwnProperty("exchange")) {
    setPoints();
    addToWordList();
    infoDialog(stringMap.opponent_exchanges);
  }
  if (oppRackVisible) {
    clearOpponentRack();
    displayOpponentRack();
  }
  if (currentGame.is_finished)
    gameOverInfo();
  unblockInput();
};

gameOverInfo = function() {
  "use strict";
  var h = stringMap.end_of_game_info + '<br>',
      d;

  h += stringMap.plr_points +
    currentGame.player_total_points + "<br>";
  h += stringMap.opp_points +
    currentGame.opponent_total_points + "<br>";
  $("#idwordlist").append(h);
  d = $("#idwordlist");
  //d.scrollTop(d.prop("scrollHeight"));
  d.animate({scrollTop: d.prop("scrollHeight")}, 1000);
};

console.log("Jestem tu!");
