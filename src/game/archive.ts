import type { GameState } from './engine';

/** Offline, bounded archive for completed Chaos Gambit games. */
export const ARCHIVE_STORAGE_KEY = 'chaos-gambit:archive:v1';
export const ARCHIVE_SCHEMA_VERSION = 1;
export const MAX_ARCHIVE_GAMES = 100;
export const MAX_ARCHIVE_BYTES = 3_500_000;
export const MAX_ARCHIVE_PLIES_PER_GAME = 1_000;

export type ArchiveMode = 'classic' | 'mystery' | 'dice' | 'spellbound' | 'hill' | 'duck';
export type ArchivePly = {
  /** State after this ply. */
  state: GameState;
  /** Display notation, including bracketed special-action notation where needed. */
  notation: string;
  /** Explicit action category ensures variant actions are not exported as chess moves. */
  action?: 'move' | 'freeze' | 'jump' | 'roll' | 'reveal' | 'guess' | 'other';
  comment?: string;
  /** Duck position after this complete turn, for Duck Chess replay. */
  duckSquare?: { r: number; c: number } | null;
};
export type ArchivedGame = {
  id: string;
  mode: ArchiveMode;
  title: string;
  players: { white: string; black: string };
  startedAt: string;
  endedAt: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  termination?: string;
  initialState: GameState;
  initialDuckSquare?: { r: number; c: number } | null;
  plies: ArchivePly[];
};
type ArchiveDocument = { schemaVersion: 1; games: ArchivedGame[] };

const emptyDocument = (): ArchiveDocument => ({ schemaVersion: ARCHIVE_SCHEMA_VERSION, games: [] });
const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function validState(value: unknown): value is GameState {
  if (!isRecord(value) || !Array.isArray(value.board) || value.board.length !== 8) return false;
  if (!value.board.every(row => Array.isArray(row) && row.length === 8 && row.every(p => p === null || (isRecord(p) && ['p','n','b','r','q','k'].includes(String(p.type)) && (p.color === 'w' || p.color === 'b'))))) return false;
  if (value.turn !== 'w' && value.turn !== 'b') return false;
  if (!Number.isInteger(value.halfMoves) || !Number.isInteger(value.fullMoves)) return false;
  if (!isRecord(value.castling) || !['w','b'].every(c => isRecord(value.castling[c]) && typeof (value.castling[c] as Record<string, unknown>).k === 'boolean' && typeof (value.castling[c] as Record<string, unknown>).q === 'boolean')) return false;
  const ep = value.enPassant;
  return ep === null || (isRecord(ep) && Number.isInteger(ep.r) && Number.isInteger(ep.c) && Number(ep.r) >= 0 && Number(ep.r) < 8 && Number(ep.c) >= 0 && Number(ep.c) < 8);
}
function validSquare(value: unknown): value is { r: number; c: number } | null {
  if (value === null) return true;
  return isRecord(value) && Number.isInteger(value.r) && Number.isInteger(value.c) && Number(value.r) >= 0 && Number(value.r) < 8 && Number(value.c) >= 0 && Number(value.c) < 8;
}
function validGame(v: unknown): v is ArchivedGame {
  if (!isRecord(v) || typeof v.id !== 'string' || !['classic','mystery','dice','spellbound','hill','duck'].includes(String(v.mode)) || typeof v.title !== 'string') return false;
  if (!isRecord(v.players) || typeof v.players.white !== 'string' || typeof v.players.black !== 'string') return false;
  if (typeof v.startedAt !== 'string' || typeof v.endedAt !== 'string' || !['1-0','0-1','1/2-1/2','*'].includes(String(v.result)) || !validState(v.initialState) || !Array.isArray(v.plies)) return false;
  const initialDuckSquare: unknown = v.initialDuckSquare ?? null;
  if (v.mode === 'duck' && (!validSquare(initialDuckSquare) || (initialDuckSquare && v.initialState.board[initialDuckSquare.r][initialDuckSquare.c] !== null))) return false;
  return v.plies.length <= MAX_ARCHIVE_PLIES_PER_GAME && v.plies.every(p => {
    if (!isRecord(p) || typeof p.notation !== 'string' || p.notation.length > 500 || !validState(p.state) || (p.comment !== undefined && (typeof p.comment !== 'string' || p.comment.length > 2000))) return false;
    const duckSquare: unknown = p.duckSquare;
    return v.mode !== 'duck' || (validSquare(duckSquare) && (!duckSquare || p.state.board[duckSquare.r][duckSquare.c] === null));
  });
}
function readDocument(): ArchiveDocument {
  try {
    const raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) return emptyDocument();
    if (raw.length > MAX_ARCHIVE_BYTES) {
      localStorage.removeItem(ARCHIVE_STORAGE_KEY);
      return emptyDocument();
    }
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.schemaVersion !== ARCHIVE_SCHEMA_VERSION || !Array.isArray(value.games)) return emptyDocument();
    return { schemaVersion: ARCHIVE_SCHEMA_VERSION, games: value.games.slice(0, MAX_ARCHIVE_GAMES).filter(validGame) };
  } catch { return emptyDocument(); }
}
function writeDocument(doc: ArchiveDocument) {
  try {
    // Bound total storage too: localStorage quotas differ between browsers and profiles.
    let games = doc.games.slice(0, MAX_ARCHIVE_GAMES);
    let serialized = JSON.stringify({ schemaVersion: ARCHIVE_SCHEMA_VERSION, games });
    while (serialized.length > MAX_ARCHIVE_BYTES && games.length > 1) {
      games = games.slice(0, -1);
      serialized = JSON.stringify({ schemaVersion: ARCHIVE_SCHEMA_VERSION, games });
    }
    if (serialized.length > MAX_ARCHIVE_BYTES) return false;
    localStorage.setItem(ARCHIVE_STORAGE_KEY, serialized); return true;
  }
  catch { return false; }
}

