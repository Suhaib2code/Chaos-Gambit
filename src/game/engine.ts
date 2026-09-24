import { Chess } from 'chess.js';

export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Piece = { type: PieceType; color: Color; id?: string };
export type Square = { r: number; c: number };
export type Move = {
  from: Square;
  to: Square;
  promotion?: PieceType;
  captured?: Piece;
};

export type GameState = {
  board: (Piece | null)[][];
  turn: Color;
  castling: { w: { k: boolean; q: boolean }; b: { k: boolean; q: boolean } };
  enPassant: Square | null;
  halfMoves: number;
  fullMoves: number;
};

export type GameOptions = {
  ignoreCheck?: boolean;
  jumpSquare?: Square | null;
  /** Lets a sliding Spellbound piece pass through occupied squares for its charged move. */
  phaseJump?: boolean;
  /** Square occupied by the Duck Chess blocker. It stops rays and cannot be landed on. */
  blockedSquare?: Square | null;
  frozenSquares?: Square[];
};

const OFFSETS = {
  n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
  b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
  r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
  q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
  k: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]
};

export const INITIAL_FEN_BOARD = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R']
];

export function createInitialState(): GameState {
  let counter = 0;
  return {
    board: INITIAL_FEN_BOARD.map(row => row.map(char => {
      if (!char) return null;
      counter++;
      const type = char.toLowerCase() as PieceType;
      const color = char === char.toLowerCase() ? 'b' : 'w';
      return {
        type,
        color,
        id: `${color}-${type}-${counter}`
      };
    })),
    turn: 'w',
    castling: { w: {k:true, q:true}, b: {k:true, q:true} },
    enPassant: null,
    halfMoves: 0,
    fullMoves: 1
  };
}

