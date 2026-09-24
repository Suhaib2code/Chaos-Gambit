import { useRef, useState } from "react";
import { ChessBoard, type SpellJumpAnimation } from "../components/ChessBoard";
import { GameState, createInitialState, Move, getLegalMoves, applyMove, Square, Color, moveToSAN, getMaterialState, PieceType, isCheckmate, isStalemate } from "../game/engine";
import { Button } from "../components/ui";
import { ArrowLeft, RotateCcw, Snowflake, Wand2, List as ListIcon, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";
import { useVariantRules } from "../game/variantRules";
import { GameArchive } from "../components/GameArchive";
import { GameResultOverlay } from "../components/GameResultOverlay";
import { saveArchivedGame, type ArchivePly } from "../game/archive";

interface SpellModeProps {
  onBack: () => void;
}

type SpellsState = {
  freezeLeft: number;
  jumpLeft: number;
  freezeCooldown: number;
  jumpCooldown: number;
};
type FrozenSquare = { r: number; c: number; castBy: Color; remainingTurns: number; castId?: number; center?: Square };
const makeSpells = (freezeUses: number, jumpUses: number): Record<Color, SpellsState> => ({
  w: { freezeLeft: freezeUses, jumpLeft: jumpUses, freezeCooldown: 0, jumpCooldown: 0 },
  b: { freezeLeft: freezeUses, jumpLeft: jumpUses, freezeCooldown: 0, jumpCooldown: 0 },
});
const newGameId = () => globalThis.crypto?.randomUUID?.() ?? `spell-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const actionForNotation = (notation: string): ArchivePly['action'] => {
  if (notation.startsWith('[Freeze')) return 'freeze';
  if (notation.startsWith('[Jump')) return 'jump';
  return 'move';
};

function PlayerSpellsCard({
  color,
  isActiveTurn,
  spellsState,
  selectedSpell,
  setSelectedSpell,
  activeJump,
  status,
}: {
  color: Color;
  isActiveTurn: boolean;
  spellsState: SpellsState;
  selectedSpell: 'freeze' | 'jump' | null;
  setSelectedSpell: (s: 'freeze' | 'jump' | null | ((prev: 'freeze' | 'jump' | null) => 'freeze' | 'jump' | null)) => void;
  activeJump: Square | null;
  status: string | null;
}) {
  const isWhite = color === 'w';
  const label = isWhite ? "White's Spells" : "Black's Spells";

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 w-full ${
      isActiveTurn 
        ? "border-cyan-500/40 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]" 
        : "border-white/5 bg-white/[0.01] opacity-40"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-black uppercase tracking-wider ${
          isActiveTurn ? "text-cyan-400" : "text-slate-500"
        }`}>
          {label}
        </span>
        {isActiveTurn && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {/* Frostbite Spell Button */}
        <Button
          disabled={
            !isActiveTurn ||
            !!status ||
            spellsState.freezeLeft === 0 ||
            spellsState.freezeCooldown > 0 ||
            selectedSpell === 'jump' ||
            !!activeJump
          }
          onClick={() => setSelectedSpell((s) => (s === 'freeze' ? null : 'freeze'))}
          className={`h-11 rounded-lg transition-all border text-xs justify-start px-3 py-1.5 ${
            selectedSpell === 'freeze'
              ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] text-white'
              : 'bg-[#151518] border-white/5 text-cyan-400 hover:bg-white/5 disabled:opacity-50'
          }`}
        >
          <Snowflake className="w-4 h-4 mr-2 shrink-0 animate-pulse" />
          <div className="flex-1 text-left leading-tight">
            <div className="font-bold">{spellsState.freezeLeft} Frostbite</div>
            <div className="text-[9px] text-cyan-300/60 mt-0.5 font-medium">
              {spellsState.freezeCooldown > 0 ? `${spellsState.freezeCooldown} turn CD` : 'Freeze 3x3 square'}
            </div>
          </div>
        </Button>

        {/* Jump Spell Button */}
        <Button
          disabled={
            !isActiveTurn ||
            !!status ||
            spellsState.jumpLeft === 0 ||
            spellsState.jumpCooldown > 0 ||
            selectedSpell === 'freeze' ||
            !!activeJump
          }
          onClick={() => setSelectedSpell((s) => (s === 'jump' ? null : 'jump'))}
          className={`h-11 rounded-lg transition-all border text-xs justify-start px-3 py-1.5 ${
            selectedSpell === 'jump'
              ? 'bg-fuchsia-600 border-fuchsia-400 shadow-[0_0_12px_rgba(217,70,239,0.4)] text-white'
              : 'bg-[#151518] border-white/5 text-fuchsia-400 hover:bg-white/5 disabled:opacity-50'
          }`}
        >
          <Wand2 className="w-4 h-4 mr-2 shrink-0" />
          <div className="flex-1 text-left leading-tight">
            <div className="font-bold">{spellsState.jumpLeft} Phasing</div>
            <div className="text-[9px] text-fuchsia-300/60 mt-0.5 font-medium">
              {spellsState.jumpCooldown > 0 ? `${spellsState.jumpCooldown} turn CD` : 'Jump over obstacles'}
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}

