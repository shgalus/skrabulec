import {assert} from "./utils.js";
import {Bag, Engine, State,
        mnormal, mpause, mexchange, mresignation,
        eognormal, eogpauses, eogresignation,
        cToi} from "./engine.js";

export class Game {
  constructor(conf, dict) {
    this.engine = new Engine(conf, dict);
    this.bag = new Bag(conf.letter_map);
    this.current_board = this.engine.initBoard();
    this.move_list = [];
    this.num_player_exchanges = 0;
    this.num_opponent_exchanges = 0;
    this._player_rack = this.bag.issue(7);
    this.opponent_rack = this.bag.issue(7);
    this.points_left_on_rack = 0;
    this.is_finished = false;
    this.player_correction_points = null;
    this.opponent_correction_points = null;
    this.player_total_points = null;
    this.opponent_total_points = null;
    this.eog_reason = null;
  }

//  get engine() {
//    return this.engine;
//  }

//  set engine(value) {
//    this.engine = value;
  //  }

  get player_rack() {
    return this._player_rack;
  }


  register_player_move(move) {
    var response = {},
        state, s, i, j, c;

    if (this.is_finished) {
      response.error = this.engine.string_map.game_finished;
      return response;
    }

    if (move.kind === mnormal) {
      for (i = 0; i < move.tiles.length; i++) {
        if ((move.tiles[i].field = cToi(move.tiles[i].field))
            === undefined) {
          response.error = this.engine.string_map.move_error;
          return response;
        }
        if (move.tiles[i].letter === undefined) {
          response.error = this.engine.string_map.set_blank_letter;
          return response;
        }
        move.tiles[i].letter = move.tiles[i].letter.toLowerCase();
      }
      move.sort();
      if (!move.is_sorted()) {
        response.error = this.engine.string_map.move_error;
        return response;
      }
      state = this.engine.validateMove(this._player_rack,
                                       this.current_board,
                                       move.tiles);
      if (typeof state === "string") {
        response.error = state;
        return response;
      }
      this.current_board = state.board.slice(0);
      s = this.engine.supplementRack(this._player_rack, move.tiles,
                                     this.bag);
      this._player_rack = s.rack + s.new_tiles;
      this.add_to_move_list(state);
      if (!this.is_finished)
        response.new_tiles = s.new_tiles;
      return response;
    }
    if (move.kind === mpause) {
      state = new State(this._player_rack, mpause);
      state.board = this.current_board.slice(0);
      this.add_to_move_list(state);
      return response;
    }
    if (move.kind === mexchange) {
      if (this.num_player_exchanges >= 3) {
        response.error = this.engine.string_map.max_three_exchanges;
        return response;
      }
      if (this.bag.size() < 7) {
        response.error =
          this.engine.string_map.not_enough_tiles_in_bag;
        return response;
      }
      if (move.tiles.length === 0)
        return response;
      state = new State(this._player_rack, mexchange);
      state.tiles = move.tiles;
      state.board = this.current_board.slice(0);
      s = move.tiles;
      move.tiles = this.bag.exchange(move.tiles);
      assert(s.length === move.tiles.length);
      j = 0;
      for (i = 0; i < s.length; i++) {
        c = s.charAt(i);
        assert(this._player_rack.indexOf(c) >= 0);
        this._player_rack =
          this._player_rack.replace(c, move.tiles.charAt(j++));
      }
      this.add_to_move_list(state);
      response.tiles = this._player_rack;
      this.num_player_exchanges++;
      return response;
    }
    if (move.kind === mresignation) {
      state = new State(this._player_rack, mresignation);
      state.board = this.current_board.slice(0);
      this.add_to_move_list(state);
      assert(this.is_finished);
      return response;
    }
  }

  get_opponent_move() {
    var state, response = {}, s;
    state = this.engine.generateMove2(this.current_board,
                                      this.opponent_rack);
    if (state.move_kind === mnormal) {
      assert(typeof this.engine.validateMove(this.opponent_rack,
                                             this.current_board,
                                             state.tiles)
             !== "string");
      this.current_board = state.board.slice(0);
      s = this.engine.supplementRack(this.opponent_rack,
                                     state.tiles, this.bag);
      this.opponent_rack = s.rack + s.new_tiles;
      this.add_to_move_list(state);
      response.tiles = state.tiles;
    } else if (state.move_kind === mpause) {
      this.add_to_move_list(state);
      response.pause = true;
    }
    else if (state.move_kind === mexchange) {
      this.add_to_move_list(state);
      this.num_opponent_exchanges++;
      response.exchange = true;
    }
    return response;
  }