export function listArchivedGames(): ArchivedGame[] {
  return [...readDocument().games].sort((a, b) => Date.parse(b.endedAt) - Date.parse(a.endedAt));
}
/** Adds or replaces by id. Newest games are retained; old records are evicted at the bound. */
export function saveArchivedGame(game: ArchivedGame): boolean {
  if (!validGame(game)) return false;
  const games = readDocument().games.filter(item => item.id !== game.id);
  games.unshift(game);
  return writeDocument({ schemaVersion: ARCHIVE_SCHEMA_VERSION, games: games.slice(0, MAX_ARCHIVE_GAMES) });
}
export function deleteArchivedGame(id: string): boolean {
  const doc = readDocument();
  return writeDocument({ ...doc, games: doc.games.filter(g => g.id !== id) });
}
export function updatePlyAnnotation(id: string, plyIndex: number, comment: string): boolean {
  const doc = readDocument();
  const game = doc.games.find(g => g.id === id);
  if (!game || !Number.isInteger(plyIndex) || plyIndex < 0 || plyIndex >= game.plies.length) return false;
  game.plies[plyIndex] = { ...game.plies[plyIndex], comment: comment.slice(0, 2000) };
  return writeDocument(doc);
}
function escapeTag(value: string) { return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\r\n]/g, ' '); }
function pgnComment(text: string) { return `{ ${text.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim()} }`; }
/** Exports standard notation as movetext; variant actions are explicit comments and the event is tagged. */
export function exportGamePgn(game: ArchivedGame): string {
  const variant = game.mode !== 'classic';
  const tags = [
    `[Event "${escapeTag(game.title)}"]`, `[Site "Chaos Gambit local"]`,
    `[Date "${/^\d{4}-\d{2}-\d{2}/.test(game.endedAt) ? game.endedAt.slice(0, 10).replace(/-/g, '.') : '????.??.??'}"]`,
    `[White "${escapeTag(game.players.white)}"]`, `[Black "${escapeTag(game.players.black)}"]`,
    `[Result "${game.result}"]`,
    ...(variant ? [`[Variant "Chaos Gambit ${game.mode}"]`] : []),
    ...(game.termination ? [`[Termination "${escapeTag(game.termination)}"]`] : []),
  ];
  const chunks: string[] = [];
  let priorState = game.initialState;
  game.plies.forEach((ply) => {
    const action = ply.action ?? (/^\[/.test(ply.notation) ? 'other' : 'move');
    const comment = ply.comment?.trim();
    // Only a conservative SAN alphabet may become PGN movetext. Tampered local
    // records with PGN delimiters are retained as inert comments instead.
    if (action === 'move' && /^[KQRBNabcdefgh12345678x=+#O-]+$/.test(ply.notation)) {
      if (priorState.turn === 'w') chunks.push(`${priorState.fullMoves}.`);
      chunks.push(ply.notation);
    } else {
      chunks.push(pgnComment(`${variant ? `Chaos Gambit ${game.mode}: ` : ''}${ply.notation}`));
    }
    if (comment) chunks.push(pgnComment(comment));
    priorState = ply.state;
  });
  chunks.push(game.result);
  return `${tags.join('\n')}\n\n${chunks.join(' ')}\n`;
}