type SpellHistoryState = {
  state: GameState;
  frozenSquares: FrozenSquare[];
  activeJump: Square | null;
  spells: Record<Color, SpellsState>;
};

export function SpellMode({ onBack }: SpellModeProps) {
  const { rules } = useVariantRules();
  const spellRules = rules.spell;
  const freshSpells = () => makeSpells(spellRules.freezeUses, spellRules.jumpUses);
  const gameIdRef = useRef(newGameId());
  const startedAtRef = useRef(new Date().toISOString());
  const archivedRef = useRef(false);
  const [showArchive, setShowArchive] = useState(false);
  const [state, setState] = useState<GameState>(createInitialState());
  const [historyStates, setHistoryStates] = useState<SpellHistoryState[]>(() => {
    return [{ 
      state: createInitialState(), 
      frozenSquares: [], 
      activeJump: null,
      spells: freshSpells()
    }];
  });
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<{r:number, c:number} | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [spells, setSpells] = useState<Record<Color, SpellsState>>(freshSpells);

  const [selectedSpell, setSelectedSpell] = useState<'freeze' | 'jump' | null>(null);
  const [spellNotice, setSpellNotice] = useState<string>('');
  
  const [frozenSquares, setFrozenSquares] = useState<FrozenSquare[]>([]);
  const [activeJump, setActiveJump] = useState<Square | null>(null);
  const [jumpAnimation, setJumpAnimation] = useState<SpellJumpAnimation | null>(null);
  const spellEffectId = useRef(0);
  
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  const archiveFinishedGame = (winner: Color | null, finalState: GameState, finalNotation: string, termination: string) => {
    if (archivedRef.current) return;
    const recordedPlies: ArchivePly[] = moveHistory.map((notation, index) => ({
      notation,
      action: actionForNotation(notation),
      state: historyStates[index + 1]?.state ?? createInitialState(),
    }));
    recordedPlies.push({ notation: finalNotation, action: 'move', state: finalState });
    const saved = saveArchivedGame({
      id: gameIdRef.current,
      mode: 'spellbound',
      title: 'Spellbound',
      players: { white: 'Noob 1', black: 'Noob 2' },
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString(),
      result: winner === null ? '1/2-1/2' : winner === 'w' ? '1-0' : '0-1',
      termination,
      initialState: historyStates[0]?.state ?? createInitialState(),
      plies: recordedPlies,
    });
    archivedRef.current = true;
    if (!saved) setSpellNotice('Game ended, but the local archive could not save this record. Check browser storage space.');
  };

  const handleSquareClick = (r: number, c: number, promotion?: PieceType) => {
    if (status || selectedMoveIndex !== null || jumpAnimation) return;

    if (selectedSpell === 'freeze') {
      // Apply the configured radius, clipped to the board.
      const castId = ++spellEffectId.current;
      const newFrozen = [...frozenSquares];
      for (let dr = -spellRules.freezeRadius; dr <= spellRules.freezeRadius; dr++) {
        for (let dc = -spellRules.freezeRadius; dc <= spellRules.freezeRadius; dc++) {
          const fr = r + dr; const fc = c + dc;
          if (fr >= 0 && fr < 8 && fc >= 0 && fc < 8) newFrozen.push({ r: fr, c: fc, castBy: state.turn, remainingTurns: spellRules.freezeDurationTurns, castId, center: { r, c } });
        }
      }
      setFrozenSquares(newFrozen);
      const center = `${String.fromCharCode(97 + c)}${8 - r}`;
      const affected = new Set(newFrozen.filter(sq => Math.abs(sq.r - r) <= spellRules.freezeRadius && Math.abs(sq.c - c) <= spellRules.freezeRadius).map(sq => `${sq.r},${sq.c}`)).size;
      setSpellNotice(`Frostbite cast on ${center}. ${affected} board squares frozen for ${spellRules.freezeDurationTurns} opponent turn${spellRules.freezeDurationTurns === 1 ? '' : 's'}.`);
      const nextSpells = {
        ...spells,
        [state.turn]: { ...spells[state.turn], freezeLeft: spells[state.turn].freezeLeft - 1, freezeCooldown: spellRules.freezeCooldown }
      };
      setSpells(nextSpells);
      const freezeMsg = `[Freeze ${String.fromCharCode(97+c)}${8-r}]`;
      setMoveHistory(prev => [...prev, freezeMsg]);
      setHistoryStates(prev => [...prev, {
        state: JSON.parse(JSON.stringify(state)),
        frozenSquares: newFrozen,
        activeJump: activeJump,
        spells: nextSpells
      }]);
      setSelectedSpell(null);
      return;
    }

    if (selectedSpell === 'jump') {
      const p = state.board[r][c];
      if (p && p.color === state.turn) {
        const nextJump = { r, c };
        setActiveJump(nextJump);
        setSpellNotice(`${state.turn === 'w' ? 'White' : 'Black'} phased ${state.board[r][c]?.type.toUpperCase()} on ${String.fromCharCode(97 + c)}${8-r}. It can pass through pieces on its next move, then the effect expires.`);
        const nextSpells = {
          ...spells,
          [state.turn]: { ...spells[state.turn], jumpLeft: spells[state.turn].jumpLeft - 1, jumpCooldown: spellRules.jumpCooldown }
        };
        setSpells(nextSpells);
        const jumpMsg = `[Jump ${String.fromCharCode(97+c)}${8-r}]`;
        setMoveHistory(prev => [...prev, jumpMsg]);
        setHistoryStates(prev => [...prev, {
          state: JSON.parse(JSON.stringify(state)),
          frozenSquares: [...frozenSquares],
          activeJump: nextJump,
          spells: nextSpells
        }]);
        setSelectedSpell(null);
      }
      return;
    }

    // Normal move logic
    const move = legalMoves.find(m => m.to.r === r && m.to.c === c && (!m.promotion || m.promotion === promotion));
    if (move) {
      const jumpWasActive = activeJump;
      const movingPiece = state.board[move.from.r]?.[move.from.c];
      if (jumpWasActive && movingPiece && jumpWasActive.r === move.from.r && jumpWasActive.c === move.from.c) {
        setJumpAnimation({ id: ++spellEffectId.current, from: move.from, to: move.to, piece: movingPiece.type, color: movingPiece.color });
      }
      const nextState = applyMove(state, move);
      // Check King Capture!
      const targetP = state.board[r][c];
      let san = moveToSAN(state, move, undefined, { ignoreCheck: true, jumpSquare: activeJump, phaseJump: !!jumpWasActive, frozenSquares: frozenSquares });
      if (targetP?.type === 'k') {
        san += "#";
        setStatus(`${state.turn === 'w' ? 'White' : 'Black'} Wins by King Capture!`);
        archiveFinishedGame(state.turn, nextState, san, 'King capture');
      } else if (isCheckmate(nextState)) {
        san += "#";
        setStatus(`${state.turn === 'w' ? 'White' : 'Black'} Wins by Checkmate!`);
        archiveFinishedGame(state.turn, nextState, san, 'Checkmate');
      } else if (isStalemate(nextState)) {
        setStatus('Draw by Stalemate.');
        archiveFinishedGame(null, nextState, san, 'Stalemate');
      }
      setMoveHistory(prev => [...prev, san]);

      const nextFrozen = frozenSquares.flatMap(f => {
        if (f.castBy === state.turn) return [f];
        const remainingTurns = f.remainingTurns - 1;
        return remainingTurns > 0 ? [{ ...f, remainingTurns }] : [];
      });
      const nextSpells = {
        ...spells,
        [state.turn]: {
          ...spells[state.turn],
          freezeCooldown: Math.max(0, spells[state.turn].freezeCooldown - 1),
          jumpCooldown: Math.max(0, spells[state.turn].jumpCooldown - 1)
        }
      };
      setSpells(nextSpells);
      setHistoryStates(prev => [...prev, {
        state: JSON.parse(JSON.stringify(nextState)),
        frozenSquares: nextFrozen,
        activeJump: null,
        spells: nextSpells
      }]);

      setState(nextState);
      setSelectedSquare(null);
      setLegalMoves([]);
      setActiveJump(null); // expires after turn
      if (jumpWasActive) setSpellNotice(`${state.turn === 'w' ? 'White' : 'Black'} used the phase jump. The effect has expired.`);
      else if (frozenSquares.length > nextFrozen.length) {
        setSpellNotice(nextFrozen.length === 0 ? 'The frost has melted. Frozen squares are clear.' : 'The frost recedes; remaining frozen squares are still marked on the board.');
      }

      // Clean expired frozen squares
      setFrozenSquares(nextFrozen);
      return;
    }

    const p = state.board[r][c];
    if (p && p.color === state.turn) {
      setSelectedSquare({r, c});
      setLegalMoves(getLegalMoves(state, r, c, {
        ignoreCheck: true,
        jumpSquare: activeJump,
        phaseJump: !!activeJump && activeJump.r === r && activeJump.c === c,
        frozenSquares: frozenSquares
      }));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const restart = () => {
    gameIdRef.current = newGameId();
    startedAtRef.current = new Date().toISOString();
    archivedRef.current = false;
    const freshState = createInitialState();
    setState(freshState);
    setHistoryStates([{ 
      state: freshState, 
      frozenSquares: [], 
      activeJump: null,
      spells: freshSpells()
    }]);
    setSelectedMoveIndex(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setStatus(null);
    setSpells(freshSpells());
    setFrozenSquares([]);
    setActiveJump(null);
    setJumpAnimation(null);
    setSelectedSpell(null);
    setMoveHistory([]);
    setSpellNotice('');
  };

  const undo = () => {
    if (selectedMoveIndex !== null || moveHistory.length === 0) return;
    setJumpAnimation(null);
    const newMoveHistory = moveHistory.slice(0, -1);
    const newHistoryStates = historyStates.slice(0, -1);
    const prevStateInfo = newHistoryStates[newHistoryStates.length - 1] || {
      state: createInitialState(),
      frozenSquares: [],
      activeJump: null,
      spells: freshSpells()
    };
    setMoveHistory(newMoveHistory);
    setHistoryStates(newHistoryStates);
    setState(prevStateInfo.state);
    setFrozenSquares(prevStateInfo.frozenSquares);
    setActiveJump(prevStateInfo.activeJump);
    setSpells(prevStateInfo.spells);
    setSelectedSquare(null);
    setLegalMoves([]);
    setSelectedSpell(null);
    setSelectedMoveIndex(null);
    setStatus(null);
    setSpellNotice('');
  };

  const isFlipped = state.turn === 'b';
  const topColor = isFlipped ? 'w' : 'b';
  const bottomColor = isFlipped ? 'b' : 'w';
  
  const isViewingHistory = selectedMoveIndex !== null;
  const currentView = isViewingHistory && historyStates[selectedMoveIndex + 1] ? historyStates[selectedMoveIndex + 1] : null;
  const displayState = currentView ? currentView.state : state;
  const displayFrozen = currentView ? currentView.frozenSquares : frozenSquares;
  const displayJump = currentView ? currentView.activeJump : activeJump;

  const material = getMaterialState(displayState, false);

  if (showArchive) return <GameArchive onClose={() => setShowArchive(false)} />;

  return (
    <div className="game-shell flex w-full h-screen max-h-screen overflow-hidden p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 isolate">
      <div className="flex-1 flex flex-col items-center justify-between max-w-5xl mx-auto h-full w-full relative">
        <div className="game-header w-full flex justify-between items-center px-4 shrink-0">
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-widest uppercase flex-1 text-center">
            Spellbound
          </div>
          <div className="flex gap-4 items-center">
            <Button onClick={() => setShowArchive(true)} variant="outline" className="border-cyan-500/30 text-cyan-200 hover:bg-cyan-950/40">View archive</Button>
            <Button 
              onClick={undo} 
              disabled={moveHistory.length === 0 || isViewingHistory}
              variant="outline" 
              className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4 mr-2" /> Undo
            </Button>
            <Button onClick={() => setShowLog(!showLog)} aria-expanded={showLog} aria-controls="move-log-panel" variant="outline" className="text-slate-300 border-white/10 hover:bg-white/5">
              <ListIcon className="w-4 h-4 mr-2" /> Move Log
            </Button>
            <Button onClick={restart} variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
              <RotateCcw className="w-4 h-4 mr-2" /> Restart
            </Button>
          </div>
        </div>

        {selectedSpell && !isViewingHistory && (
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-cyan-400 font-bold tracking-widest text-sm uppercase text-center shrink-0 my-1">
            {selectedSpell === 'freeze' ? '❄️ Click any square to cast a 3x3 Frostbite' : '✨ Click a friendly piece to let it Phase through others'}
          </motion.div>
        )}

        {(spellNotice || frozenSquares.length > 0 || activeJump) && !isViewingHistory && (
          <motion.div key={spellNotice} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} role="status" aria-live="polite" className="max-w-2xl w-full text-center rounded-xl border border-cyan-300/20 bg-slate-950/80 px-4 py-2 text-xs text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,.08)]">
            {spellNotice || (activeJump ? 'Phase is charged: the marked piece may pass through occupied squares for its next move.' : `${new Set(frozenSquares.map(s => `${s.r},${s.c}`)).size} squares remain frozen. Opponent turns left: ${Math.min(...frozenSquares.map(s => s.remainingTurns))}.`)}
          </motion.div>
        )}

        <div className="game-layout flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 w-full min-h-0 overflow-hidden py-2">
          
          {/* Main Board Column */}
          <div 
            className="game-board-column flex-1 flex flex-col items-center justify-center w-full min-h-0 h-full mx-auto"
            style={{ maxWidth: 'min(100%, calc(100vh - 220px))' }}
          >
            {isViewingHistory && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1 rounded-xl flex items-center justify-between mb-2 w-full shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Viewing Move {selectedMoveIndex + 1}: {moveHistory[selectedMoveIndex]}
                </div>
                <Button 
                  size="sm"
                  onClick={() => setSelectedMoveIndex(null)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-7 text-xs rounded-lg px-3 border-none shadow-sm"
                >
                  Return to Live
                </Button>
              </div>
            )}

            <div className="w-full mb-2 shrink-0">
               <PlayerBar 
                 name={topColor === 'w' ? "Noob 1" : "Noob 2"}
                 color={topColor}
                 capturedPieces={topColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
                 advantage={topColor === 'w' ? material.wAdvantage : material.bAdvantage}
                 isActive={state.turn === topColor && !isViewingHistory}
               />
            </div>

            <div className="game-board-stage relative w-full flex-1 min-h-0 flex items-center justify-center">
               <ChessBoard
                 state={displayState}
                 onSquareClick={isViewingHistory ? undefined : handleSquareClick}
                 selectedSquare={isViewingHistory ? null : selectedSquare}
                 legalMoves={isViewingHistory ? [] : legalMoves}
                 flipped={isFlipped}
                 frozenSquares={displayFrozen}
                 jumpSquare={displayJump}
                 animateSpellEffects={!isViewingHistory}
                 jumpAnimation={isViewingHistory ? null : jumpAnimation}
                 onJumpAnimationComplete={() => setJumpAnimation(null)}
               />
                
               {status && <GameResultOverlay status={status} onRestart={restart} onBack={onBack} />}
            </div>

            <div className="w-full mt-2 shrink-0">
               <PlayerBar 
                 name={bottomColor === 'w' ? "Noob 1" : "Noob 2"}
                 color={bottomColor}
                 capturedPieces={bottomColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
                 advantage={bottomColor === 'w' ? material.wAdvantage : material.bAdvantage}
                 isActive={state.turn === bottomColor && !isViewingHistory}
               />
            </div>
          </div>

          {/* Right Column with Spells aligned to Player Ranks */}
          <div className="flex flex-col sm:flex-row lg:flex-col justify-center lg:justify-between w-full lg:w-64 gap-4 lg:py-10 shrink-0">
            {/* Top Side Spells (Closer to ranks 7 & 8) */}
            <PlayerSpellsCard 
              color={topColor}
              isActiveTurn={state.turn === topColor && !isViewingHistory}
              spellsState={spells[topColor]}
              selectedSpell={selectedSpell}
              setSelectedSpell={(next) => { setSelectedSquare(null); setLegalMoves([]); setSelectedSpell(next); }}
              activeJump={activeJump}
              status={status}
            />

            {/* Bottom Side Spells (Closer to ranks 2 & 3) */}
            <PlayerSpellsCard 
              color={bottomColor}
              isActiveTurn={state.turn === bottomColor && !isViewingHistory}
              spellsState={spells[bottomColor]}
              selectedSpell={selectedSpell}
              setSelectedSpell={(next) => { setSelectedSquare(null); setLegalMoves([]); setSelectedSpell(next); }}
              activeJump={activeJump}
              status={status}
            />
          </div>

        </div>
      </div>

      <MoveLog 
        show={showLog} 
        onClose={() => setShowLog(false)} 
        moveHistory={moveHistory} 
        selectedMoveIndex={selectedMoveIndex}
        onSelectMoveIndex={setSelectedMoveIndex}
      />
    </div>
  );
}
