import { useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { GameState, createInitialState, Move, getLegalMoves, applyMove, Square, Color, moveToSAN, getMaterialState, PieceType } from "../game/engine";
import { Button } from "../components/ui";
import { ArrowLeft, RotateCcw, Snowflake, Wand2, List as ListIcon, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";

interface SpellModeProps {
  onBack: () => void;
}

type SpellsState = {
  freezeLeft: number;
  jumpLeft: number;
  freezeCooldown: number;
  jumpCooldown: number;
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
  frozenSquares: { r: number; c: number; castBy: Color }[];
  activeJump: Square | null;
  spells: Record<Color, SpellsState>;
};

export function SpellMode({ onBack }: SpellModeProps) {
  const [state, setState] = useState<GameState>(createInitialState());
  const [historyStates, setHistoryStates] = useState<SpellHistoryState[]>(() => {
    return [{ 
      state: createInitialState(), 
      frozenSquares: [], 
      activeJump: null,
      spells: {
        w: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 },
        b: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 }
      }
    }];
  });
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<{r:number, c:number} | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [spells, setSpells] = useState<Record<Color, SpellsState>>({
    w: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 },
    b: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 }
  });

  const [selectedSpell, setSelectedSpell] = useState<'freeze' | 'jump' | null>(null);
  
  const [frozenSquares, setFrozenSquares] = useState<{ r: number; c: number; castBy: Color }[]>([]);
  const [activeJump, setActiveJump] = useState<Square | null>(null);
  
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  const handleSquareClick = (r: number, c: number, promotion?: PieceType) => {
    if (status || selectedMoveIndex !== null) return;

    if (selectedSpell === 'freeze') {
      // Apply freeze to 3x3
      const newFrozen = [...frozenSquares];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          newFrozen.push({ r: r + dr, c: c + dc, castBy: state.turn });
        }
      }
      setFrozenSquares(newFrozen);
      const nextSpells = {
        ...spells,
        [state.turn]: { ...spells[state.turn], freezeLeft: spells[state.turn].freezeLeft - 1, freezeCooldown: 3 }
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
        const nextSpells = {
          ...spells,
          [state.turn]: { ...spells[state.turn], jumpLeft: spells[state.turn].jumpLeft - 1, jumpCooldown: 3 }
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
      // Check King Capture!
      const targetP = state.board[r][c];
      let san = moveToSAN(state, move, undefined, { ignoreCheck: true, jumpSquare: activeJump, frozenSquares: frozenSquares });
      if (targetP?.type === 'k') {
        san += "#";
        setStatus(`${state.turn === 'w' ? 'White' : 'Black'} Wins by King Capture!`);
      }
      setMoveHistory(prev => [...prev, san]);

      const nextState = applyMove(state, move);
      const nextFrozen = frozenSquares.filter(f => f.castBy === state.turn);
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
        frozenSquares: frozenSquares
      }));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const currentSpells = spells[state.turn];

  const restart = () => {
    const freshState = createInitialState();
    setState(freshState);
    setHistoryStates([{ 
      state: freshState, 
      frozenSquares: [], 
      activeJump: null,
      spells: {
        w: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 },
        b: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 }
      }
    }]);
    setSelectedMoveIndex(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setStatus(null);
    setSpells({
      w: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 },
      b: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 }
    });
    setFrozenSquares([]);
    setActiveJump(null);
    setSelectedSpell(null);
    setMoveHistory([]);
  };

  const undo = () => {
    if (selectedMoveIndex !== null || moveHistory.length === 0) return;
    const newMoveHistory = moveHistory.slice(0, -1);
    const newHistoryStates = historyStates.slice(0, -1);
    const prevStateInfo = newHistoryStates[newHistoryStates.length - 1] || {
      state: createInitialState(),
      frozenSquares: [],
      activeJump: null,
      spells: {
        w: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 },
        b: { freezeLeft: 5, jumpLeft: 2, freezeCooldown: 0, jumpCooldown: 0 }
      }
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

  return (
    <div className="flex w-full h-screen max-h-screen overflow-hidden p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 isolate">
      <div className="flex-1 flex flex-col items-center justify-between max-w-5xl mx-auto h-full w-full relative">
        <div className="w-full flex justify-between items-center px-4 shrink-0">
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500 tracking-widest uppercase flex-1 text-center">
            Spellbound
          </div>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={undo} 
              disabled={moveHistory.length === 0 || isViewingHistory}
              variant="outline" 
              className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4 mr-2" /> Undo
            </Button>
            <Button onClick={() => setShowLog(!showLog)} variant="outline" className="text-slate-300 border-white/10 hover:bg-white/5">
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

        <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 w-full min-h-0 overflow-hidden py-2">
          
          {/* Main Board Column */}
          <div 
            className="flex-1 flex flex-col items-center justify-center w-full min-h-0 h-full mx-auto"
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

            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
               <ChessBoard
                 state={displayState}
                 onSquareClick={isViewingHistory ? undefined : handleSquareClick}
                 selectedSquare={isViewingHistory ? null : selectedSquare}
                 legalMoves={isViewingHistory ? [] : legalMoves}
                 flipped={isFlipped}
                 frozenSquares={displayFrozen}
                 jumpSquare={displayJump}
               />
                
               {status && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                    <div className="bg-[#1A1A1E] p-10 rounded-3xl text-center shadow-2xl border border-white/10">
                      <h2 className="text-3xl font-bold text-white mb-8 animate-pulse tracking-wide">{status}</h2>
                      <Button onClick={restart} className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-xl w-full">
                        Play Again
                      </Button>
                    </div>
                  </div>
               )}
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
              setSelectedSpell={setSelectedSpell}
              activeJump={activeJump}
              status={status}
            />

            {/* Bottom Side Spells (Closer to ranks 2 & 3) */}
            <PlayerSpellsCard 
              color={bottomColor}
              isActiveTurn={state.turn === bottomColor && !isViewingHistory}
              spellsState={spells[bottomColor]}
              selectedSpell={selectedSpell}
              setSelectedSpell={setSelectedSpell}
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