  //
  // move_list is an array of records. Each element represents the
  // state of the game after a move. The type of record is as follows.
  //
  // {
  //   rack: "afklttz",
  //   move_kind: configMap.move_kind_map.normal,
  //   tiles: [
  //     {
  //       field:   cToi("H6"),
  //       isblank: false,
  //       letter:  "f"
  //     }, {
  //       field:   cToi("H7"),
  //       isblank: false,
  //       letter:  "a"
  //     }, {
  //       field:   cToi("H8"),
  //       isblank: false,
  //       letter:  "k"
  //     }, {
  //       field:   cToi("H9"),
  //       isblank: false,
  //       letter:  "t"
  //     }
  //   ],
  //   words: ["fakt"],
  //   board: [],
  //   points: 0,
  //   total_points: 0
  // }
  //
  // If move.kind == configMap.move_kind_map.pause or move.kind ==
  // configMap.move_kind_map.resignation, there is no tiles field. If
  // move.kind == configMap.move_kind_map.exchange, the field tiles is
  // a string containing letters to be exchanged.
  //
  // move_list[0] is the player's first move, move_list[1] is the
  // opponent's first move and so on.
  //
  add_to_move_list(state) {
    var i;
    assert(state.rack !== undefined);
    assert(state.move_kind !== undefined);
    if (state.move_kind === mnormal) {
      assert(state.tiles !== undefined);
      assert(state.tiles.length > 0);
      for (i = 0; i < state.tiles.length; i++) {
        assert(state.tiles[i].field !== undefined);
        assert(Number.isInteger(state.tiles[i].field));
        assert(state.tiles[i].isblank !== undefined);
        assert(state.tiles[i].letter !== undefined);
      }
      assert(state.words !== undefined);
      assert(state.words.length > 0);
      assert(state.board !== undefined);
      assert(state.board.length === 289);
      assert(state.points !== undefined);
      assert(Number.isInteger(state.points));
      assert(state.points > 0);
      assert(state.total_points === undefined);
    } else if (state.move_kind === mpause) {
      assert(state.tiles === undefined);
      assert(state.words === undefined);
      assert(state.board !== undefined);
      assert(state.board.length === 289);
      assert(state.points === undefined);
      assert(state.total_points === undefined);
      state.points = 0;
    } else if (state.move_kind === mexchange) {
      assert(state.tiles !== undefined);
      assert(state.tiles.length > 0);
      assert(state.words === undefined);
      assert(state.board !== undefined);
      assert(state.board.length === 289);
      assert(state.points === undefined);
      assert(state.total_points === undefined);
      state.points = 0;
    } else if (state.move_kind === mresignation) {
      assert(state.tiles === undefined);
      assert(state.words === undefined);
      assert(state.board !== undefined);
      assert(state.board.length === 289);
      assert(state.points === undefined);
      assert(state.total_points === undefined);
      state.points = 0;
    } else
      assert(false);
    if (this.move_list.length >= 2)
      state.total_points =
      this.move_list[this.move_list.length - 2].total_points +
      state.points;
    else
      state.total_points = state.points;
    this.move_list.push(state);
    if (state.move_kind === mnormal) {
      console.log(this.engine.getNotation(state.board, state.tiles));
    }
    this.check_game_state();
  }

  check_game_state() {
    var mll = this.move_list.length,
        that = this,
        r1, r2, p1, p2, t1, t2;

    function sum_rack(r) {
      var i, s = 0;
      for (i = 0; i < r.length; i++)
        s += that.engine.letterMap[r.charAt(i)].npoints;
      return s;
    }

    function four_consecutive_pauses() {
      var i;
      if (mll < 4)
        return false;
      for (i = 1; i <= 4; i++)
        if (that.move_list[mll - i].move_kind !== mpause)
          return false;
      return true;
    }

    if (this.is_finished || mll === 0)
      return;
    if (mll % 2) {
      r1 = this._player_rack; r2 = this.opponent_rack;
    } else {
      r1 = this.opponent_rack; r2 = this._player_rack;
    }
    if (r1.length === 0) {
      this.eog_reason = eognormal;
      p1 = sum_rack(r2);
      t1 = p1 + this.move_list[mll - 1].total_points;
      p2 = - p1;
      t2 = p2 + (mll >= 2 ? this.move_list[mll - 2].total_points : 0);
      this.is_finished = true;
    } else if (four_consecutive_pauses()) {
      // \cite [\S5.1.4] {reg-tur-pfs-2015}
      this.eog_reason = eogpauses;
      p1 = - sum_rack(r1);
      t1 = p1 + this.move_list[mll - 1].total_points;
      p2 = - sum_rack(r2);
      t2 = p2 + (mll >= 2 ? this.move_list[mll - 2].total_points : 0);
      this.is_finished = true;
    } else if (this.move_list[mll - 1].move_kind === mresignation) {
      // \cite [\S7.2c] {reg-tur-pfs-2015}
      this.eog_reason = eogresignation;
      p1 = 1 - this.move_list[mll - 1].total_points;
      t1 = 1;
      p2 =  400 -
        (mll >= 2 ? this.move_list[mll - 2].total_points : 0);
      t2 = 400;
      this.is_finished = true;
    }
    if (this.is_finished)
      if (mll % 2) {
        this.player_correction_points = p1;
        this.player_total_points = t1;
        this.opponent_correction_points = p2;
        this.opponent_total_points = t2;
      } else {
        this.player_correction_points = p2;
        this.player_total_points = t2;
        this.opponent_correction_points = p1;
        this.opponent_total_points = t1;
      }
  }
}
