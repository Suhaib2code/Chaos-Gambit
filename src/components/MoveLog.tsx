import { Button } from "./ui";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRef, useEffect } from "react";
import { cn } from "../lib/utils";

interface MoveLogProps {
  show: boolean;
  onClose: () => void;
  moveHistory: string[];
  selectedMoveIndex?: number | null;
  onSelectMoveIndex?: (index: number | null) => void;
}

export function MoveLog({ show, onClose, moveHistory, selectedMoveIndex = null, onSelectMoveIndex }: MoveLogProps) {
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [moveHistory, show]);

  interface Turn {
    player: 'w' | 'b';
    spell?: { text: string; index: number };
    move?: { text: string; index: number };
  }

  interface LogRow {
    roundNumber: number;
    w: Turn | null;
    b: Turn | null;
  }

  const turns: Turn[] = [];
  let currentTurn: Turn | null = null;

  for (let i = 0; i < moveHistory.length; i++) {
    const text = moveHistory[i];
    const isSpell = text.startsWith('[');
    
    if (!currentTurn) {
      const player = turns.length % 2 === 0 ? 'w' : 'b';
      currentTurn = { player };
    }
    
    if (isSpell) {
      currentTurn.spell = { text, index: i };
    } else {
      currentTurn.move = { text, index: i };
      turns.push(currentTurn);
      currentTurn = null;
    }
  }

  if (currentTurn) {
    turns.push(currentTurn);
  }

  const rows: LogRow[] = [];
  for (let i = 0; i < turns.length; i += 2) {
    rows.push({
      roundNumber: Math.floor(i / 2) + 1,
      w: turns[i],
      b: turns[i+1] || null
    });
  }

  const renderHalfMove = (turn: Turn | null, isWhite: boolean) => {
    if (!turn) return <span className="flex-1" />;

    const hasBothSpecials = turn.spell && turn.move;

    return (
      <div 
        className={cn(
          "flex-1 flex min-w-0",
          hasBothSpecials 
            ? "flex-col items-start justify-center gap-1.5 py-1.5 px-2 bg-purple-950/20 border border-purple-500/20 rounded-lg shadow-inner" 
            : "flex-row items-center gap-1.5"
        )}
      >
        {turn.spell && (
          <button
            onClick={() => onSelectMoveIndex?.(turn.spell!.index)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all truncate shrink-0 max-w-full cursor-pointer ${
              selectedMoveIndex === turn.spell.index
                ? "bg-purple-950/80 border-purple-400 text-purple-200"
                : "bg-purple-950/20 border-purple-500/20 text-purple-400 hover:bg-purple-950/50 hover:border-purple-500/40"
            }`}
            title={`Click to view historic state during spell: ${turn.spell.text}`}
          >
            {turn.spell.text.substring(1, turn.spell.text.length - 1)}
          </button>
        )}
        {turn.move && (
          <button
            onClick={() => onSelectMoveIndex?.(turn.move!.index)}
            className={cn(
              "font-mono hover:text-cyan-400 font-medium transition-colors cursor-pointer truncate",
              hasBothSpecials ? "text-sm pl-0.5 mt-0.5" : "text-base",
              selectedMoveIndex === turn.move.index
                ? "text-cyan-400 font-semibold bg-cyan-950/40 border border-cyan-500/30 px-1.5 py-0.5 rounded" 
                : isWhite 
                  ? "text-white" 
                  : "text-slate-300"
            )}
            title={`Click to view historic state after move: ${turn.move.text}`}
          >
            {turn.move.text}
          </button>
        )}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="absolute right-0 top-0 bottom-0 w-64 md:w-80 bg-[#1A1A1E] border-l border-white/10 flex flex-col z-40 shadow-2xl shrink-0 h-full"
        >
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-white tracking-widest uppercase">Move Log</h3>
              <span className="text-[10px] text-slate-500 font-medium">Click a move to view historic state</span>
            </div>
            <Button onClick={onClose} variant="ghost" className="p-2 h-auto text-slate-400 hover:text-white hover:bg-white/5">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex px-4 py-2 text-[10px] font-mono font-bold tracking-wider text-slate-500 uppercase border-b border-white/5 bg-white/[0.01]">
            <span className="w-12 text-right mr-4 shrink-0">Move</span>
            <span className="flex-1 text-left text-white/50">White</span>
            <span className="flex-1 text-left text-white/50">Black</span>
          </div>

          <div ref={historyRef} className="flex-1 overflow-y-auto p-4 space-y-2">
            {rows.length === 0 ? (
              <div className="text-center text-slate-500 mt-10 italic">No moves yet</div>
            ) : (
              rows.map((row) => (
                <div key={row.roundNumber} className="flex text-lg items-center px-4 py-1.5 hover:bg-white/5 rounded-lg transition-colors">
                  <span className="text-slate-500 w-12 font-mono text-right mr-4 shrink-0 text-sm">{row.roundNumber}.</span>
                  {renderHalfMove(row.w, true)}
                  {renderHalfMove(row.b, false)}
                </div>
              ))
            )}
          </div>
          {selectedMoveIndex !== null && (
            <div className="p-4 bg-amber-500/5 border-t border-amber-500/20 text-center">
              <button 
                onClick={() => onSelectMoveIndex?.(null)}
                className="w-full h-10 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs tracking-wider uppercase transition-all duration-200"
              >
                Return to Live Game
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
