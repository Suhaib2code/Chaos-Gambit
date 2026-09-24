import { useEffect, useRef, useState } from "react";
import { ArrowLeft, List as ListIcon, Pause, Play, RotateCcw, Undo2 } from "lucide-react";
import { MatchSetup } from "../components/MatchSetup";
import { ChessBoard } from "../components/ChessBoard";
import { MoveLog } from "../components/MoveLog";
import { PlayerBar } from "../components/PlayerBar";
import { GameResultOverlay } from "../components/GameResultOverlay";
import { Button } from "../components/ui";
import { applyLegalMove, createInitialState, getLegalMoves, isCheckmate, isStalemate, moveToSAN, getMaterialState, type Color, type GameState, type Move, type PieceType, type Square } from "../game/engine";
import { applyDuckChessMove, getDuckChessMoves, getDuckPlacementSquares, getHillCenters, hasDuckChessMove, isHillSquare, isValidBoardSquare } from "../game/variantEngine";
import { saveArchivedGame, type ArchiveMode } from "../game/archive";
import { useVariantRules } from "../game/variantRules";

export type NewVariantModeId = "hill" | "duck";

const MODE_INFO = {
  hill: {
    title: "King of the Hill",
    subtitle: "Play standard chess, with a second way to win: reach the center with your king.",
    eyebrow: "THE CENTER IS THE CROWN",
  },
  duck: {
    title: "Duck Chess",
    subtitle: "Move one piece, then move the duck. Every open square can change the line.",
    eyebrow: "ONE BLOCKER. ENDLESS LINES",
  },
} as const;

type Snapshot = { state: GameState; duckSquare: Square | null; whiteTime: number; blackTime: number };
type PendingDuckTurn = { state: GameState; move: Move; oldDuckSquare: Square | null; mover: Color };

function squareName(square: Square) { return `${String.fromCharCode(97 + square.c)}${8 - square.r}`; }
function colorName(color: Color) { return color === "w" ? "White" : "Black"; }

export function NewVariantMode({ mode, onBack }: { mode: NewVariantModeId; onBack: () => void }) {
  const [timeControl, setTimeControl] = useState<number | null>(10 * 60_000);
  const [bonusTime, setBonusTime] = useState(0);
  const [started, setStarted] = useState(false);
  const options = [...new Set([1, 3, 5, 10, 15, 30])].sort((a, b) => a - b).map(minutes => ({ label: `${minutes} Min`, value: minutes * 60_000 }));
  if (!started || timeControl === null) {
    return <MatchSetup
      title={MODE_INFO[mode].title}
      subtitle={MODE_INFO[mode].subtitle}
      eyebrow={MODE_INFO[mode].eyebrow}
      variant={mode}
      timeControl={timeControl}
      timeOptions={options}
      onTimeControlChange={(value) => { setTimeControl(value); if (value === -1) setBonusTime(0); }}
      bonusTime={bonusTime}
      bonusOptions={[0, 1, 2, 5, 10, 15, 30]}
      onBonusTimeChange={setBonusTime}
      onStart={() => setStarted(true)}
      onBack={onBack}
    />;
  }
  return <VariantGame mode={mode} timeMs={timeControl} bonusMs={bonusTime * 1000} onBack={onBack} />;
}

