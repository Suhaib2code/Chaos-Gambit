import { useState, useEffect, useRef } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { GameState, createInitialState, Move, getLegalMoves, applyMove, isCheckmate, isStalemate, moveToSAN, getMaterialState, PieceType } from "../game/engine";
import { Button } from "../components/ui";
import { ArrowLeft, RotateCcw, Play, Pause, List as ListIcon, Undo2 } from "lucide-react";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";

interface ClassicModeProps {
  onBack: () => void;
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ClassicMode({ onBack }: ClassicModeProps) {
  const [timeControl, setTimeControl] = useState<number | null>(null);
  const [bonusTime, setBonusTime] = useState<number>(0);
  const [isStarted, setIsStarted] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [savedGameData, setSavedGameData] = useState<any | null>(null);
  const [showSavedGamePrompt, setShowSavedGamePrompt] = useState<boolean>(false);
  const [activeResumeGame, setActiveResumeGame] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("classic_saved_game");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.state && !parsed.isGameOver && parsed.moveHistory && parsed.moveHistory.length > 0) {
          setHasSavedGame(true);
          setSavedGameData(parsed);
          setShowSavedGamePrompt(true);
        }
      } catch (e) {
        console.error("Error parsing saved classic game", e);
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
                setHasSavedGame(false);
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
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0c0c0e] via-[#15151c] to-[#0c0c0e]">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 w-[30vw] h-[30vw] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[25vw] h-[25vw] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <div className="z-10 flex flex-col items-center justify-center p-8 max-w-4xl mx-auto h-full animate-in fade-in duration-300 w-full text-center">
          
          <div className="mb-12">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight mb-4">
              Classic Mode
            </h1>
            <p className="text-slate-400 text-lg">Configure your match settings before starting.</p>
          </div>

          <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl mb-8">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Time Control</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4 w-full">
              {[
                { label: "1 Min", value: 1 * 60 * 1000 },
                { label: "3 Min", value: 3 * 60 * 1000 },
                { label: "5 Min", value: 5 * 60 * 1000 },
                { label: "10 Min", value: 10 * 60 * 1000 },
                { label: "Untimed", value: -1 },
              ].map((opt) => {
                const isSelected = timeControl === opt.value;
                return (
                  <button
                    key={opt.label}
                    onClick={() => {
                      setTimeControl(opt.value);
                      if (opt.value === -1) {
                        setBonusTime(0);
                      }
                    }}
                    className={`px-4 py-8 rounded-2xl font-bold transition-all duration-300 border flex flex-col items-center justify-center ${
                      isSelected 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                        : 'bg-black/20 text-white hover:bg-black/40 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {opt.value === -1 ? (
                      <>
                        <span className="text-2xl font-black">Untimed</span>
                        <span className="text-xs font-normal opacity-70 mt-1">No Clock</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-black">{opt.label.split(" ")[0]}</span>
                        <span className="text-xs font-normal opacity-70 mt-1">Min</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`w-full bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl mb-12 transition-all duration-300 ${
            timeControl === -1 
              ? 'blur-[1.5px] opacity-40 pointer-events-none' 
              : ''
          }`}>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Bonus Time per Move</h2>
            <div className="flex flex-wrap justify-center gap-3 w-full">
              {[0, 1, 2, 5].map((secs) => (
                 <button
                   key={secs}
                   onClick={() => setBonusTime(secs)}
                   className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 border ${
                     bonusTime === secs 
                       ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                       : 'bg-black/20 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                   }`}
                 >
                   {secs === 0 ? "No Increment" : `+${secs}s`}
                 </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button 
              disabled={!timeControl}
              onClick={() => setIsStarted(true)} 
              className="px-16 py-8 text-2xl flex items-center justify-center rounded-full bg-white text-black hover:bg-slate-200 font-extrabold tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:shadow-none"
            >
              <Play className="w-8 h-8 mr-3 fill-current" /> START GAME
            </button>
            
            <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white group">
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" /> Back to modes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClassicGame 
      timeMs={timeControl!} 
      bonusMs={bonusTime * 1000} 
      onBack={onBack} 
      initialSavedGame={activeResumeGame} 
    />
  );
}

function ClassicGame({ 
  timeMs, 
  bonusMs, 
  onBack, 
  initialSavedGame 
}: { 
  timeMs: number; 
  bonusMs: number; 
  onBack: () => void; 
  initialSavedGame?: any 
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
        historyStates
      };
      localStorage.setItem("classic_saved_game", JSON.stringify(savedData));
    }
  }, [state, moveHistory, isGameOver, isPaused, timeMs, bonusMs, historyStates]);

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

  const handleSquareClick = (r: number, c: number, promotion?: PieceType) => {
    if (isGameOver || isPaused || selectedMoveIndex !== null) return;
    
    // check if clicked a legal move
    const move = legalMoves.find(m => m.to.r === r && m.to.c === c && (!m.promotion || m.promotion === promotion));
    if (move) {
      const nextState = applyMove(state, move);
      const san = moveToSAN(state, move, nextState);
      setMoveHistory(prev => [...prev, san]);
      setHistoryStates(prev => [...prev, nextState]);
      setState(nextState);
      setSelectedSquare(null);
      setLegalMoves([]);
      
      if (timeMs !== -1) {
        if (state.turn === 'w') {
          setWhiteTime(t => t + bonusMs);
        } else {
          setBlackTime(t => t + bonusMs);
        }
      }

      checkGameEnd(nextState);
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

  const restart = () => {
    const freshState = createInitialState();
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
        isPaused: true
      };
      localStorage.setItem("classic_saved_game", JSON.stringify(savedData));
    }
    onBack();
  };

  const undo = () => {
    if (isGameOver || isPaused || moveHistory.length === 0 || selectedMoveIndex !== null) return;
    const newMoveHistory = moveHistory.slice(0, -1);
    const newHistoryStates = historyStates.slice(0, -1);
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
    <div className="flex w-full h-screen max-h-screen overflow-hidden p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 isolate">
      
      <div className="flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto h-full w-full relative">
        <div className="w-full flex justify-between items-center px-4 shrink-0">
          <Button onClick={handleBackMenu} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={undo} 
              disabled={moveHistory.length === 0 || isViewingHistory || isPaused || isGameOver}
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

        <div className="flex-1 flex flex-row w-full max-w-5xl mx-auto gap-2 md:gap-6 items-center justify-center min-h-0 overflow-hidden py-2">
          <div 
            className="flex-1 w-full flex flex-col justify-center min-h-0 h-full mx-auto"
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
                 name={topColor === 'w' ? "Noob 1" : "Noob 2"}
                 color={topColor}
                 capturedPieces={topColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
                 advantage={topColor === 'w' ? material.wAdvantage : material.bAdvantage}
                 isActive={state.turn === topColor && !isPaused && !isViewingHistory}
                 time={timeMs !== -1 ? formatTime(topColor === 'w' ? whiteTime : blackTime) : undefined}
               />
            </div>

            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <ChessBoard
                state={displayState}
                onSquareClick={isViewingHistory ? undefined : handleSquareClick}
                selectedSquare={isViewingHistory ? null : selectedSquare}
                legalMoves={isViewingHistory ? [] : legalMoves}
                flipped={isFlipped}
              />

              {isPaused && !status && !isViewingHistory && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 rounded-sm backdrop-blur-sm">
                  <div className="bg-[#1A1A1E] p-8 rounded-2xl text-center border border-white/10 shadow-2xl flex flex-col items-center">
                    <Pause className="w-16 h-16 text-slate-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white tracking-widest uppercase">Paused</h2>
                    <Button onClick={() => setIsPaused(false)} className="mt-6 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl w-full font-bold shadow-[0_0_15px_rgba(147,51,234,0.4)] tracking-wider">
                      Resume
                    </Button>
                  </div>
                </div>
              )}

              {status && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                  <div className="bg-[#1A1A1E] p-10 rounded-3xl text-center border border-white/10 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-8 tracking-wide">{status}</h2>
                    <Button onClick={restart} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl w-full">
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
