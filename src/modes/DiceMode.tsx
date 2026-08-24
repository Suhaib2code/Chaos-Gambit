import { useState } from "react";
import { ChessBoard, CustomBishopSVG, CustomKingSVG } from "../components/ChessBoard";
import { GameState, createInitialState, Move, getLegalMoves, applyMove, PieceType, isCheckmate, isStalemate, moveToSAN, getMaterialState } from "../game/engine";
import { Button } from "../components/ui";
import { ArrowLeft, Dices, RotateCcw, List as ListIcon, Undo2 } from "lucide-react";
import { PIECE_SYMBOLS } from "../components/Pieces";
import { useSettings } from "../context";
import { motion } from "motion/react";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";

interface DiceModeProps {
  onBack: () => void;
}

const getGamePhase = (board: (any | null)[][], fullMoves: number): 'opening' | 'middlegame' | 'endgame' => {
  let pieceCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== null) {
        pieceCount++;
      }
    }
  }
  if (fullMoves > 25 || pieceCount < 12) {
    return 'endgame';
  }
  if (fullMoves > 12 || pieceCount <= 24) {
    return 'middlegame';
  }
  return 'opening';
};

const getRandomPieceWithWeights = (phase: 'opening' | 'middlegame' | 'endgame'): PieceType => {
  const rand = Math.random() * 100;
  if (phase === 'opening') {
    // King: 2%, Queen: 8%, Rook: 18%, Bishop: 18%, Knight: 18%, Pawn: 36%
    if (rand < 2) return 'k';
    if (rand < 10) return 'q';
    if (rand < 28) return 'r';
    if (rand < 46) return 'b';
    if (rand < 64) return 'n';
    return 'p';
  } else if (phase === 'middlegame') {
    // King: 12%, Queen: 13%, Rook: 15%, Bishop: 15%, Knight: 15%, Pawn: 30%
    if (rand < 12) return 'k';
    if (rand < 25) return 'q';
    if (rand < 40) return 'r';
    if (rand < 55) return 'b';
    if (rand < 70) return 'n';
    return 'p';
  } else {
    // Endgame: King: 25%, Queen: 15%, Rook: 15%, Bishop: 15%, Knight: 15%, Pawn: 15%
    if (rand < 25) return 'k';
    if (rand < 40) return 'q';
    if (rand < 55) return 'r';
    if (rand < 70) return 'b';
    if (rand < 85) return 'n';
    return 'p';
  }
};

type DiceHistoryState = {
  state: GameState;
  diceRolls: PieceType[];
  hasRolled: boolean;
};

