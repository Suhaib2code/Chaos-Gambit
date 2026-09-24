import { useState, useEffect, useRef } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { MatchSetup } from "../components/MatchSetup";
import { GameState, createInitialState, Move, getLegalMoves, applyMove, isCheckmate, isStalemate, moveToSAN, getMaterialState, PieceType } from "../game/engine";
import { Button } from "../components/ui";
import { ArrowLeft, RotateCcw, Play, Pause, List as ListIcon, Undo2 } from "lucide-react";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";
import { GameResultOverlay } from "../components/GameResultOverlay";
import { AiStrength, chooseAiMove, summarizeGame } from "../game/ai";
import { saveArchivedGame } from "../game/archive";

interface ClassicModeProps {
  onBack: () => void;
  classicRules?: { timeMinutes: number; incrementSeconds: number };
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isValidGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<GameState>;
  if (!Array.isArray(candidate.board) || candidate.board.length !== 8 || !candidate.board.every(row =>
    Array.isArray(row) && row.length === 8 && row.every(piece => piece === null || (
      !!piece && typeof piece === "object" && ["p", "n", "b", "r", "q", "k"].includes(String((piece as any).type)) &&
      ((piece as any).color === "w" || (piece as any).color === "b")
    ))
  )) return false;
  return (candidate.turn === "w" || candidate.turn === "b") &&
    Number.isInteger(candidate.halfMoves) && Number.isInteger(candidate.fullMoves) &&
    !!candidate.castling && ["w", "b"].every(color => {
      const rights = candidate.castling?.[color as "w" | "b"];
      return !!rights && typeof rights.k === "boolean" && typeof rights.q === "boolean";
    }) && (candidate.enPassant === null || (
      !!candidate.enPassant && Number.isInteger(candidate.enPassant.r) && Number.isInteger(candidate.enPassant.c) &&
      candidate.enPassant.r >= 0 && candidate.enPassant.r < 8 && candidate.enPassant.c >= 0 && candidate.enPassant.c < 8
    ));
}

function isValidClassicSave(value: unknown): value is Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const save = value as Record<string, any>;
  const validClock = (time: unknown) => typeof time === "number" && Number.isFinite(time) && time >= 0 && time <= 7 * 24 * 60 * 60 * 1000;
  return isValidGameState(save.state) && save.isGameOver === false && Array.isArray(save.moveHistory) &&
    save.moveHistory.length > 0 && save.moveHistory.length <= 10000 && save.moveHistory.every((move: unknown) => typeof move === "string" && move.length <= 100) &&
    validClock(save.whiteTime) && validClock(save.blackTime) &&
    typeof save.timeMs === "number" && Number.isFinite(save.timeMs) && (save.timeMs === -1 || (save.timeMs >= 60000 && save.timeMs <= 180 * 60000)) &&
    typeof save.bonusMs === "number" && Number.isFinite(save.bonusMs) && save.bonusMs >= 0 && save.bonusMs <= 30000 &&
    (save.historyStates === undefined || (Array.isArray(save.historyStates) && save.historyStates.length <= 10001 && save.historyStates.every(isValidGameState))) &&
    (save.aiColor === undefined || save.aiColor === null || save.aiColor === "w" || save.aiColor === "b") &&
    (save.aiStrength === undefined || ["casual", "balanced", "strong"].includes(save.aiStrength));
}

