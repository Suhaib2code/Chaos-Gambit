import { useMemo, useState } from 'react';
import { ChessBoard } from './ChessBoard';
import { Button } from './ui';
import { deleteArchivedGame, exportGamePgn, listArchivedGames, updatePlyAnnotation, type ArchivedGame } from '../game/archive';

/** Local-only archive browser. Parent can mount this surface from its navigation. */
export function GameArchive({ onClose }: { onClose: () => void }) {
  const [games, setGames] = useState(() => listArchivedGames());
  const [selectedId, setSelectedId] = useState<string | null>(games[0]?.id ?? null);
  const [plyIndex, setPlyIndex] = useState(-1);
  const selected = useMemo(() => games.find(g => g.id === selectedId) ?? null, [games, selectedId]);
  const shownState = selected ? (plyIndex < 0 ? selected.initialState : selected.plies[plyIndex]?.state ?? selected.initialState) : null;
  const refresh = (nextSelected = selectedId) => { const next = listArchivedGames(); setGames(next); setSelectedId(nextSelected && next.some(g => g.id === nextSelected) ? nextSelected : next[0]?.id ?? null); };
  const exportPgn = (game: ArchivedGame) => {
    const blob = new Blob([exportGamePgn(game)], { type: 'application/x-chess-pgn;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `${game.mode}-${game.endedAt.slice(0, 10)}.pgn`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const editAnnotation = (index: number, comment: string) => {
    if (!selected || !updatePlyAnnotation(selected.id, index, comment)) return;
    refresh(selected.id);
  };

  return <main className="fixed inset-0 z-[70] bg-[#090b11] text-white flex flex-col">
    <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10">
      <div><p className="text-xs uppercase tracking-[.25em] text-cyan-300">Local · offline</p><h1 className="text-2xl font-black">Game archive</h1></div>
      <Button variant="outline" onClick={onClose}>Close</Button>
    </header>
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-r border-white/10 overflow-y-auto p-3 space-y-2">
        {games.length === 0 && <p className="text-slate-400 p-4">Completed games saved here will appear in this list.</p>}
        {games.map(game => <button key={game.id} onClick={() => { setSelectedId(game.id); setPlyIndex(-1); }} className={`w-full text-left p-3 rounded-xl border ${game.id === selectedId ? 'border-cyan-400/60 bg-cyan-400/10' : 'border-white/10 bg-white/[.03]'}`}>
          <span className="block font-bold">{game.title || game.mode}</span><span className="text-xs text-slate-400">{game.mode} · {new Date(game.endedAt).toLocaleString(document.documentElement.lang)}</span><span className="block text-xs mt-1">{game.players.white} vs {game.players.black} · {game.result}</span>
        </button>)}
      </aside>
      {selected && shownState ? <section className="min-h-0 overflow-y-auto p-4 md:p-7 grid lg:grid-cols-[minmax(260px,560px)_minmax(280px,1fr)] gap-6 items-start">
        <div className="space-y-3"><div className="aspect-square max-h-[min(68vh,600px)] mx-auto"><ChessBoard state={shownState} onSquareClick={() => undefined} selectedSquare={null} legalMoves={[]} disabled duckSquare={selected.mode === 'duck' ? (plyIndex < 0 ? selected.initialDuckSquare ?? null : selected.plies[plyIndex]?.duckSquare ?? null) : null} /></div>
          <div className="flex flex-wrap items-center justify-center gap-2"><Button variant="outline" onClick={() => setPlyIndex(-1)}>Start</Button><Button variant="outline" onClick={() => setPlyIndex(i => Math.max(-1, i - 1))}>Previous</Button><span className="px-2 text-sm text-slate-300">{plyIndex < 0 ? 'Initial position' : `Ply ${plyIndex + 1} of ${selected.plies.length}`}</span><Button variant="outline" onClick={() => setPlyIndex(i => Math.min(selected.plies.length - 1, i + 1))}>Next</Button><Button variant="outline" onClick={() => setPlyIndex(selected.plies.length - 1)}>End</Button></div>
          <div className="flex justify-center gap-2"><Button onClick={() => exportPgn(selected)}>Export PGN</Button><Button variant="outline" onClick={() => { if (confirm('Delete this archived game?')) { deleteArchivedGame(selected.id); refresh(); } }}>Delete</Button></div>
        </div>
        <div><h2 className="font-bold text-lg mb-1">{selected.title}</h2><p className="text-xs text-slate-400 mb-4">{selected.mode} · {selected.players.white} vs {selected.players.black} · {selected.result}</p>
          <div className="space-y-2">{selected.plies.map((ply, index) => <div key={index} className={`rounded-xl border p-3 ${index === plyIndex ? 'border-cyan-400/50 bg-cyan-950/20' : 'border-white/10 bg-white/[.02]'}`}>
            <button className="text-left w-full" onClick={() => setPlyIndex(index)}><span dir="ltr" className="font-mono text-cyan-200">{index + 1}. {ply.notation}</span>{ply.action && ply.action !== 'move' && <span className="ml-2 text-[10px] uppercase tracking-wider text-fuchsia-300">{ply.action}</span>}</button>
            <label className="block text-[10px] uppercase tracking-wider text-slate-500 mt-2">Annotation<textarea value={ply.comment ?? ''} onChange={e => editAnnotation(index, e.target.value)} maxLength={2000} rows={2} placeholder="Add a note for this ply…" className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-black/30 p-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none" /></label>
          </div>)}</div>
        </div>
      </section> : <div className="grid place-items-center text-slate-400">Select an archived game to replay.</div>}
    </div>
  </main>;
}