export function createMysteryInitialState(): GameState {
  const state = createInitialState();
  for (let c = 0; c < 8; c++) {
    if (c === 0 || c === 1 || c === 6 || c === 7) {
      state.board[1][c] = null; // Black pawns
      state.board[6][c] = null; // White pawns
    }
  }
  return state;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function getPseudoLegalMoves(state: GameState, r: number, c: number, options: GameOptions = {}): Move[] {
  const piece = state.board[r][c];
  if (!piece) return [];
  const moves: Move[] = [];
  const color = piece.color;
  const dir = color === 'w' ? -1 : 1;
  const startRow = color === 'w' ? 6 : 1;
  const isBlocked = (tr: number, tc: number) => options.blockedSquare?.r === tr && options.blockedSquare?.c === tc;
  
  const isFrozen = options.frozenSquares?.some(sq => sq.r === r && sq.c === c);
  if (isFrozen) return [];

  const addMove = (tr: number, tc: number, captured?: Piece) => {
    if (isBlocked(tr, tc)) return;
    if (piece.type === 'p' && (tr === 0 || tr === 7)) {
      moves.push({ from: {r, c}, to: {r: tr, c: tc}, captured, promotion: 'q' });
      moves.push({ from: {r, c}, to: {r: tr, c: tc}, captured, promotion: 'r' });
      moves.push({ from: {r, c}, to: {r: tr, c: tc}, captured, promotion: 'b' });
      moves.push({ from: {r, c}, to: {r: tr, c: tc}, captured, promotion: 'n' });
    } else {
      moves.push({ from: {r, c}, to: {r: tr, c: tc}, captured });
    }
  };

  const isJumpSq = (tr: number, tc: number) => options.jumpSquare?.r === tr && options.jumpSquare?.c === tc;

  if (piece.type === 'p') {
    if (inBounds(r + dir, c) && !state.board[r + dir][c] && !isBlocked(r + dir, c)) {
      addMove(r + dir, c);
      if (r === startRow && !state.board[r + dir * 2][c] && !isBlocked(r + dir * 2, c)) {
        addMove(r + dir * 2, c);
      }
    }
    if (inBounds(r + dir, c - 1)) {
      const target = state.board[r + dir][c - 1];
      if (target && target.color !== color) addMove(r + dir, c - 1, target);
      else if (state.enPassant?.r === r + dir && state.enPassant?.c === c - 1) {
        // En-passant target pawn is physically on the same rank (r), adjacent column (c - 1)
        const epPawn = state.board[r][c - 1];
        if (epPawn && epPawn.color !== color && epPawn.type === 'p') {
          addMove(r + dir, c - 1, { type: 'p', color: color === 'w' ? 'b' : 'w'});
        }
      }
    }
    if (inBounds(r + dir, c + 1)) {
      const target = state.board[r + dir][c + 1];
      if (target && target.color !== color) addMove(r + dir, c + 1, target);
      else if (state.enPassant?.r === r + dir && state.enPassant?.c === c + 1) {
        // En-passant target pawn is physically on the same rank (r), adjacent column (c + 1)
        const epPawn = state.board[r][c + 1];
        if (epPawn && epPawn.color !== color && epPawn.type === 'p') {
          addMove(r + dir, c + 1, { type: 'p', color: color === 'w' ? 'b' : 'w'});
        }
      }
    }
  } else if (piece.type === 'n' || piece.type === 'k') {
    for (const [dr, dc] of OFFSETS[piece.type]) {
      const tr = r + dr, tc = c + dc;
      if (inBounds(tr, tc)) {
        const target = state.board[tr][tc];
        if (!target || target.color !== color || isJumpSq(tr, tc)) {
          if (!target || target.color !== color) {
            addMove(tr, tc, target || undefined);
          }
        }
      }
    }
    if (piece.type === 'k') {
      const castlingBits = state.castling[color];
      const homeRow = color === 'w' ? 7 : 0;
      const kingOnHomeSquare = r === homeRow && c === 4;
      const kingRook = state.board[homeRow][7];
      const queenRook = state.board[homeRow][0];
      if (kingOnHomeSquare && castlingBits.k && kingRook?.type === 'r' && kingRook.color === color && !state.board[r][5] && !state.board[r][6] && !isBlocked(r, 5) && !isBlocked(r, 6)) {
        moves.push({ from: {r, c}, to: {r, c: c + 2} });
      }
      if (kingOnHomeSquare && castlingBits.q && queenRook?.type === 'r' && queenRook.color === color && !state.board[r][1] && !state.board[r][2] && !state.board[r][3] && !isBlocked(r, 1) && !isBlocked(r, 2) && !isBlocked(r, 3)) {
        moves.push({ from: {r, c}, to: {r, c: c - 2} });
      }
    }
  } else {
    for (const [dr, dc] of OFFSETS[piece.type]) {
      let tr = r + dr, tc = c + dc;
      while (inBounds(tr, tc)) {
        if (isBlocked(tr, tc)) break;
        const target = state.board[tr][tc];
        const jump = isJumpSq(tr, tc);
        if (!target) {
          addMove(tr, tc);
        } else {
          if (options.phaseJump) {
            tr += dr;
            tc += dc;
            continue;
          }
          if (target.color !== color) addMove(tr, tc, target);
          if (!jump) break;
        }
        tr += dr;
        tc += dc;
      }
    }
  }
  return moves;
}

/** Applies a move only when it exactly matches the current side's generated legal moves. */
export function applyLegalMove(state: GameState, move: Move, options: GameOptions = {}): GameState | null {
  const validSquare = (square: Square) => Number.isInteger(square?.r) && Number.isInteger(square?.c) && square.r >= 0 && square.r < 8 && square.c >= 0 && square.c < 8;
  if (!move || !validSquare(move.from) || !validSquare(move.to)) return null;
  const piece = state.board[move.from.r]?.[move.from.c];
  if (!piece || piece.color !== state.turn) return null;
  if (move.promotion !== undefined && !(['q', 'r', 'b', 'n'] as PieceType[]).includes(move.promotion)) return null;
  const legal = getLegalMoves(state, move.from.r, move.from.c, options).find(candidate =>
    candidate.to.r === move.to.r && candidate.to.c === move.to.c && candidate.promotion === move.promotion
  );
  return legal ? applyMove(state, legal) : null;
}

export function applyMove(state: GameState, move: Move): GameState {
  const newBoard = state.board.map(row => [...row]);
  const oldPiece = newBoard[move.from.r][move.from.c]!;
  // Clone piece to preserve immutability in historical entries and state updates
  const p = { ...oldPiece };
  newBoard[move.from.r][move.from.c] = null;
  newBoard[move.to.r][move.to.c] = p;

  if (move.promotion) p.type = move.promotion;

  let newEnPassant = null;
  if (p.type === 'p' && Math.abs(move.from.r - move.to.r) === 2) {
    newEnPassant = { r: (move.from.r + move.to.r) / 2, c: move.from.c };
  }
  if (p.type === 'p' && move.from.c !== move.to.c && !state.board[move.to.r][move.to.c]) {
    newBoard[move.from.r][move.to.c] = null;
  }
  if (p.type === 'k' && Math.abs(move.from.c - move.to.c) === 2) {
    if (move.to.c > move.from.c) {
      const rook = newBoard[move.to.r][7];
      newBoard[move.to.r][5] = rook ? { ...rook } : null;
      newBoard[move.to.r][7] = null;
    } else {
      const rook = newBoard[move.to.r][0];
      newBoard[move.to.r][3] = rook ? { ...rook } : null;
      newBoard[move.to.r][0] = null;
    }
  }

  const castling = JSON.parse(JSON.stringify(state.castling));
  if (p.type === 'k') {
    castling[p.color].k = false;
    castling[p.color].q = false;
  }
  if (p.type === 'r') {
    if (move.from.c === 0 && move.from.r === (p.color==='w'?7:0)) castling[p.color].q = false;
    if (move.from.c === 7 && move.from.r === (p.color==='w'?7:0)) castling[p.color].k = false;
  }
  const cap = move.to;
  if (state.board[cap.r][cap.c]?.type === 'r') {
    if (cap.c === 0 && cap.r === 0) castling.b.q = false;
    if (cap.c === 7 && cap.r === 0) castling.b.k = false;
    if (cap.c === 0 && cap.r === 7) castling.w.q = false;
    if (cap.c === 7 && cap.r === 7) castling.w.k = false;
  }

  return {
    board: newBoard,
    turn: state.turn === 'w' ? 'b' : 'w',
    castling,
    enPassant: newEnPassant,
    halfMoves: (p.type === 'p' || state.board[move.to.r][move.to.c]) ? 0 : state.halfMoves + 1,
    fullMoves: state.turn === 'b' ? state.fullMoves + 1 : state.fullMoves
  };
}

export function isCheck(state: GameState, color: Color, options: GameOptions = {}): boolean {
  let kr = -1, kc = -1;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p?.type === 'k' && p.color === color) {
        kr = r; kc = c; break;
      }
    }
  }
  if (kr === -1) return true;

  const opp = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p?.color === opp) {
        const pMoves = getPseudoLegalMoves(state, r, c, options);
        if (pMoves.some(m => m.to.r === kr && m.to.c === kc)) return true;
      }
    }
  }
  return false;
}