export function ClassicMode({ onBack, classicRules = { timeMinutes: 10, incrementSeconds: 0 } }: ClassicModeProps) {
  const [timeControl, setTimeControl] = useState<number | null>(() => classicRules.timeMinutes * 60_000);
  const [bonusTime, setBonusTime] = useState<number>(() => classicRules.incrementSeconds);
  const [isStarted, setIsStarted] = useState(false);
  const [savedGameData, setSavedGameData] = useState<any | null>(null);
  const [showSavedGamePrompt, setShowSavedGamePrompt] = useState<boolean>(false);
  const [activeResumeGame, setActiveResumeGame] = useState<any | null>(null);
  const [opponent, setOpponent] = useState<'local' | 'ai'>('local');
  const [humanColor, setHumanColor] = useState<'w' | 'b'>('w');
  const [aiStrength, setAiStrength] = useState<AiStrength>('balanced');
  const timeOptions = [...new Set([1, 3, 5, 10, 15, 30, classicRules.timeMinutes])]
    .sort((a, b) => a - b)
    .map(minutes => ({ label: `${minutes} Min`, value: minutes * 60_000 }));

  useEffect(() => {
    const saved = localStorage.getItem("classic_saved_game");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isValidClassicSave(parsed)) {
          setSavedGameData(parsed);
          setShowSavedGamePrompt(true);
        } else {
          localStorage.removeItem("classic_saved_game");
        }
      } catch {
        localStorage.removeItem("classic_saved_game");
      }
    }
  }, []);

  if (showSavedGamePrompt && savedGameData) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0c0c0e] via-[#15151c] to-[#0c0c0e]">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <div className="z-10 flex flex-col items-center justify-center p-8 max-w-md mx-auto h-full animate-in fade-in duration-300 w-full text-center">
          
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight mb-3">
              Paused Game Found
            </h1>
            <p className="text-slate-400 text-base">You have a classic game in progress. Would you like to resume or start fresh?</p>
          </div>

          <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl mb-8 text-left">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Saved Match Info</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">White Time</span>
                <span className="text-2xl font-black text-white font-mono">{formatTime(savedGameData.whiteTime)}</span>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Black Time</span>
                <span className="text-2xl font-black text-white font-mono">{formatTime(savedGameData.blackTime)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Time Format:</span>
                <span className="font-semibold text-white">
                  {savedGameData.timeMs === -1 ? "Untimed" : `${Math.round(savedGameData.timeMs / 60000)}m + ${Math.round(savedGameData.bonusMs / 1000)}s`}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 py-1.5">
                <span className="text-slate-400">Current Turn:</span>
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${savedGameData.state.turn === 'w' ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,1)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]'}`} />
                  {savedGameData.state.turn === 'w' ? 'White' : 'Black'}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Moves Played:</span>
                <span className="font-semibold text-white">
                  {savedGameData.moveHistory?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-4">
            <button 
              onClick={() => {
                setActiveResumeGame(savedGameData);
                setTimeControl(savedGameData.timeMs);
                setBonusTime(savedGameData.bonusMs / 1000);
                setOpponent(savedGameData.aiColor ? 'ai' : 'local');
                if (savedGameData.aiColor) setHumanColor(savedGameData.aiColor === 'w' ? 'b' : 'w');
                if (savedGameData.aiStrength) setAiStrength(savedGameData.aiStrength);
                setIsStarted(true);
                setShowSavedGamePrompt(false);
              }}
              className="w-full py-4 text-base flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-widest shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)] transition-all duration-300 hover:scale-[1.02]"
            >
              <Play className="w-5 h-5 mr-2 fill-current" /> RESUME GAME
            </button>

            <button 
              onClick={() => {
                localStorage.removeItem("classic_saved_game");
                setSavedGameData(null);
                setShowSavedGamePrompt(false);
              }}
              className="w-full py-4 text-base flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold tracking-widest transition-all duration-300 hover:scale-[1.02]"
            >
              START NEW GAME
            </button>
            
            <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white group mt-2">
              <ArrowLeft className="w-5 h-5 mr-1 transition-transform group-hover:-translate-x-1" /> Back to modes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return <MatchSetup
      title="Classic Clash"
      subtitle="A clean board. A ticking clock. Make every move count."
      eyebrow="SET THE TERMS OF PLAY"
      variant="classic"
      timeControl={timeControl}
      timeOptions={timeOptions}
      onTimeControlChange={(value) => { setTimeControl(value); if (value === -1) setBonusTime(0); }}
      bonusTime={bonusTime}
      bonusOptions={[...new Set([0, 1, 2, 5, 10, 15, 30, classicRules.incrementSeconds])].sort((a, b) => a - b)}
      onBonusTimeChange={setBonusTime}
      opponent={opponent}
      onOpponentChange={setOpponent}
      opponentDetails={<div className="setup-ai-options">
        <label>Play as<select value={humanColor} onChange={event => setHumanColor(event.target.value as 'w' | 'b')}><option value="w">White (move first)</option><option value="b">Black</option></select></label>
        <label>Computer strength<select value={aiStrength} onChange={event => setAiStrength(event.target.value as AiStrength)}><option value="casual">Casual · one-move lookahead</option><option value="balanced">Balanced · two-ply search</option><option value="strong">Strong · three-ply, narrowed search</option></select></label>
        <p>Computer play uses this app’s lightweight local search.</p>
      </div>}
      onStart={() => setIsStarted(true)}
      onBack={onBack}
    />;
  }

  return (
    <ClassicGame 
      timeMs={timeControl!} 
      bonusMs={bonusTime * 1000} 
      onBack={onBack} 
      initialSavedGame={activeResumeGame} 
      aiColor={opponent === 'ai' ? (humanColor === 'w' ? 'b' : 'w') : null}
      aiStrength={aiStrength}
    />
  );
}