export function DiceMode({ onBack }: DiceModeProps) {
  const { settings } = useSettings();
  const [state, setState] = useState<GameState>(createInitialState());
  const [historyStates, setHistoryStates] = useState<DiceHistoryState[]>(() => [
    { state: createInitialState(), diceRolls: [], hasRolled: false }
  ]);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<{r:number, c:number} | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  const [diceRolls, setDiceRolls] = useState<PieceType[]>([]);
  const [hasRolled, setHasRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [showBigDice, setShowBigDice] = useState(false);
  const [skipMsg, setSkipMsg] = useState("");
  
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const currentPhase = getGamePhase(state.board, state.fullMoves);
      const rolls = [
        getRandomPieceWithWeights(currentPhase),
        getRandomPieceWithWeights(currentPhase),
        getRandomPieceWithWeights(currentPhase),
      ];

      // Ensure the first move of both White and Black starts fairly with at least one pawn
      if (state.fullMoves === 1) {
        if (!rolls.includes('p')) {
          rolls[Math.floor(Math.random() * 3)] = 'p';
        }
      }

      setDiceRolls(rolls);
      setIsRolling(false);
      setShowBigDice(true);
      
      setTimeout(() => {
        setShowBigDice(false);
        setHasRolled(true);
        checkPlayability(rolls, state);
      }, 2000);
    }, 600);
  };

  const checkPlayability = (currentRolls: PieceType[], currentState: GameState) => {
    if (currentRolls.length === 0) {
      // turn ends naturally
      setHasRolled(false);
      setState({ ...currentState, turn: currentState.turn === 'w' ? 'b' : 'w' });
      
      // If we didn't add any move for this turn, we should probably pad for moveHistory consistency
      // But standard chess moves assume alternating. Dice mode breaks this. The move log will just be a flow of moves.
      
      return;
    }

    const typeNeeded = currentRolls[0];
    let hasLegalMoves = false;

    // check if active player has ANY piece of `typeNeeded` with at least 1 legal move
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentState.board[r][c];
        if (p && p.color === currentState.turn && p.type === typeNeeded) {
          if (getLegalMoves(currentState, r, c).length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
      if (hasLegalMoves) break;
    }

    if (!hasLegalMoves) {
      setSkipMsg(`No legal ${typeNeeded.toUpperCase()} moves - Skipped!`);
      // Since a move is skipped, we can push a skip to history to keep it visually clear
      const nextRolls = currentRolls.slice(1);
      setMoveHistory(prev => [...prev, `skip ${typeNeeded}`]);
      setHistoryStates(prev => [...prev, {
        state: JSON.parse(JSON.stringify(currentState)),
        diceRolls: nextRolls,
        hasRolled: true
      }]);
      
      setTimeout(() => {
        setSkipMsg("");
        setDiceRolls(nextRolls);
        checkPlayability(nextRolls, currentState);
      }, 1500);
    }
  };

  const handleSquareClick = (r: number, c: number, promotion?: PieceType) => {
    if (selectedMoveIndex !== null || !hasRolled || diceRolls.length === 0 || status || isRolling) return;
    
    const move = legalMoves.find(m => m.to.r === r && m.to.c === c && (!m.promotion || m.promotion === promotion));
    if (move) {
      const targetPiece = state.board[r][c];
      const isKingCapture = targetPiece?.type === 'k';

      const nextState = applyMove(state, move);
      
      // Calculate isCheckmate and SAN before overriding nextState.turn
      const opCheckmate = isCheckmate(nextState);
      let san = moveToSAN(state, move, nextState);
      if (isKingCapture && !san.endsWith('#')) {
        san += '#';
      }
      
      // keep turn
      nextState.turn = state.turn;
      
      const newRolls = diceRolls.slice(1);
      setMoveHistory(prev => [...prev, san]);
      setHistoryStates(prev => [...prev, {
        state: JSON.parse(JSON.stringify(nextState)),
        diceRolls: newRolls,
        hasRolled: true
      }]);

      if (isKingCapture) {
        setState(nextState);
        setStatus(`${state.turn === 'w' ? 'White' : 'Black'} wins by King Capture!`);
        return;
      }

      // intercept standard checkmate check
      if (opCheckmate) {
        setState(nextState);
        setStatus(`${state.turn === 'w' ? 'White' : 'Black'} wins by Checkmate!`);
        return;
      }
      
      setState(nextState);
      setSelectedSquare(null);
      setLegalMoves([]);
      
      setDiceRolls(newRolls);
      checkPlayability(newRolls, nextState);
      return;
    }

    const p = state.board[r][c];
    const requiredType = diceRolls[0];
    if (p && p.color === state.turn) {
      if (p.type === requiredType) {
        setSelectedSquare({r, c});
        setLegalMoves(getLegalMoves(state, r, c));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const restart = () => {
    const freshState = createInitialState();
    setState(freshState);
    setHistoryStates([{ state: freshState, diceRolls: [], hasRolled: false }]);
    setSelectedMoveIndex(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setStatus(null);
    setDiceRolls([]);
    setHasRolled(false);
    setMoveHistory([]);
  };

  const undo = () => {
    if (selectedMoveIndex !== null || moveHistory.length === 0 || isRolling) return;
    const newMoveHistory = moveHistory.slice(0, -1);
    const newHistoryStates = historyStates.slice(0, -1);
    const prevStateInfo = newHistoryStates[newHistoryStates.length - 1] || { state: createInitialState(), diceRolls: [], hasRolled: false };
    setMoveHistory(newMoveHistory);
    setHistoryStates(newHistoryStates);
    setState(prevStateInfo.state);
    setDiceRolls(prevStateInfo.diceRolls);
    setHasRolled(prevStateInfo.hasRolled);
    setSelectedSquare(null);
    setLegalMoves([]);
    setStatus(null);
  };

  const isFlipped = state.turn === 'b';
  const topColor = isFlipped ? 'w' : 'b';
  const bottomColor = isFlipped ? 'b' : 'w';

  const isViewingHistory = selectedMoveIndex !== null;
  const displayState = isViewingHistory && historyStates[selectedMoveIndex + 1] ? historyStates[selectedMoveIndex + 1].state : state;
  const material = getMaterialState(displayState, false);
  const currentPhase = getGamePhase(displayState.board, displayState.fullMoves);

  return (
    <div className="flex w-full h-screen max-h-screen overflow-hidden p-2 sm:p-4 md:p-6 animate-in fade-in duration-300 isolate">
      <div className="flex-1 flex flex-col items-center justify-between max-w-4xl mx-auto h-full w-full relative">
        <div className="w-full flex justify-between items-center px-4 shrink-0">
          <Button onClick={onBack} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-600 flex-1 text-center">
            Dice Gambit
          </div>
          <div className="flex gap-4 items-center">
            <Button 
              onClick={undo} 
              disabled={moveHistory.length === 0 || isViewingHistory || isRolling}
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
              />
              
              {skipMsg && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-red-500/90 text-white font-bold px-6 py-3 rounded-full text-xl shadow-2xl backdrop-blur-sm">
                    {skipMsg}
                  </motion.div>
                </div>
              )}
    
              {status && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                  <div className="bg-[#1A1A1E] p-10 rounded-3xl text-center border border-white/10 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-8 tracking-wide">{status}</h2>
                    <Button onClick={restart} className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl w-full">
                      Play Again
                    </Button>
                  </div>
                </div>
              )}
            </div>
    
            <div className="w-full mt-2 border-none shrink-0 border-0">
               <PlayerBar 
                 name={bottomColor === 'w' ? "Noob 1" : "Noob 2"}
                 color={bottomColor}
                 capturedPieces={bottomColor === 'w' ? material.capturedByWhite : material.capturedByBlack}
                 advantage={bottomColor === 'w' ? material.wAdvantage : material.bAdvantage}
                 isActive={state.turn === bottomColor && !isViewingHistory}
               />
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center w-20 md:w-28 shrink-0 gap-3">
             {!hasRolled ? (
                <Button 
                  onClick={rollDice} 
                  disabled={isRolling || isViewingHistory} 
                  className={`flex flex-col items-center justify-center w-full h-24 md:h-32 rounded-xl shadow-[0_0_15px_rgba(217,119,6,0.3)] px-2 whitespace-pre-wrap ${isViewingHistory ? "bg-[#1A1A1E] border border-white/10 text-slate-500 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-500"}`}
                >
                  <Dices className={isRolling ? "animate-spin mb-2 w-6 h-6 animate-pulse text-amber-500" : "mb-2 w-6 h-6"} />
                  <span className="text-[10px] md:text-sm font-bold text-center leading-tight">
                    {isRolling ? "Rolling..." : "Roll\nDice"}
                  </span>
                </Button>
             ) : (
                <div className="flex flex-col p-2 md:p-4 rounded-xl gap-2 md:gap-4 items-center w-full justify-center bg-[#1A1A1E] border border-white/10 min-h-24 md:min-h-32 shadow-lg">
                  <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest text-center leading-tight">Next</span>
                  <div className="flex flex-col gap-2">
                    {diceRolls.map((d, i) => (
                      <div key={i} className={`text-4xl md:text-5xl flex items-center justify-center w-12 h-12 mx-auto ${i === 0 && !isViewingHistory ? "text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "text-slate-500"}`}>
                        {d === 'b' ? (
                          <CustomBishopSVG fillStyle={settings.pieceStyle} className="w-[0.85em] h-[0.85em]" />
                        ) : d === 'k' ? (
                          <CustomKingSVG fillStyle={settings.pieceStyle} className="w-[0.85em] h-[0.85em]" />
                        ) : (
                          PIECE_SYMBOLS[settings.pieceStyle as keyof typeof PIECE_SYMBOLS][d as keyof typeof PIECE_SYMBOLS.solid]
                        )}
                      </div>
                    ))}
                  </div>
                </div>
             )}

             <div className="text-[10px] font-medium text-center text-slate-400 bg-white/[0.03] border border-white/5 p-2 rounded-xl w-full">
               <div className="text-amber-400 font-bold uppercase tracking-wider text-[9px]">
                 {currentPhase === 'opening' ? 'Opening' : currentPhase === 'middlegame' ? 'Middle' : 'Endgame'}
               </div>
               <div className="text-slate-500 text-[8px] mt-0.5 leading-tight">
                 King: {currentPhase === 'opening' ? '2%' : currentPhase === 'middlegame' ? '12%' : '25%'}
               </div>
             </div>
          </div>
        </div>

        {showBigDice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
             <motion.div 
                initial={{ scale: 0.5, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.5, opacity: 0 }} 
                className="flex flex-row gap-4 md:gap-8 bg-[#1A1A1E] p-8 md:p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(217,119,6,0.15)]"
             >
                {diceRolls.map((d, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ y: 20, opacity: 0 }} 
                     animate={{ y: 0, opacity: 1 }} 
                     transition={{ delay: i * 0.2 + 0.1 }}
                     className="text-7xl md:text-9xl text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center justify-center w-24 h-24 md:w-36 md:h-36"
                   >
                     {d === 'b' ? (
                       <CustomBishopSVG fillStyle={settings.pieceStyle} className="w-[0.85em] h-[0.85em]" />
                     ) : d === 'k' ? (
                       <CustomKingSVG fillStyle={settings.pieceStyle} className="w-[0.85em] h-[0.85em]" />
                     ) : (
                       PIECE_SYMBOLS[settings.pieceStyle as keyof typeof PIECE_SYMBOLS][d as keyof typeof PIECE_SYMBOLS.solid]
                     )}
                   </motion.div>
                ))}
             </motion.div>
          </div>
        )}
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