export function getLegalMoves(state: GameState, r: number, c: number, options: GameOptions = {}): Move[] {
  const p = state.board[r][c];
  if (!p) return [];

  const pseudo = getPseudoLegalMoves(state, r, c, options);
  if (options.ignoreCheck) return pseudo;

  const color = p.color;
  return pseudo.filter(m => {
    if (p.type === 'k' && Math.abs(m.from.c - m.to.c) === 2) {
      if (isCheck(state, color, options)) return false;
      const step = m.to.c > m.from.c ? 1 : -1;
      const midState = applyMove(state, { from: m.from, to: { r: m.from.r, c: m.from.c + step } });
      if (isCheck({ ...midState, turn: state.turn }, color, options)) return false;
    }
    const nextState = applyMove(state, m);
    return !isCheck(nextState, color, options);
  });
}

export function stateToFEN(state: GameState): string {
  const rows: string[] = [];
  for (let r = 0; r < 8; r++) {
    let emptyCount = 0;
    let rowStr = "";
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p) {
        if (emptyCount > 0) {
          rowStr += emptyCount;
          emptyCount = 0;
        }
        const char = p.type;
        rowStr += p.color === 'w' ? char.toUpperCase() : char.toLowerCase();
      } else {
        emptyCount++;
      }
    }
    if (emptyCount > 0) {
      rowStr += emptyCount;
    }
    rows.push(rowStr);
  }
  const boardPart = rows.join('/');
  const turnPart = state.turn;
  
  // Castling
  let castlingStr = "";
  if (state.castling?.w?.k) castlingStr += "K";
  if (state.castling?.w?.q) castlingStr += "Q";
  if (state.castling?.b?.k) castlingStr += "k";
  if (state.castling?.b?.q) castlingStr += "q";
  if (castlingStr === "") castlingStr = "-";

  // En passant
  let epStr = "-";
  if (state.enPassant) {
    const file = String.fromCharCode(97 + state.enPassant.c);
    const rank = 8 - state.enPassant.r;
    epStr = `${file}${rank}`;
  }

  const halfMoves = state.halfMoves ?? 0;
  const fullMoves = state.fullMoves ?? 1;

  return `${boardPart} ${turnPart} ${castlingStr} ${epStr} ${halfMoves} ${fullMoves}`;
}

export function isCheckmate(state: GameState, options: GameOptions = {}): boolean {
  if (options.ignoreCheck) return false;
  try {
    const fen = stateToFEN(state);
    const chess = new Chess(fen);
    return chess.isCheckmate();
  } catch (e) {
    return isCheckmateFallback(state, options);
  }
}

function isCheckmateFallback(state: GameState, options: GameOptions = {}): boolean {
  if (options.ignoreCheck) return false;
  if (!isCheck(state, state.turn, options)) return false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.board[r][c]?.color === state.turn) {
        if (getLegalMoves(state, r, c, options).length > 0) return false;
      }
    }
  }
  return true;
}