function VariantGame({ mode, timeMs, bonusMs, onBack }: { mode: NewVariantModeId; timeMs: number; bonusMs: number; onBack: () => void }) {
  const { rules } = useVariantRules();
  const hillRules = rules.hill;
  const duckRules = rules.duck;
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [duckSquare, setDuckSquare] = useState<Square | null>(null);
  const [phase, setPhase] = useState<"piece" | "duck">("piece");
  const [pendingDuck, setPendingDuck] = useState<PendingDuckTurn | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([{ state: createInitialState(), duckSquare: null, whiteTime: timeMs, blackTime: timeMs }]);
  const [moves, setMoves] = useState<string[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [winner, setWinner] = useState<Color | null>(null);
  const [whiteTime, setWhiteTime] = useState(timeMs);
  const [blackTime, setBlackTime] = useState(timeMs);
  const interactionLock = useRef(false);
  const archiveId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const archived = useRef(false);

  const activeColor = state.turn;
  const displayState = selectedMoveIndex !== null && history[selectedMoveIndex + 1]
    ? history[selectedMoveIndex + 1].state
    : pendingDuck?.state ?? state;
  const displayDuck = selectedMoveIndex !== null && history[selectedMoveIndex + 1]
    ? history[selectedMoveIndex + 1].duckSquare
    : phase === "duck" ? pendingDuck?.oldDuckSquare ?? duckSquare : duckSquare;
  const material = getMaterialState(displayState);
  const movesForSelection = selected && selectedMoveIndex === null && phase === "piece" ? legalMoves : [];
  const hillSquares = mode === "hill" ? getHillCenters(hillRules.centerSize) : [];

  useEffect(() => { interactionLock.current = false; }, [state, phase, gameOver, pendingDuck]);

  useEffect(() => {
    if (gameOver || paused || timeMs === -1) return;
    const interval = window.setInterval(() => {
      if (activeColor === "w") setWhiteTime(t => {
        if (t <= 100) { setWinner("b"); setStatus("Black wins on time."); setGameOver(true); return 0; }
        return t - 100;
      });
      else setBlackTime(t => {
        if (t <= 100) { setWinner("w"); setStatus("White wins on time."); setGameOver(true); return 0; }
        return t - 100;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [activeColor, gameOver, paused, timeMs]);

  useEffect(() => {
    if (!gameOver || archived.current) return;
    const initialState = history[0]?.state ?? createInitialState();
    const plies = moves.map((notation, index) => ({
      notation: mode === "duck" ? notation.replace(/ · Duck [a-h][1-8]$/, "") : notation,
      state: history[index + 1]?.state ?? initialState,
      action: "move" as const,
      ...(mode === "duck" ? {
        duckSquare: history[index + 1]?.duckSquare ?? null,
        comment: `Duck moved to ${history[index + 1]?.duckSquare ? squareName(history[index + 1]!.duckSquare!) : "the board"}`,
      } : {}),
    }));
    const saved = saveArchivedGame({
      id: archiveId.current,
      mode: mode as ArchiveMode,
      title: mode === "hill" ? "Chaos Gambit · King of the Hill" : "Chaos Gambit · Duck Chess",
      players: { white: "Player 1", black: "Player 2" },
      startedAt: new Date(Number(archiveId.current.split("-")[0])).toISOString(),
      endedAt: new Date().toISOString(),
      result: winner === "w" ? "1-0" : winner === "b" ? "0-1" : "1/2-1/2",
      termination: status ?? "completed",
      initialState,
      ...(mode === "duck" ? { initialDuckSquare: null } : {}),
      plies,
    });
    if (saved) archived.current = true;
  }, [gameOver, history, mode, moves, status, winner]);

  const clearSelection = () => { setSelected(null); setLegalMoves([]); };
  const finishGame = (nextWinner: Color | null, message: string) => {
    setWinner(nextWinner);
    setStatus(message);
    setGameOver(true);
    setPaused(false);
    clearSelection();
  };

  const acceptFullMove = (nextState: GameState, nextDuckSquare: Square | null, notation: string, mover: Color) => {
    const snapshot = {
      state: nextState,
      duckSquare: nextDuckSquare,
      whiteTime: whiteTime + (timeMs !== -1 && mover === "w" ? bonusMs : 0),
      blackTime: blackTime + (timeMs !== -1 && mover === "b" ? bonusMs : 0),
    };
    setState(nextState);
    setDuckSquare(nextDuckSquare);
    setHistory(current => [...current, snapshot]);
    setMoves(current => [...current, notation]);
    setSelectedMoveIndex(null);
    clearSelection();
  };

  const playHillMove = (move: Move) => {
    const movingPiece = state.board[move.from.r]?.[move.from.c];
    const next = applyLegalMove(state, move);
    if (!movingPiece || !next) { clearSelection(); return; }
    const san = moveToSAN(state, move, next);
    const hillWin = movingPiece.type === "k" && isHillSquare(move.to, hillRules.centerSize);
    acceptFullMove(next, null, san, activeColor);
    if (hillWin) finishGame(activeColor, `${colorName(activeColor)} wins by reaching the center.`);
    else if (hillRules.checkmateWins && isCheckmate(next)) finishGame(activeColor, `${colorName(activeColor)} wins by checkmate.`);
    else if (isStalemate(next)) finishGame(null, "Draw by stalemate.");
    if (timeMs !== -1) activeColor === "w" ? setWhiteTime(t => t + bonusMs) : setBlackTime(t => t + bonusMs);
  };

  const chooseSquare = (r: number, c: number, promotion?: PieceType) => {
    if (!isValidBoardSquare({ r, c }) || gameOver || paused || interactionLock.current || selectedMoveIndex !== null) return;

    if (mode === "duck" && phase === "duck") {
      if (!pendingDuck || !isValidBoardSquare({ r, c })) return;
      const placement = { r, c };
      if (!getDuckPlacementSquares(pendingDuck.state, pendingDuck.oldDuckSquare, duckRules.duckMayStay).some(sq => sq.r === r && sq.c === c)) return;
      interactionLock.current = true;
      const notation = `${moveToSAN(state, pendingDuck.move, pendingDuck.state, { ignoreCheck: true, blockedSquare: pendingDuck.oldDuckSquare })} · Duck ${squareName(placement)}`;
      setPhase("piece");
      setPendingDuck(null);
      acceptFullMove(pendingDuck.state, placement, notation, pendingDuck.mover);
      if (!hasDuckChessMove(pendingDuck.state, placement)) {
        const stalemateWinner = duckRules.stalemateRule === "last-move-wins" ? pendingDuck.mover : null;
        finishGame(stalemateWinner, stalemateWinner ? `${colorName(stalemateWinner)} wins because the opponent has no legal move.` : "Draw by stalemate.");
      }
      if (timeMs !== -1) pendingDuck.mover === "w" ? setWhiteTime(t => t + bonusMs) : setBlackTime(t => t + bonusMs);
      return;
    }

    const move = legalMoves.find(candidate => candidate.to.r === r && candidate.to.c === c && candidate.promotion === promotion);
    if (move) {
      interactionLock.current = true;
      if (mode === "hill") { playHillMove(move); return; }
      const movingPiece = state.board[move.from.r]?.[move.from.c];
      const next = applyDuckChessMove(state, move, duckSquare);
      if (!movingPiece || !next) { interactionLock.current = false; clearSelection(); return; }
      const capturedKing = movingPiece && state.board[move.to.r]?.[move.to.c]?.type === "k";
      clearSelection();
      if (capturedKing) {
        const notation = moveToSAN(state, move, next, { ignoreCheck: true, blockedSquare: duckSquare });
        acceptFullMove(next, duckSquare, notation, activeColor);
        if (timeMs !== -1) activeColor === "w" ? setWhiteTime(t => t + bonusMs) : setBlackTime(t => t + bonusMs);
        finishGame(activeColor, `${colorName(activeColor)} wins by capturing the king.`);
        return;
      }
      setPendingDuck({ state: next, move, oldDuckSquare: duckSquare, mover: activeColor });
      setPhase("duck");
      return;
    }

    const piece = state.board[r][c];
    if (piece && piece.color === activeColor) {
      setSelected({ r, c });
      setLegalMoves(mode === "hill" ? getLegalMoves(state, r, c) : getDuckChessMoves(state, r, c, duckSquare));
    } else clearSelection();
  };

  const undo = () => {
    if (gameOver || paused || selectedMoveIndex !== null || interactionLock.current) return;
    if (mode === "duck" && phase === "duck") {
      interactionLock.current = true;
      setPendingDuck(null);
      setPhase("piece");
      clearSelection();
      return;
    }
    if (moves.length === 0) return;
    interactionLock.current = true;
    const newMoves = moves.slice(0, -1);
    const newHistory = history.slice(0, -1);
    const previous = newHistory[newHistory.length - 1] ?? { state: createInitialState(), duckSquare: null, whiteTime: timeMs, blackTime: timeMs };
    setMoves(newMoves);
    setHistory(newHistory);
    setState(previous.state);
    setDuckSquare(previous.duckSquare);
    setWhiteTime(previous.whiteTime);
    setBlackTime(previous.blackTime);
    setStatus(null);
    setWinner(null);
    clearSelection();
  };

  const restart = () => {
    const initial = createInitialState();
    interactionLock.current = true;
    archiveId.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    archived.current = false;
    setState(initial);
    setDuckSquare(null);
    setPhase("piece");
    setPendingDuck(null);
    setHistory([{ state: initial, duckSquare: null, whiteTime: timeMs, blackTime: timeMs }]);
    setMoves([]);
    setSelectedMoveIndex(null);
    setWhiteTime(timeMs);
    setBlackTime(timeMs);
    setPaused(false);
    setGameOver(false);
    setStatus(null);
    setWinner(null);
    clearSelection();
  };

  const backToModes = () => {
    if (moves.length && !gameOver && !window.confirm("Leave this match? The unfinished game will not be saved.")) return;
    onBack();
  };

  const viewingHistory = selectedMoveIndex !== null;
  const topColor: Color = state.turn === "w" ? "b" : "w";
  const bottomColor: Color = state.turn;
  const topTime = topColor === "w" ? whiteTime : blackTime;
  const bottomTime = bottomColor === "w" ? whiteTime : blackTime;
  const formatTime = (ms: number) => `${Math.floor(Math.max(0, ms) / 60_000)}:${String(Math.floor(Math.max(0, ms) / 1000) % 60).padStart(2, "0")}`;

  return <main className="variant-game-screen">
    <div className="variant-game-column">
      <header className="variant-game-header">
        <Button onClick={backToModes} variant="ghost"><ArrowLeft size={17} /> Back</Button>
        <div><span className={`variant-game-mark variant-game-mark-${mode}`}>{mode === "hill" ? "♔" : "🦆"}</span><strong>{MODE_INFO[mode].title}</strong>{mode === "duck" && phase === "duck" && <span className="duck-phase-chip">PLACE THE DUCK</span>}</div>
      <div className="variant-game-tools"><Button variant="outline" disabled={(!moves.length && !(mode === "duck" && phase === "duck")) || gameOver} onClick={undo}><Undo2 size={15} /> Undo</Button><Button variant="outline" aria-expanded={showLog} onClick={() => setShowLog(open => !open)}><ListIcon size={15} /> Move log</Button><Button variant="outline" onClick={restart}><RotateCcw size={15} /> Restart</Button></div>
      </header>
      {status && !gameOver && <div className="variant-game-status" role="status" aria-live="polite">{status}</div>}
      <PlayerBar name={topColor === "w" ? "White · Player 1" : "Black · Player 2"} color={topColor} capturedPieces={topColor === "w" ? material.capturedByWhite : material.capturedByBlack} advantage={topColor === "w" ? material.wAdvantage : material.bAdvantage} isActive={!paused && !gameOver && activeColor === topColor} time={timeMs === -1 ? undefined : formatTime(topTime)} />
      <section className="variant-board-wrap" aria-label={mode === "duck" && phase === "duck" ? "Choose an empty square for the duck" : "Chess board"}>
        {mode === "hill" && <div className="hill-board-hint"><span />{hillRules.checkmateWins ? "Win by checkmate or bring your king to the highlighted center" : "Win by bringing your king to the highlighted center"}</div>}
        {mode === "duck" && <div className={`duck-board-hint ${phase === "duck" ? "is-placement" : ""}`} role="status">{phase === "duck" ? `Choose an empty square for the duck${duckRules.duckMayStay ? ", or keep it in place" : ""}` : "Each turn: move a piece, then move the duck"}</div>}
        <div className="variant-board-square"><ChessBoard state={displayState} selectedSquare={selectedMoveIndex === null ? selected : null} legalMoves={movesForSelection} onSquareClick={chooseSquare} flipped={activeColor === "b"} disabled={paused || gameOver || viewingHistory || (mode === "duck" && phase === "duck" && !pendingDuck)} duckSquare={mode === "duck" ? displayDuck : null} duckPlacementMode={mode === "duck" && phase === "duck"} highlightedSquares={mode === "hill" ? hillSquares : []} /></div>
      </section>
      <PlayerBar name={bottomColor === "w" ? "White · Player 1" : "Black · Player 2"} color={bottomColor} capturedPieces={bottomColor === "w" ? material.capturedByWhite : material.capturedByBlack} advantage={bottomColor === "w" ? material.wAdvantage : material.bAdvantage} isActive={!paused && !gameOver && activeColor === bottomColor} time={timeMs === -1 ? undefined : formatTime(bottomTime)} />
      <footer className="variant-game-footer"><span>{mode === "hill" ? "STANDARD CHESS · CENTER WIN" : "KING CAPTURE · DUCK BLOCKER"}</span><Button variant="outline" onClick={() => setPaused(value => !value)} disabled={gameOver}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "Resume" : "Pause"}</Button></footer>
      {gameOver && status && <GameResultOverlay status={status} onRestart={restart} onBack={onBack} />}
    </div>
    <MoveLog show={showLog} onClose={() => setShowLog(false)} moveHistory={moves} selectedMoveIndex={selectedMoveIndex} onSelectMoveIndex={setSelectedMoveIndex} />
  </main>;
}
