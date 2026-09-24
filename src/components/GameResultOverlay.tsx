import { useMemo, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Crown, Mountain, RotateCcw, Snowflake, Swords, Timer } from "lucide-react";
import { Button } from "./ui";

type ResultKind = "center" | "capture" | "checkmate" | "draw" | "time" | "other";

function describeResult(status: string): { kind: ResultKind; headline: string; emblem: string; winner: string | null } {
  const lower = status.toLowerCase();
  const winner = /^(white|black)\b/i.exec(status)?.[1] ?? null;
  if (/center/.test(lower)) return { kind: "center", headline: "THE CENTER IS CLAIMED", emblem: "KING OF THE HILL", winner };
  if (/captur/.test(lower)) return { kind: "capture", headline: "THE KING HAS FALLEN", emblem: "KING CAPTURE", winner };
  if (/checkmate/.test(lower)) return { kind: "checkmate", headline: "CHECKMATE", emblem: "THE BOARD IS SEALED", winner };
  if (/stalemate|draw/.test(lower)) return { kind: "draw", headline: "A STANDSTILL", emblem: "STALEMATE", winner: null };
  if (/time/.test(lower)) return { kind: "time", headline: "TIME HAS RUN OUT", emblem: "TIME FORFEIT", winner };
  return { kind: "other", headline: "MATCH COMPLETE", emblem: "FINAL POSITION", winner };
}

export function GameResultOverlay({ status, onRestart, onBack, children }: { status: string; onRestart: () => void; onBack?: () => void; children?: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const result = useMemo(() => describeResult(status), [status]);
  const Mark = result.kind === "center" ? Mountain : result.kind === "capture" ? Swords : result.kind === "time" ? Timer : result.kind === "draw" ? Snowflake : Crown;

  return <AnimatePresence>
    <motion.div
      key={status}
      className={`game-result-backdrop result-${result.kind}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-result-headline"
      aria-describedby="game-result-description"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.section
        className="game-result-card"
        initial={reduceMotion ? false : { transform: "translate3d(0,18px,0) scale(.96)", opacity: 0 }}
        animate={{ transform: "translate3d(0,0,0) scale(1)", opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.42, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="result-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="result-emblem" aria-hidden="true"><Mark size={30} strokeWidth={1.5} /></div>
        <p className="result-eyebrow">{result.emblem}</p>
        {result.winner && <p className="result-winner">{result.winner} <span>· VICTORY</span></p>}
        <h2 id="game-result-headline">{result.headline}</h2>
        <p id="game-result-description" className="result-description">{status}</p>
        {children && <div className="result-extra">{children}</div>}
        <div className="result-actions">
          <Button autoFocus onClick={onRestart} className="result-primary"><RotateCcw size={16} /> Play again</Button>
          {onBack && <Button variant="outline" onClick={onBack} className="result-secondary"><ArrowLeft size={16} /> Back to modes</Button>}
        </div>
        <span className="result-seal" aria-hidden="true">♔</span>
      </motion.section>
    </motion.div>
  </AnimatePresence>;
}