export function moveToSAN(state: GameState, move: Move, nextState?: GameState, options: GameOptions = {}): string {
  const p = state.board[move.from.r][move.from.c];
  if (!p) return "";

  // Castling
  if (p.type === 'k' && Math.abs(move.from.c - move.to.c) === 2) {
    if (move.to.c > move.from.c) return "O-O";
    return "O-O-O";
  }

  const destSq = `${String.fromCharCode(97 + move.to.c)}${8 - move.to.r}`;
  const isCapture = !!state.board[move.to.r][move.to.c] || (p.type === 'p' && move.to.c !== move.from.c);
  
  let pieceStr = p.type === 'p' ? '' : p.type.toUpperCase();
  
  // Basic disambiguation: if another piece of same type and color can move to the same square
  let disambiguation = "";
  if (p.type !== 'p') {
    let ambiguous = false;
    let sameFile = false;
    let sameRank = false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (r === move.from.r && c === move.from.c) continue;
        const otherP = state.board[r][c];
        if (otherP && otherP.type === p.type && otherP.color === p.color) {
          const moves = getLegalMoves(state, r, c, options);
          if (moves.some(m => m.to.r === move.to.r && m.to.c === move.to.c)) {
            ambiguous = true;
            if (c === move.from.c) sameFile = true;
            if (r === move.from.r) sameRank = true;
          }
        }
      }
    }

    if (ambiguous) {
      if (!sameFile) {
        disambiguation = String.fromCharCode(97 + move.from.c);
      } else if (!sameRank) {
        disambiguation = `${8 - move.from.r}`;
      } else {
        disambiguation = `${String.fromCharCode(97 + move.from.c)}${8 - move.from.r}`;
      }
    }
  }

  let moveStr = "";
  if (p.type === 'p') {
    if (isCapture) {
      moveStr = `${String.fromCharCode(97 + move.from.c)}x${destSq}`;
    } else {
      moveStr = destSq;
    }
  } else {
    moveStr = `${pieceStr}${disambiguation}${isCapture ? 'x' : ''}${destSq}`;
  }

  if (move.promotion) {
    moveStr += `=${move.promotion.toUpperCase()}`;
  }

  let finalState = nextState;
  if (!finalState) {
    finalState = applyMove(state, move);
  }

  if (!options.ignoreCheck) {
    if (isCheckmate(finalState)) {
      moveStr += '#';
    } else if (isCheck(finalState, finalState.turn)) {
      moveStr += '+';
    }
  }

  return moveStr;
}

export function isStalemate(state: GameState, options: GameOptions = {}): boolean {
  if (options.ignoreCheck) return false;
  try {
    const fen = stateToFEN(state);
    const chess = new Chess(fen);
    return chess.isStalemate();
  } catch (e) {
    return isStalemateFallback(state, options);
  }
}

function isStalemateFallback(state: GameState, options: GameOptions = {}): boolean {
  if (options.ignoreCheck) return false;
  if (isCheck(state, state.turn, options)) return false;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (state.board[r][c]?.color === state.turn) {
        if (getLegalMoves(state, r, c, options).length > 0) return false;
      }
    }
  }
  return true;
}

export function getMaterialState(state: GameState, isMystery: boolean = false) {
  const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const initialCounts = isMystery 
    ? { p: 4, n: 2, b: 2, r: 2, q: 1 }
    : { p: 8, n: 2, b: 2, r: 2, q: 1 };
    
  const currentCounts = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
  };
  
  let wMaterial = 0;
  let bMaterial = 0;
  
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = state.board[r][c];
      if (p && p.type !== 'k') {
        currentCounts[p.color][p.type as keyof typeof currentCounts['w']]++;
        if (p.color === 'w') wMaterial += PIECE_VALUES[p.type as keyof typeof PIECE_VALUES];
        if (p.color === 'b') bMaterial += PIECE_VALUES[p.type as keyof typeof PIECE_VALUES];
      }
    }
  }
  
  const captured = {
    w: [] as import('./engine').PieceType[], // captured BY white (meaning black pieces)
    b: [] as import('./engine').PieceType[]
  };
  
  for (const t of ['q','r','b','n','p'] as const) {
    const missingBlack = Math.max(0, initialCounts[t] - currentCounts.b[t]);
    for(let i=0; i<missingBlack; i++) captured.w.push(t);
    
    const missingWhite = Math.max(0, initialCounts[t] - currentCounts.w[t]);
    for(let i=0; i<missingWhite; i++) captured.b.push(t);
  }
  
  return {
    capturedByWhite: captured.w, // Black pieces captured by White
    capturedByBlack: captured.b, // White pieces captured by Black
    wAdvantage: Math.max(0, wMaterial - bMaterial),
    bAdvantage: Math.max(0, bMaterial - wMaterial)
  };
}