function ClassicGame({ 
  timeMs, 
  bonusMs, 
  onBack, 
  initialSavedGame,
  aiColor,
  aiStrength
}: { 
  timeMs: number; 
  bonusMs: number; 
  onBack: () => void; 
  initialSavedGame?: any,
  aiColor: 'w' | 'b' | null,
  aiStrength: AiStrength
}) {
  const [state, setState] = useState<GameState>(
    initialSavedGame ? initialSavedGame.state : createInitialState()
  );
  const [historyStates, setHistoryStates] = useState<GameState[]>(() => {
    if (initialSavedGame && initialSavedGame.historyStates) {
      return initialSavedGame.historyStates;
    }
    return [initialSavedGame ? initialSavedGame.state : createInitialState()];
  });
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<{r:number, c:number} | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>(
    initialSavedGame ? initialSavedGame.moveHistory : []
  );
  const [showLog, setShowLog] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  
  const [whiteTime, setWhiteTime] = useState(
    initialSavedGame ? initialSavedGame.whiteTime : timeMs
  );
  const [blackTime, setBlackTime] = useState(
    initialSavedGame ? initialSavedGame.blackTime : timeMs
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(initialSavedGame ? true : false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const startedAtRef = useRef<string>(initialSavedGame?.startedAt ?? new Date().toISOString());
  const archiveIdRef = useRef<string>(initialSavedGame?.archiveId ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const archivedIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Autosave whenever major game values change (excluding constant timer ticks to avoid disk overhead)
    if (isGameOver || moveHistory.length === 0) {
      localStorage.removeItem("classic_saved_game");
    } else {
      // Safely preserve only valid in-progress games with at least 1 move
      const savedData = {
        state,
        whiteTime,
        blackTime,
        moveHistory,
        timeMs,
        bonusMs,
        isPaused,
        historyStates,
        aiColor,
        aiStrength,
        startedAt: startedAtRef.current,
        archiveId: archiveIdRef.current
      };
      localStorage.setItem("classic_saved_game", JSON.stringify(savedData));
    }
  }, [state, moveHistory, isGameOver, isPaused, timeMs, bonusMs, historyStates, aiColor, aiStrength]);

  useEffect(() => {
    if (!isGameOver || !status || archivedIdRef.current === archiveIdRef.current) return;
    const result = /^White wins/i.test(status) ? '1-0' : /^Black wins/i.test(status) ? '0-1' : /draw/i.test(status) ? '1/2-1/2' : '*';
    const termination = /checkmate/i.test(status) ? 'checkmate' : /stalemate/i.test(status) ? 'stalemate' : /time/i.test(status) ? 'time forfeit' : /resign/i.test(status) ? 'resignation' : status;
    const initialState = historyStates[0] ?? createInitialState();
    const plies = moveHistory.flatMap((notation, index) => {
      const plyState = historyStates[index + 1];
      return plyState ? [{ notation, state: plyState, action: 'move' as const }] : [];
    });
    const gameId = archiveIdRef.current;
    const saved = saveArchivedGame({
      id: gameId,
      mode: 'classic',
      title: 'Chaos Gambit Classic',
      players: {
        white: aiColor === 'w' ? `Computer (${aiStrength})` : aiColor === 'b' ? 'You' : 'Player 1',
        black: aiColor === 'b' ? `Computer (${aiStrength})` : aiColor === 'w' ? 'You' : 'Player 2',
      },
      startedAt: startedAtRef.current,
      endedAt: new Date().toISOString(),
      result,
      termination,
      initialState,
      plies,
    });
    // saveArchivedGame is idempotent by ID; remember the attempt to avoid rerender retries.
    if (saved) archivedIdRef.current = gameId;
  }, [isGameOver, status, moveHistory, historyStates, aiColor, aiStrength]);

  useEffect(() => {
    if (isGameOver || isPaused || timeMs === -1) return;
    const interval = setInterval(() => {
      if (state.turn === 'w') {
        setWhiteTime(t => {
          if (t <= 100) { setIsGameOver(true); setStatus("Black wins on time!"); return 0; }
          return t - 100;
        });
      } else {
        setBlackTime(t => {
          if (t <= 100) { setIsGameOver(true); setStatus("White wins on time!"); return 0; }
          return t - 100;
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [state.turn, isGameOver, isPaused, timeMs]);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [moveHistory, showLog]);

  const commitMove = (move: Move) => {
    const nextState = applyMove(state, move);
    const san = moveToSAN(state, move, nextState);
    setMoveHistory(prev => [...prev, san]);
    setHistoryStates(prev => [...prev, nextState]);
    setState(nextState);
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsAiThinking(false);
    if (timeMs !== -1) {
      if (state.turn === 'w') setWhiteTime(t => t + bonusMs);
      else setBlackTime(t => t + bonusMs);
    }
    checkGameEnd(nextState);
  };

  const handleSquareClick = (r: number, c: number, promotion?: PieceType) => {
    if (isGameOver || isPaused || selectedMoveIndex !== null || state.turn === aiColor) return;
    
    // check if clicked a legal move
    const move = legalMoves.find(m => m.to.r === r && m.to.c === c && (!m.promotion || m.promotion === promotion));
    if (move) {
      commitMove(move);
      return;
    }

    // select a piece
    const p = state.board[r][c];
    if (p && p.color === state.turn) {
      setSelectedSquare({r, c});
      setLegalMoves(getLegalMoves(state, r, c));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const checkGameEnd = (st: GameState) => {
    if (isCheckmate(st)) {
      setIsGameOver(true);
      setStatus(`${st.turn === 'w' ? 'Black' : 'White'} wins by Checkmate!`);
    } else if (isStalemate(st)) {
      setIsGameOver(true);
      setStatus("Draw by Stalemate.");
    }
  };

  useEffect(() => {
    if (!aiColor || state.turn !== aiColor || isPaused || isGameOver || selectedMoveIndex !== null) {
      setIsAiThinking(false);
      return;
    }
    setIsAiThinking(true);
    const timer = window.setTimeout(() => {
      const move = chooseAiMove(state, aiStrength);
      if (move) commitMove(move);
      else setIsAiThinking(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [state, aiColor, aiStrength, isPaused, isGameOver, selectedMoveIndex]);

  const restart = () => {
    const freshState = createInitialState();
    startedAtRef.current = new Date().toISOString();
    archiveIdRef.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    archivedIdRef.current = null;
    setState(freshState);
    setHistoryStates([freshState]);
    setSelectedMoveIndex(null);
    setWhiteTime(timeMs);
    setBlackTime(timeMs);
    setIsGameOver(false);
    setIsPaused(false);
    setStatus(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
  };

  const handleBackMenu = () => {
    if (!isGameOver && moveHistory.length > 0) {
      const savedData = {
        state,
        whiteTime,
        blackTime,
        moveHistory,
        timeMs,
        bonusMs,
        isPaused: true,
        historyStates,
        aiColor,
        aiStrength,
        startedAt: startedAtRef.current,
        archiveId: archiveIdRef.current
      };
      localStorage.setItem("classic_saved_game", JSON.stringify(savedData));
    }
    onBack();
  };

  const undo = () => {
    if (isGameOver || isPaused || moveHistory.length === 0 || selectedMoveIndex !== null) return;
    const pliesToUndo = aiColor && state.turn !== aiColor && moveHistory.length >= 2 ? 2 : 1;
    const newMoveHistory = moveHistory.slice(0, -pliesToUndo);
    const newHistoryStates = historyStates.slice(0, -pliesToUndo);
    const prevState = newHistoryStates[newHistoryStates.length - 1] || createInitialState();
    setMoveHistory(newMoveHistory);
    setHistoryStates(newHistoryStates);
    setState(prevState);
    setSelectedSquare(null);
    setLegalMoves([]);
    setSelectedMoveIndex(null);
    setStatus(null);
  };

  const isFlipped = state.turn === 'b';
  const topColor = isFlipped ? 'w' : 'b';
  const bottomColor = isFlipped ? 'b' : 'w';
  
  const isViewingHistory = selectedMoveIndex !== null;
  const displayState = isViewingHistory && historyStates[selectedMoveIndex + 1] ? historyStates[selectedMoveIndex + 1] : state;
  const material = getMaterialState(displayState, false);

  return (
    <div className="game-shell flex w-full h-screen max-h-screen overflow-hidden p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 isolate">
      
      <div className="flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto h-full w-full relative">
        <div className="game-header w-full flex justify-between items-center px-4 shrink-0">
          <Button onClick={handleBackMenu} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={undo} 
              disabled={moveHistory.length === 0 || isViewingHistory || isPaused || isGameOver || isAiThinking}
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

        <div className="game-layout flex-1 flex flex-row w-full max-w-5xl mx-auto gap-2 md:gap-6 items-center justify-center min-h-0 overflow-hidden py-2">
          <div 
            className="game-board-column flex-1 w-full flex flex-col justify-center min-h-0 h-full mx-auto"
            style={{ maxWidth: 'min(100%, calc(100vh - 220px))' }}
          >
            {isViewingHistory && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1 rounded-xl flex items-center justify-between mb-2 w-full shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Move {selectedMoveIndex + 1}
                </div>
                <Button 
                  size="sm"
                  onClick={() => setSelectedMoveIndex(null)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-7 text-xs rounded-lg px-2 border-none shadow-sm"
                >
                  Live
                </Button>
              </div>
            )}

            <div className="w-full mb-2 shrink-0">
               <PlayerBar 
                 name={aiColor === topColor ? `Computer · ${aiStrength}` : aiColor ? "You" : (topColor === 'w' ? "Noob 1" : "Noob 2")}
                 color={topColor}
                 capturedPieces={topColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
                 advantage={topColor === 'w' ? material.wAdvantage : material.bAdvantage}
                 isActive={state.turn === topColor && !isPaused && !isViewingHistory}
                 time={timeMs !== -1 ? formatTime(topColor === 'w' ? whiteTime : blackTime) : undefined}
               />
            </div>

            <div className="game-board-stage relative w-full flex-1 min-h-0 flex items-center justify-center">
              <ChessBoard
                state={displayState}
                onSquareClick={isViewingHistory || state.turn === aiColor || isAiThinking ? undefined : handleSquareClick}
                selectedSquare={isViewingHistory ? null : selectedSquare}
                legalMoves={isViewingHistory ? [] : legalMoves}
                flipped={isFlipped}
              />

              {isPaused && !status && !isViewingHistory && (
                <div role="dialog" aria-modal="true" aria-labelledby="pause-title" onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setIsPaused(false); } }} className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 rounded-sm backdrop-blur-sm">
                  <div className="bg-[#1A1A1E] p-8 rounded-2xl text-center border border-white/10 shadow-2xl flex flex-col items-center">
                    <Pause className="w-16 h-16 text-slate-400 mb-4" />
                    <h2 id="pause-title" className="text-2xl font-bold text-white tracking-widest uppercase">Paused</h2>
                    <Button autoFocus onClick={() => setIsPaused(false)} className="mt-6 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl w-full font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] tracking-wider">
                      Resume
                    </Button>
                  </div>
                </div>
              )}

              {isAiThinking && !isPaused && !isGameOver && <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 rounded-full border border-purple-300/25 bg-[#18151f]/90 px-4 py-2 text-sm font-semibold text-purple-200 shadow-lg">Computer is thinking…</div>}

              {status && <GameResultOverlay status={status} onRestart={restart} onBack={onBack}>
                {aiColor && <div className="result-recap"><h3>Game recap</h3><ul>{summarizeGame(moveHistory, historyStates, aiColor === 'w' ? 'b' : 'w').map((note, index) => <li key={index}>{note}</li>)}</ul></div>}
              </GameResultOverlay>}
            </div>

            <div className="w-full mt-2 shrink-0">
               <PlayerBar 
                 name={aiColor === bottomColor ? `Computer · ${aiStrength}` : aiColor ? "You" : (bottomColor === 'w' ? "Noob 1" : "Noob 2")}
                 color={bottomColor}
                 capturedPieces={bottomColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
                 advantage={bottomColor === 'w' ? material.wAdvantage : material.bAdvantage}
                 isActive={state.turn === bottomColor && !isPaused && !isViewingHistory}
                 time={timeMs !== -1 ? formatTime(bottomColor === 'w' ? whiteTime : blackTime) : undefined}
               />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-16 md:w-24 shrink-0">
             <Button 
               onClick={() => setIsPaused(!isPaused)} 
               disabled={isGameOver || isViewingHistory}
               className={`flex flex-col items-center justify-center w-full h-20 md:h-28 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] px-2 transition-all ${isPaused ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]' : 'bg-[#1A1A1E] hover:bg-white/10 border border-white/10 text-slate-300'}`}
             >
               {isPaused ? <Play className="w-6 h-6 mb-2 fill-current" /> : <Pause className="w-6 h-6 mb-2 fill-current" />}
               <span className="text-[10px] md:text-sm font-bold text-center leading-tight uppercase tracking-widest">
                 {isPaused ? "Play" : "Pause"}
               </span>
             </Button>
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
