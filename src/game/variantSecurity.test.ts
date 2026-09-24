import assert from "node:assert/strict";
import { applyLegalMove, createInitialState, moveToSAN, type GameState, type Piece, type Square } from "./engine";
import { applyDuckChessMove, getDuckChessMoves, getDuckPlacementSquares, getDuckStalemateWinner, isHillSquare } from "./variantEngine";
import { exportGamePgn, type ArchivedGame } from "./archive";

function emptyBoard(turn: "w" | "b" = "w"): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  board[7][7] = { type: "k", color: "w" };
  board[0][7] = { type: "k", color: "b" };
  return { board, turn, castling: { w: { k: false, q: false }, b: { k: false, q: false } }, enPassant: null, halfMoves: 0, fullMoves: 1 };
}
const square = (r: number, c: number): Square => ({ r, c });

// The public move boundary must reject malformed, impossible, and wrong-owner actions without mutation.
{
  const state = createInitialState();
  const before = structuredClone(state);
  const attempts = [
    { from: square(6, 4), to: square(-1, 4) },
    { from: square(6, 4), to: square(4, 5) },
    { from: square(1, 4), to: square(3, 4) },
    { from: square(6, 4), to: square(4, 4), promotion: "k" as never },
  ];
  for (const move of attempts) assert.equal(applyLegalMove(state, move), null);
  assert.deepEqual(state, before);
  assert.ok(applyLegalMove(state, { from: square(6, 4), to: square(4, 4) }));
}

// King of the Hill uses ordinary king safety; only the four central squares count as the objective.
{
  assert.ok(isHillSquare(square(3, 3)) && isHillSquare(square(3, 4)) && isHillSquare(square(4, 3)) && isHillSquare(square(4, 4)));
  assert.ok(!isHillSquare(square(2, 3)));
  const state = emptyBoard();
  state.board[7][7] = null;
  state.board[5][2] = { type: "k", color: "w" };
  state.board[0][3] = { type: "r", color: "b" };
  assert.equal(applyLegalMove(state, { from: square(5, 2), to: square(4, 3) }), null, "king must not enter a rook-attacked hill square");
}

// Duck blocks landing and sliding rays, but knights still jump over it. Invalid squares and turns cannot commit.
{
  const state = emptyBoard();
  state.board[4][0] = { type: "r", color: "w" };
  state.board[5][0] = { type: "n", color: "w" };
  const duck = square(4, 3);
  const rookMoves = getDuckChessMoves(state, 4, 0, duck);
  assert.ok(rookMoves.some(move => move.to.r === 4 && move.to.c === 2));
  assert.ok(!rookMoves.some(move => move.to.r === 4 && move.to.c >= 3), "rook ray stops before or on duck");
  const knightMoves = getDuckChessMoves(state, 5, 0, square(5, 1));
  assert.ok(knightMoves.some(move => move.to.r === 3 && move.to.c === 1), "knight can jump the blocker");
  assert.equal(applyDuckChessMove(state, { from: square(4, 0), to: square(4, 4) }, duck), null, "blocked ray cannot be forged into a move");
  assert.equal(applyDuckChessMove(state, { from: square(0, 7), to: square(1, 7) }, null), null, "opponent piece cannot move out of turn");
  assert.equal(getDuckChessMoves(state, 4, 0, square(4, 0)).length, 0, "a duck cannot overlap a piece");

  const placements = getDuckPlacementSquares(state, null);
  assert.ok(!placements.some(item => item.r === 4 && item.c === 0));
  const priorDuck = square(3, 3);
  const afterPiece = structuredClone(state);
  afterPiece.board[3][3] = null;
  assert.ok(!getDuckPlacementSquares(afterPiece, priorDuck).some(item => item.r === priorDuck.r && item.c === priorDuck.c), "duck must move to a different empty square");
}

// Duck Chess allows king capture even where orthodox check rules would forbid the move.
{
  const state = emptyBoard();
  state.board[7][0] = { type: "r", color: "w" };
  state.board[0][7] = null;
  state.board[0][0] = { type: "k", color: "b" };
  const next = applyDuckChessMove(state, { from: square(7, 0), to: square(0, 0) }, null);
  assert.ok(next);
  assert.equal(next.board[0][0]?.type, "r");
  assert.equal(next.board[0][0]?.color, "w");
}

// Duck Chess omits orthodox check suffixes, and awards no-move wins to the player who caused them.
{
  const state = emptyBoard();
  state.board[7][7] = { type: "k", color: "w" };
  state.board[0][7] = null;
  state.board[0][4] = { type: "k", color: "b" };
  state.board[6][4] = { type: "r", color: "w" };
  const move = { from: square(6, 4), to: square(1, 4) };
  const next = applyLegalMove(state, move, { ignoreCheck: true });
  assert.ok(next);
  assert.equal(moveToSAN(state, move, next, { ignoreCheck: true }), "Re7", "Duck notation has no orthodox check suffix");
  assert.equal(moveToSAN(state, move, next), "Re7+", "ordinary chess notation retains check suffixes");

  const noBlackMoves = emptyBoard("b");
  noBlackMoves.board[0][7] = null;
  assert.equal(getDuckStalemateWinner(noBlackMoves, null, "w"), "w");
  noBlackMoves.board[0][7] = { type: "k", color: "b" };
  assert.equal(getDuckStalemateWinner(noBlackMoves, null, "w"), null, "winner is only returned when the opponent has no move");
}

// Untrusted archive notation must not become PGN control syntax.
{
  const initialState = createInitialState();
  const game: ArchivedGame = {
    id: "test", mode: "duck", title: "test", players: { white: "White", black: "Black" },
    startedAt: "2026-01-01T00:00:00.000Z", endedAt: "2026-01-01T00:01:00.000Z", result: "1-0",
    initialState,
    plies: [
      { notation: "e4 ; injected", action: "move", state: initialState },
      { notation: "e5", action: "move", state: initialState },
    ],
  };
  const pgn = exportGamePgn(game);
  assert.ok(pgn.includes("{ Chaos Gambit duck: e4 ; injected }"));
  assert.ok(pgn.includes("1. e5"), "the following move remains active movetext");
}

console.log("Variant security checks passed (move validation, variant rules, SAN, and archive export sanitization).");
