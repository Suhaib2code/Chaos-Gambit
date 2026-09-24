import { applyLegalMove, getLegalMoves, type Color, type GameState, type Move, type Square } from "./engine";

export type AddedVariant = "hill" | "duck";
export type DuckPhase = "piece" | "duck";
export type DuckTurnState = {
  phase: DuckPhase;
  owner: Color;
  duckSquare: Square | null;
};

export const HILL_CENTERS: Square[] = [
  { r: 3, c: 3 }, { r: 3, c: 4 }, { r: 4, c: 3 }, { r: 4, c: 4 },
];
export const WIDE_HILL_CENTERS: Square[] = Array.from({ length: 16 }, (_, index) => ({ r: Math.floor(index / 4) + 2, c: index % 4 + 2 }));
export type HillCenterSize = "standard" | "wide";

export function getHillCenters(size: HillCenterSize = "standard"): Square[] {
  return size === "wide" ? WIDE_HILL_CENTERS : HILL_CENTERS;
}

export function isHillSquare(square: Square, size: HillCenterSize = "standard"): boolean {
  return getHillCenters(size).some(center => center.r === square.r && center.c === square.c);
}

export function kingReachedHill(state: GameState, color: Color, size: HillCenterSize = "standard"): boolean {
  for (const center of getHillCenters(size)) {
    const piece = state.board[center.r][center.c];
    if (piece?.type === "k" && piece.color === color) return true;
  }
  return false;
}

export function applyDuckChessMove(state: GameState, move: Move, duckSquare: Square | null): GameState | null {
  if (!move || !isValidBoardSquare(move.from) || !isValidBoardSquare(move.to) || !isValidDuckSquare(duckSquare, state)) return null;
  const piece = state.board[move.from.r]?.[move.from.c];
  if (!piece || piece.color !== state.turn) return null;
  return applyLegalMove(state, move, { ignoreCheck: true, blockedSquare: duckSquare });
}

export function getDuckChessMoves(state: GameState, r: number, c: number, duckSquare: Square | null): Move[] {
  if (!isValidBoardSquare({ r, c }) || !isValidDuckSquare(duckSquare, state)) return [];
  return getLegalMoves(state, r, c, { ignoreCheck: true, blockedSquare: duckSquare });
}

export function getDuckPlacementSquares(state: GameState, oldDuckSquare: Square | null, duckMayStay = false): Square[] {
  if (oldDuckSquare !== null && !isValidDuckSquare(oldDuckSquare, state)) return [];
  const squares: Square[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.board[r][c] || (!duckMayStay && oldDuckSquare?.r === r && oldDuckSquare?.c === c)) continue;
      squares.push({ r, c });
    }
  }
  return squares;
}

export function hasDuckChessMove(state: GameState, duckSquare: Square | null): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.board[r][c]?.color === state.turn && getDuckChessMoves(state, r, c, duckSquare).length > 0) return true;
    }
  }
  return false;
}

/** In Duck Chess, the player who made the last move wins when it leaves the opponent without a legal move. */
export function getDuckStalemateWinner(state: GameState, duckSquare: Square | null, mover: Color): Color | null {
  return hasDuckChessMove(state, duckSquare) ? null : mover;
}

export function isValidBoardSquare(value: unknown): value is Square {
  if (!value || typeof value !== "object") return false;
  const square = value as Partial<Square>;
  return Number.isInteger(square.r) && Number.isInteger(square.c) && (square.r as number) >= 0 && (square.r as number) < 8 && (square.c as number) >= 0 && (square.c as number) < 8;
}

export function isValidDuckSquare(value: unknown, state: GameState): value is Square | null {
  if (value === null) return true;
  return isValidBoardSquare(value) && state.board[value.r][value.c] === null;
}
