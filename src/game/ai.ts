import { applyMove, getLegalMoves, GameState, isCheck, Move, PieceType } from './engine';

export type AiStrength = 'casual' | 'balanced' | 'strong';

const VALUES: Record<PieceType, number> = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const CENTER = new Set(['3,3', '3,4', '4,3', '4,4']);

function evaluate(state: GameState, perspective: 'w' | 'b') {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (!piece) continue;
      const sign = piece.color === perspective ? 1 : -1;
      score += sign * VALUES[piece.type];
      if (CENTER.has(`${r},${c}`)) score += sign * (piece.type === 'p' ? 12 : 18);
      if (piece.type === 'p') score += sign * (piece.color === 'w' ? 6 - r : r - 1) * 3;
    }
  }
  if (isCheck(state, state.turn)) score += state.turn === perspective ? -25 : 25;
  return score;
}

function legalMoves(state: GameState): Move[] {
  const moves: Move[] = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (state.board[r][c]?.color === state.turn) moves.push(...getLegalMoves(state, r, c));
  }
  return moves;
}

function moveOrderScore(state: GameState, move: Move) {
  const target = state.board[move.to.r][move.to.c];
  return (target ? VALUES[target.type] * 10 : 0) + (move.promotion ? VALUES[move.promotion] : 0);
}

/** Deterministic, browser-local material search. This is a casual opponent, not a chess engine. */
export function chooseAiMove(state: GameState, strength: AiStrength): Move | null {
  const rootColor = state.turn;
  const depth = strength === 'casual' ? 1 : strength === 'balanced' ? 2 : 3;
  const branchLimit = strength === 'strong' ? 10 : Infinity;
  const rootMoves = legalMoves(state).sort((a, b) => moveOrderScore(state, b) - moveOrderScore(state, a));
  if (!rootMoves.length) return null;

  let bestMove = rootMoves[0];
  let bestScore = -Infinity;
  for (const move of rootMoves) {
    const next = applyMove(state, move);
    const score = depth === 1 ? evaluate(next, rootColor) : search(next, depth - 1, rootColor, -Infinity, Infinity, branchLimit);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function search(state: GameState, depth: number, perspective: 'w' | 'b', alpha: number, beta: number, branchLimit: number): number {
  if (depth === 0) return evaluate(state, perspective);
  const moves = legalMoves(state).sort((a, b) => moveOrderScore(state, b) - moveOrderScore(state, a)).slice(0, branchLimit);
  if (!moves.length) return isCheck(state, state.turn) ? (state.turn === perspective ? -100000 : 100000) : 0;

  const maximizing = state.turn === perspective;
  let best = maximizing ? -Infinity : Infinity;
  for (const move of moves) {
    const score = search(applyMove(state, move), depth - 1, perspective, alpha, beta, branchLimit);
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  return best;
}

export function summarizeGame(moves: string[], states: GameState[], humanColor: 'w' | 'b') {
  const humanMoves = moves.filter((_, index) => (index % 2 === 0 ? 'w' : 'b') === humanColor);
  const captures = humanMoves.filter(move => move.includes('x')).length;
  const checks = humanMoves.filter(move => move.includes('+') || move.includes('#')).length;
  const castles = humanMoves.filter(move => move.startsWith('O-O')).length;
  const initial = states[0];
  const final = states[states.length - 1];
  const notes = [`You played ${humanMoves.length} move${humanMoves.length === 1 ? '' : 's'}${captures ? ` and made ${captures} capture${captures === 1 ? '' : 's'}` : ''}.`];
  if (checks) notes.push(`Your moves gave check ${checks} time${checks === 1 ? '' : 's'}.`);
  if (castles) notes.push(`You castled ${castles === 1 ? 'once' : `${castles} times`}, which moved your king and rook together.`);
  if (initial && final) {
    // Captured material is a factual count of board value change, not a move-quality grade.
    let startMaterial = 0;
    let endMaterial = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (initial.board[r][c]?.color === humanColor) startMaterial += VALUES[initial.board[r][c]!.type];
      if (final.board[r][c]?.color === humanColor) endMaterial += VALUES[final.board[r][c]!.type];
    }
    if (endMaterial > startMaterial) notes.push('Your side ended with more piece value on the board than it started with.');
    else if (endMaterial < startMaterial) notes.push('Your side ended with less piece value on the board than it started with; review the move log for exchanges to revisit.');
  }
  notes.push('This recap counts visible game events; it does not grade moves with engine analysis.');
  return notes;
}
