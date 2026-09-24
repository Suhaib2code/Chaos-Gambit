import { useRef, useState } from "react";
import { ChessBoard } from "../components/ChessBoard";
import { GameState, createMysteryInitialState, Square, Color, Move, getLegalMoves, applyMove, isCheckmate, moveToSAN, getMaterialState, PieceType } from "../game/engine";
import { Button } from "../components/ui";
import { ArrowLeft, RotateCcw, EyeOff, UserSearch, List as ListIcon, Undo2 } from "lucide-react";
import { motion } from "motion/react";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";
import { useVariantRules } from "../game/variantRules";
import { saveArchivedGame, type ArchivePly } from "../game/archive";

interface MysteryModeProps {
  onBack: () => void;
}

type Phase = "p1_select" | "p2_select" | "interstitial" | "play";

type MysteryHistoryState = {
  state: GameState;
  p1Secret: Square | null;
  p2Secret: Square | null;
  activePlayer: Color;
  phase: Phase;
  message: string | null;
};

export function MysteryMode({ onBack }: MysteryModeProps) {
  const { rules } = useVariantRules();
  const [phase, setPhase] = useState<Phase>("interstitial");
  const [interstitialTarget, setInterstitialTarget] = useState<Phase | null>("p1_select");
  
  const [state, setState] = useState<GameState>(createMysteryInitialState());
  const matchInitialState = useRef(state);
  const matchPlies = useRef<ArchivePly[]>([]);
  const matchStartedAt = useRef(new Date().toISOString());
  const [historyStates, setHistoryStates] = useState<MysteryHistoryState[]>(() => [
    {
      state: createMysteryInitialState(),
      p1Secret: null,
      p2Secret: null,
      activePlayer: "w",
      phase: "interstitial",
      message: "White: Get ready to securely pick your piece!"
    }
  ]);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const [p1Secret, setP1Secret] = useState<Square | null>(null);
  const [p2Secret, setP2Secret] = useState<Square | null>(null);
  
  const [activePlayer, setActivePlayer] = useState<Color>("w");
  const [message, setMessage] = useState<string | null>("White: Get ready to securely pick your piece!");
  const [isGuessing, setIsGuessing] = useState(false);
  const [score, setScore] = useState({ w: 0, b: 0 });
  const [matchOver, setMatchOver] = useState(false);
  const [wrongGuessMsg, setWrongGuessMsg] = useState<string | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<{r:number, c:number} | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  const archiveMatch = (winner: Color, finalState: GameState, termination: string) => {
    const endedAt = new Date().toISOString();
    saveArchivedGame({
      id: `mystery-${matchStartedAt.current}`,
      mode: "mystery",
      title: `Mystery Piece — first to ${rules.mystery.roundsToWin}`,
      players: { white: "White", black: "Black" },
      startedAt: matchStartedAt.current,
      endedAt,
      result: winner === "w" ? "1-0" : "0-1",
      termination,
      initialState: matchInitialState.current,
      plies: [...matchPlies.current, { state: finalState, notation: `${winner === "w" ? "White" : "Black"} wins the match`, action: "other" }],
    });
  };
  const recordRoundWin = (winner: Color, messageText: string, finalState: GameState = state, termination = "Round win") => {
    const wins = score[winner] + 1;
    setScore((current) => ({ ...current, [winner]: current[winner] + 1 }));
    const wonMatch = wins >= rules.mystery.roundsToWin;
    if (wonMatch) {
      setMatchOver(true);
      archiveMatch(winner, finalState, termination);
    }
    return wonMatch ? `${messageText} Match won!` : messageText;
  };
  const startNewMatch = () => {
    setScore({ w: 0, b: 0 }); setMatchOver(false);
    matchPlies.current = [];
    matchStartedAt.current = new Date().toISOString();
    matchInitialState.current = createMysteryInitialState();
    startRound(true);
  };

  const startRound = (newMatch = false) => {
    setMatchOver(false);
    const freshState = createMysteryInitialState();
    if (!newMatch && score.w + score.b > 0) matchPlies.current.push({ state: freshState, notation: `Round ${score.w + score.b + 1} setup`, action: "other" });
    setState(freshState);
    setHistoryStates([{
      state: freshState,
      p1Secret: null,
      p2Secret: null,
      activePlayer: "w",
      phase: "interstitial",
      message: "White: Get ready to securely pick your piece!"
    }]);
    setSelectedMoveIndex(null);
    setP1Secret(null);
    setP2Secret(null);
    setActivePlayer("w");
    setMessage("White: Get ready to securely pick your piece!");
    setInterstitialTarget("p1_select");
    setPhase("interstitial");
    setIsGuessing(false);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
  };

  const handleInterstitialNext = () => {
    if (interstitialTarget) {
      setPhase(interstitialTarget);
      if (interstitialTarget === "p1_select") {
        setMessage("White: Secretly select your piece!");
      } else if (interstitialTarget === "p2_select") {
        setMessage("Black: Secretly select your piece!");
      }
      setInterstitialTarget(null);
    }
  };

  const passDeviceTo = (targetPhase: Phase, msg: string) => {
    setInterstitialTarget(targetPhase);
    setMessage(msg);
    setPhase("interstitial");
  };

  const opponentSecret = activePlayer === 'w' ? p2Secret : p1Secret;

  const handleSquareClick = (r: number, c: number, promotion?: PieceType) => {
    if (selectedMoveIndex !== null || matchOver) return;
    const p = state.board[r][c];

    if (phase === "p1_select") {
      if (p && p.color === "w") {
        matchPlies.current.push({ state, notation: "White privately selected a piece", action: "reveal" });
        setP1Secret({r, c});
        passDeviceTo("p2_select", "Pass device to Black to select their piece.");
      }
    } else if (phase === "p2_select") {
      if (p && p.color === "b") {
        matchPlies.current.push({ state, notation: "Black privately selected a piece", action: "reveal" });
        setP2Secret({r, c});
        // Skip interstitial and go straight into play!
        setPhase("play");
        setMessage("White's Turn! Ask a verbal question, Move, or Guess.");
      }
    } else if (phase === "play" && isGuessing) {
      if (p && p.color !== activePlayer) {
        if (r === opponentSecret?.r && c === opponentSecret?.c) {
          matchPlies.current.push({ state, notation: `Correct guess: ${p.type.toUpperCase()}`, action: "guess" });
          const roundMessage = recordRoundWin(activePlayer, `CORRECT! It was the ${p.type.toUpperCase()}! ${activePlayer === 'w' ? 'White' : 'Black'} wins!`, state, "Correct guess");
          setMessage(roundMessage);
          setPhase("p1_select"); // Wait for manual restart
        } else {
          matchPlies.current.push({ state, notation: `Incorrect guess on ${p.type.toUpperCase()}`, action: "guess" });
          setIsGuessing(false);
          setWrongGuessMsg("FALSE! Incorrect Guess.");
          const nextPlayer = activePlayer === 'w' ? 'b' : 'w';
          setActivePlayer(nextPlayer);
          setMessage(`${nextPlayer === 'w' ? 'White' : 'Black'}'s Turn! Ask a verbal question, Move, or Guess.`);
          setTimeout(() => setWrongGuessMsg(null), 2000);
        }
      }
    } else if (phase === "play" && !isGuessing) {
      // Normal move logic or piece selection
      const move = legalMoves.find(m => m.to.r === r && m.to.c === c && (!m.promotion || m.promotion === promotion));
      if (move) {
        const nextState = applyMove(state, move);
        const san = moveToSAN(state, move, nextState);
        matchPlies.current.push({ state: nextState, notation: san, action: "move" });
        setMoveHistory(prev => [...prev, san]);

        // Keep track of secrets if they move!
        let nextP1Secret = p1Secret;
        let nextP2Secret = p2Secret;
        if (activePlayer === 'w' && p1Secret && move.from.r === p1Secret.r && move.from.c === p1Secret.c) {
          nextP1Secret = { r: move.to.r, c: move.to.c };
          setP1Secret(nextP1Secret);
        } else if (activePlayer === 'b' && p2Secret && move.from.r === p2Secret.r && move.from.c === p2Secret.c) {
          nextP2Secret = { r: move.to.r, c: move.to.c };
          setP2Secret(nextP2Secret);
        }

        // Did we capture the opponent's secret? If so, instant win!
        if (opponentSecret && move.to.r === opponentSecret.r && move.to.c === opponentSecret.c) {
          const finishedMsg = recordRoundWin(activePlayer, `Secret Captured! ${activePlayer === 'w' ? 'White' : 'Black'} wins!`, nextState, "Secret captured");
          setMessage(finishedMsg);
          setState(nextState);
          setPhase("p1_select");
          
          setHistoryStates(prev => [...prev, {
            state: JSON.parse(JSON.stringify(nextState)),
            p1Secret: nextP1Secret,
            p2Secret: nextP2Secret,
            activePlayer: activePlayer,
            phase: "p1_select",
            message: finishedMsg
          }]);
          return;
        }

        let nextPhase = phase;
        let nextPlayer = activePlayer;
        let nextMessage = message;

        if (isCheckmate(nextState)) {
          nextMessage = recordRoundWin(activePlayer, `${activePlayer === 'w' ? 'White' : 'Black'} Wins by Checkmate!`, nextState, "Checkmate");
          setMessage(nextMessage);
          nextPhase = "p1_select";
          setPhase("p1_select");
        } else {
          nextPlayer = activePlayer === 'w' ? 'b' : 'w';
          setActivePlayer(nextPlayer);
          nextMessage = `${nextPlayer === 'w' ? 'White' : 'Black'}'s Turn! Ask a verbal question, Move, or Guess.`;
          setMessage(nextMessage);
        }

        setState(nextState);
        setSelectedSquare(null);
        setLegalMoves([]);

        setHistoryStates(prev => [...prev, {
          state: JSON.parse(JSON.stringify(nextState)),
          p1Secret: nextP1Secret,
          p2Secret: nextP2Secret,
          activePlayer: nextPlayer,
          phase: nextPhase,
          message: nextMessage
        }]);
      } else if (p && p.color === activePlayer) {
        setSelectedSquare({r, c});
        setLegalMoves(getLegalMoves(state, r, c));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    }
  };

  const toggleTurn = () => {
    const nextPlayer = activePlayer === 'w' ? 'b' : 'w';
    setActivePlayer(nextPlayer);
    setMessage(`${nextPlayer === 'w' ? 'White' : 'Black'}'s Turn! Ask a verbal question, Move, or Guess.`);
  };

  if (phase === "interstitial") {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-4xl mx-auto min-h-full animate-in fade-in duration-300 w-full">
        <div className="flex flex-col items-center justify-center space-y-8 bg-[#1A1A1E] border-2 border-dashed border-white/10 rounded-3xl p-12 w-full max-w-xl mx-auto text-center">
          <EyeOff className="w-24 h-24 text-blue-500 mb-4 animate-pulse opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-widest leading-relaxed uppercase">{message}</h2>
          <p className="text-slate-400">Make sure the other player isn't looking before continuing!</p>
          <Button onClick={handleInterstitialNext} className="mt-8 px-12 py-6 text-xl rounded-2xl bg-blue-600 hover:bg-blue-500 text-white w-full shadow-lg shadow-blue-500/20">
            I'm Ready
          </Button>
        </div>
      </div>
    );
  }

  const undo = () => {
    if (selectedMoveIndex !== null || moveHistory.length === 0 || phase === "interstitial" || isGuessing) return;
    const newMoveHistory = moveHistory.slice(0, -1);
    const newHistoryStates = historyStates.slice(0, -1);
    const prevStateInfo = newHistoryStates[newHistoryStates.length - 1] || {
      state: createMysteryInitialState(),
      p1Secret: null,
      p2Secret: null,
      activePlayer: "w",
      phase: "interstitial",
      message: "White: Get ready to securely pick your piece!"
    };
    
    setMoveHistory(newMoveHistory);
    setHistoryStates(newHistoryStates);
    setState(prevStateInfo.state);
    setP1Secret(prevStateInfo.p1Secret);
    setP2Secret(prevStateInfo.p2Secret);
    setActivePlayer(prevStateInfo.activePlayer);
    setPhase(prevStateInfo.phase);
    setMessage(prevStateInfo.message);
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsGuessing(false);
  };

  // Determine whose perspective the board is rendered from
  const renderPlayer = (phase === "p1_select" || (phase === "play" && activePlayer === 'w')) ? 'w' : 'b';
  
  // Highlight secrets ONLY for the owner during their select phase
  const isSelectPhase = phase === "p1_select" || phase === "p2_select";
  const mySecret = isSelectPhase && renderPlayer === 'w' ? p1Secret : (isSelectPhase && renderPlayer === 'b' ? p2Secret : null);

  const isFlipped = renderPlayer === 'b';
  const topColor = isFlipped ? 'w' : 'b';
  const bottomColor = isFlipped ? 'b' : 'w';

  const isViewingHistory = selectedMoveIndex !== null;
  const displayState = isViewingHistory && historyStates[selectedMoveIndex + 1] ? historyStates[selectedMoveIndex + 1].state : state;
  const material = getMaterialState(displayState, true);

  return (
    <div className="flex w-full h-screen max-h-screen overflow-hidden p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 isolate">
      <div className="flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto h-full w-full relative">
        <div className="w-full flex justify-between items-center mb-4 px-4">
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white px-0 hover:bg-transparent">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="text-xl font-bold bg-[#1A1A1E] px-6 py-2 rounded-full border border-white/5 shadow-sm flex items-center gap-3">
             <span className="text-sm font-normal text-slate-500 uppercase tracking-widest">Rounds</span>
             <span className="text-white">W {score.w}</span> <span className="text-slate-600 font-normal">|</span> <span className="text-slate-400">B {score.b}</span><span className="ml-2 text-slate-500">first to {rules.mystery.roundsToWin}</span>
          </div>
          <div className="flex gap-4">
             <Button 
                onClick={undo} 
                disabled={moveHistory.length === 0 || isViewingHistory || phase === "interstitial" || isGuessing}
                variant="outline" 
                className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 disabled:opacity-30"
             >
                <Undo2 className="w-4 h-4 mr-2" /> Undo
             </Button>
             <Button onClick={() => setShowLog(!showLog)} aria-expanded={showLog} aria-controls="move-log-panel" variant="outline" className="text-slate-300 border-white/10 hover:bg-white/5">
                <ListIcon className="w-4 h-4 mr-2" /> Move Log
             </Button>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-center w-full">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-6 py-2 rounded-2xl font-bold tracking-wide flex items-center shadow-lg shadow-blue-500/5 text-sm">
             <UserSearch className="w-4 h-4 mr-3 opacity-70" />
             {message}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row w-full max-w-5xl mx-auto gap-4 md:gap-6 items-center justify-center min-h-0 overflow-hidden py-2">
          <div 
            className="flex-1 w-full flex flex-col justify-center min-h-0 h-full mx-auto"
            style={{ maxWidth: 'min(100%, calc(100vh - 220px))' }}
          >
            {isViewingHistory && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1 rounded-xl flex items-center justify-between mb-2 w-full shrink-0">
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Viewing Move {selectedMoveIndex + 1}: {moveHistory[selectedMoveIndex]}
                </div>
                <Button 
                  size="sm"
                  onClick={() => setSelectedMoveIndex(null)}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-8 text-xs rounded-lg px-3 border-none shadow-sm"
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
                 isActive={activePlayer === topColor && phase === 'play' && !isViewingHistory}
               />
            </div>

            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <ChessBoard
                state={displayState}
                onSquareClick={isViewingHistory ? undefined : handleSquareClick}
                selectedSquare={isViewingHistory ? null : (selectedSquare || mySecret)}
                legalMoves={isViewingHistory ? [] : legalMoves}
                flipped={renderPlayer === 'b'}
                jumpSquare={isViewingHistory ? null : mySecret}
              />

              {wrongGuessMsg && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-red-500/90 text-white font-bold px-8 py-4 rounded-3xl text-2xl shadow-2xl backdrop-blur-sm border border-red-400/50">
                    {wrongGuessMsg}
                  </motion.div>
                </div>
              )}
              
              {phase === "p1_select" && message.includes("CORRECT") && (
                <div role="dialog" aria-modal="true" aria-label={message} className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-lg backdrop-blur-sm">
                   <div className="bg-[#1A1A1E] p-10 rounded-3xl text-center border border-green-500/30 shadow-2xl shadow-green-500/20 max-w-md w-full mx-4">
                      <h2 className="text-4xl font-bold text-green-400 mb-2 uppercase tracking-tight">{message.split('!')[0]}!</h2>
                      <p className="text-slate-300 mb-8">{message.split('!').slice(1).join('!').trim()}</p>
                      <Button autoFocus onClick={matchOver ? startNewMatch : startRound} className="w-full py-6 text-lg rounded-2xl bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-500/20">{matchOver ? "Start New Match" : "Next Round"}</Button>
                   </div>
                </div>
              )}
              {phase === "p1_select" && (message.includes("Captured") || message.includes("Checkmate")) && (
                <div role="dialog" aria-modal="true" aria-label={message} className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 rounded-lg backdrop-blur-sm">
                   <div className="bg-[#1A1A1E] p-10 rounded-3xl text-center border border-red-500/30 shadow-2xl shadow-red-500/20 max-w-md w-full mx-4">
                      <h2 className="text-4xl font-bold text-red-400 mb-6 uppercase tracking-tight">{message}</h2>
                      <Button autoFocus onClick={matchOver ? startNewMatch : startRound} className="w-full py-6 text-lg rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20">{matchOver ? "Start New Match" : "Next Round"}</Button>
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
                 isActive={activePlayer === bottomColor && phase === 'play' && !isViewingHistory}
               />
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-full md:w-32 shrink-0">
             {phase === "play" && p1Secret && p2Secret && !isViewingHistory && (
               <div className="flex flex-row md:flex-col gap-3 w-full animate-in slide-in-from-bottom-2">
                 {!isGuessing ? (
                   <>
                     <Button 
                       onClick={toggleTurn} 
                       variant="outline" 
                       className="flex-1 md:w-full h-14 md:h-20 flex flex-col items-center justify-center text-xs font-bold rounded-xl border-white/10 bg-[#1A1A1E] hover:bg-white/5 uppercase tracking-widest text-slate-300"
                     >
                       <span className="text-[9px] md:text-[10px] uppercase text-slate-400 font-mono">End Turn</span>
                       <span className="text-xs md:text-sm font-bold text-white mt-0.5 md:mt-1">NEXT TURN</span>
                     </Button>                 
                     <Button 
                       onClick={() => setIsGuessing(true)} 
                       className="flex-1 md:w-full h-14 md:h-20 flex flex-col items-center justify-center text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg uppercase tracking-widest border-none"
                     >
                       <span className="text-[9px] md:text-[10px] uppercase text-purple-200 font-mono">Secret Piece</span>
                       <span className="text-xs md:text-sm font-bold mt-0.5 md:mt-1">GUESS</span>
                     </Button>
                   </>
                 ) : (
                   <div className="flex flex-row md:flex-col items-center justify-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center w-full">
                     <p className="text-amber-400 font-bold text-[10px] tracking-wider uppercase animate-pulse leading-snug">Tap Opponent Piece!</p>
                     <Button 
                       onClick={() => setIsGuessing(false)} 
                       variant="ghost" 
                       size="sm"
                       className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 text-xs px-2 py-1 h-auto"
                     >
                       Cancel
                     </Button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        <div className="w-full flex justify-end mt-4 px-4 hidden">
          <Button onClick={startRound} variant="ghost" className="text-slate-500 hover:text-white px-0 hover:bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" /> Restart Match
          </Button>
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
