import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { GameState, Square, Move, PieceType } from "../game/engine";
import { useSettings } from "../context";
import { THEME_COLORS, PIECE_SYMBOLS } from "./Pieces";
import { motion, AnimatePresence } from "motion/react";
import { Snowflake } from "lucide-react";

export function CustomBishopSVG({ 
  color, 
  fillStyle = 'solid', 
  className 
}: { 
  color?: 'w' | 'b'; 
  fillStyle?: string; 
  className?: string;
}) {
  const isSolid = fillStyle === 'solid';
  const hasColor = color !== undefined;
  
  const [maskId] = useState(() => `bishop-mask-${Math.random().toString(36).substring(2, 11)}`);

  let fill = "currentColor";
  let stroke = "transparent";
  let strokeWidth = "0";

  if (hasColor) {
    fill = color === "w" ? "#ffffff" : "#0f0f12";
    strokeWidth = isSolid ? "3" : "0";
    stroke = color === "w" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.7)";
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={cn("w-[85%] h-[85%] select-none pointer-events-none drop-shadow-md inline-block align-middle", className)}
    >
      <defs>
        <mask id={maskId}>
          {/* Everything white remains visible */}
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          {/* Black cuts out the diagonal slit */}
          <path 
            d="M42 32 L54 44" 
            stroke="#000000" 
            strokeWidth="4" 
            strokeLinecap="round" 
          />
        </mask>
      </defs>
      <g 
        mask={`url(#${maskId})`}
        fill={fill} 
        stroke={stroke} 
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      >
        {/* Base */}
        <path d="M22 84 C22 81 26 79 34 78 C38 78 44 79 50 79 C56 79 62 78 66 78 C74 79 78 81 78 84 C78 86 74 87 66 87 L34 87 C26 87 22 86 22 84 Z" />
        {/* Collar & Body */}
        <path d="M30 74 C30 70 34 68 50 68 C66 68 70 70 70 74 C70 76 66 77 50 77 C34 77 30 76 30 74 Z" />
        {/* Mitre head with diagonal cut-out and ball on top */}
        <path d="M34 65 C34 50 36 31 50 21 C64 31 66 50 66 65 Z" />
        {/* Top small round ball instead of cross */}
        <circle cx="50" cy="15.5" r="5.5" />
      </g>
    </svg>
  );
}

export function CustomKingSVG({ 
  color, 
  fillStyle = 'solid', 
  className 
}: { 
  color?: 'w' | 'b'; 
  fillStyle?: string; 
  className?: string;
}) {
  const isSolid = fillStyle === 'solid';
  const hasColor = color !== undefined;
  
  const [maskId] = useState(() => `king-mask-${Math.random().toString(36).substring(2, 11)}`);

  let fill = "currentColor";
  let stroke = "transparent";
  let strokeWidth = "0";

  if (hasColor) {
    fill = color === "w" ? "#ffffff" : "#0f0f12";
    strokeWidth = isSolid ? "3" : "0";
    stroke = color === "w" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.7)";
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={cn("w-[85%] h-[85%] select-none pointer-events-none drop-shadow-md inline-block align-middle", className)}
    >
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          {/* Black cuts out an elegant horizontal band / groove on the crown body */}
          <path 
            d="M 32 58 Q 50 54 68 58" 
            stroke="#000000" 
            strokeWidth="3.5" 
            fill="none"
            strokeLinecap="round" 
          />
        </mask>
      </defs>
      <g 
        mask={`url(#${maskId})`}
        fill={fill} 
        stroke={stroke} 
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      >
        {/* Base */}
        <path d="M22 84 C22 81 26 79 34 78 C38 78 44 79 50 79 C56 79 62 78 66 78 C74 79 78 81 78 84 C78 86 74 87 66 87 L34 87 C26 87 22 86 22 84 Z" />
        {/* Collar & Body */}
        <path d="M30 74 C30 70 34 68 50 68 C66 68 70 70 70 74 C70 76 66 77 50 77 C34 77 30 76 30 74 Z" />
        {/* Crown Body with arches and peaks */}
        <path d="M 32 70 C 32 58 36 50 36 46 C 30 46 26 40 26 34 C 32 36 36 40 38 44 C 42 34 46 24 50 22 C 54 24 58 34 62 44 C 64 40 68 36 74 34 C 74 40 70 46 70 46 C 70 50 68 58 68 70 Z" />
        {/* Left peak pearl */}
        <circle cx="26" cy="33.5" r="3.5" />
        {/* Right peak pearl */}
        <circle cx="74" cy="33.5" r="3.5" />
        {/* Center top round elegant royal orb, completely free of any religious cross */}
        <circle cx="50" cy="16.5" r="5.5" />
      </g>
    </svg>
  );
}

interface ChessBoardProps {
  state: GameState;
  onSquareClick: (r: number, c: number, promotion?: PieceType) => void;
  selectedSquare: Square | null;
  legalMoves: Move[];
  flipped?: boolean;
  frozenSquares?: { r: number; c: number }[];
  jumpSquare?: Square | null;
  disabled?: boolean;
}

export function ChessBoard({
  state,
  onSquareClick,
  selectedSquare,
  legalMoves,
  flipped = false,
  frozenSquares = [],
  jumpSquare = null,
  disabled = false,
}: ChessBoardProps) {
  const { settings } = useSettings();
  const theme = THEME_COLORS[settings.theme];

  const [delayedFlipped, setDelayedFlipped] = useState(flipped);
  const [promoSquare, setPromoSquare] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    setPromoSquare(null);
  }, [selectedSquare, state.turn]);

  useEffect(() => {
    // Wait for the piece movement animation to settle before rotating the board
    const duration = settings.animSpeed === "fast" ? 180 : settings.animSpeed === "slow" ? 750 : 450;
    const timer = setTimeout(() => {
      setDelayedFlipped(flipped);
    }, duration);
    return () => clearTimeout(timer);
  }, [flipped, settings.animSpeed]);

  const handleSquareClickInternal = (r: number, c: number) => {
    if (disabled) return;
    const isPromo = legalMoves.some((m) => m.to.r === r && m.to.c === c && m.promotion);
    if (isPromo) {
      setPromoSquare({ r, c });
    } else {
      onSquareClick(r, c);
    }
  };

  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      const bg = isLight ? theme.light : theme.dark;

      const piece = state.board[r][c];
      const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
      const moveTarget = legalMoves.find((m) => m.to.r === r && m.to.c === c);
      const isFrozen = frozenSquares.some((sq) => sq.r === r && sq.c === c);
      const isJump = jumpSquare?.r === r && jumpSquare?.c === c;

      squares.push(
        <div
          key={`${r}-${c}`}
          onClick={() => handleSquareClickInternal(r, c)}
          className="relative flex items-center justify-center w-full aspect-square text-[9.5cqw] cursor-pointer select-none leading-none"
          style={{ backgroundColor: bg }}
        >
          {isSelected && (
            <div className="absolute inset-0 bg-yellow-400 opacity-50 z-10" />
          )}

          {settings.highlightLegal && moveTarget && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              {!piece ? (
                <div className="w-1/3 h-1/3 rounded-full bg-black/20" />
              ) : (
                <div className="w-full h-full rounded-full border-[6px] border-black/20" />
              )}
            </div>
          )}

          {isFrozen && (
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/45 via-cyan-400/25 to-blue-500/50 backdrop-blur-[2.5px] z-20 pointer-events-none border border-cyan-200/50 shadow-[inset_0_0_12px_rgba(103,232,249,0.7)] flex items-center justify-center overflow-hidden">
              {/* Rotating Freezy Wind Vortex */}
              <motion.div
                className="absolute inset-0 opacity-70 flex items-center justify-center"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <svg className="w-[110%] h-[110%] text-cyan-200/40" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="2.5" strokeDasharray="25 120" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="18 90" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="18" stroke="currentColor" strokeWidth="1.5" strokeDasharray="12 50" strokeLinecap="round" />
                </svg>
              </motion.div>

              {/* Shimmering frost crystals and snowflake */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Snowflake className="w-7 h-7 text-white/45 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse" style={{ animationDuration: "3s" }} />
              </div>

              {/* Random floating sparkles */}
              <motion.div 
                className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#fff]" 
                animate={{ opacity: [0.2, 1, 0.2], y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#fff]" 
                animate={{ opacity: [0.1, 0.9, 0.1], y: [0, -5, 0] }}
                transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              />
              <motion.div 
                className="absolute bottom-2 left-1.5 w-1 h-1 bg-cyan-200 rounded-full shadow-[0_0_4px_#a5f3fc]" 
                animate={{ opacity: [0.3, 1, 0.3], x: [0, 3, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              />

              {/* Frosted Corner brackets */}
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-white/60" />
              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-white/60" />
              <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-white/60" />
              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-white/60" />
            </div>
          )}
          {isJump && (
            <div className="absolute inset-0 bg-purple-500/30 animate-pulse z-20 pointer-events-none border border-purple-400 shadow-[inset_0_0_15px_rgba(168,85,247,0.5)]" />
          )}

          <AnimatePresence>
            {piece && (
              <motion.div
                key={piece.id || `${piece.color}${piece.type}-${r}-${c}`}
                layout="position"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isJump ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  layout: {
                    type: "spring",
                    stiffness: settings.animSpeed === "fast" ? 220 : settings.animSpeed === "slow" ? 90 : 130,
                    damping: settings.animSpeed === "fast" ? 22 : settings.animSpeed === "slow" ? 17 : 20,
                    mass: 0.9
                  },
                  opacity: { duration: settings.animSpeed === "fast" ? 0.12 : settings.animSpeed === "slow" ? 0.35 : 0.22 },
                  scale: { duration: settings.animSpeed === "fast" ? 0.12 : settings.animSpeed === "slow" ? 0.35 : 0.22 }
                }}
                className={cn(
                  "z-30 drop-shadow-md origin-center flex items-center justify-center transition-transform duration-[700ms] ease-in-out",
                  piece.color === "w" ? "text-white" : "text-black",
                  delayedFlipped ? "rotate-180" : "rotate-0"
                )}
                style={{
                  WebkitTextStroke: (piece.type !== 'b' && piece.type !== 'k') ? (settings.pieceStyle === 'solid' ? (piece.color === "w" ? "1.5px rgba(0,0,0,0.8)" : "1px rgba(255,255,255,0.5)") : undefined) : undefined,
                  textShadow: (piece.type !== 'b' && piece.type !== 'k') ? (settings.pieceStyle === 'solid' ? (piece.color === "w" ? "0 2px 4px rgba(0,0,0,0.6)" : "0 2px 4px rgba(0,0,0,0.8)") : (piece.color === "w" ? "0 1px 3px rgba(0,0,0,0.4)" : undefined)) : undefined
                }}
              >
                {piece.type === 'b' ? (
                  <CustomBishopSVG color={piece.color} fillStyle={settings.pieceStyle} />
                ) : piece.type === 'k' ? (
                  <CustomKingSVG color={piece.color} fillStyle={settings.pieceStyle} />
                ) : (
                  PIECE_SYMBOLS[settings.pieceStyle as keyof typeof PIECE_SYMBOLS] ? PIECE_SYMBOLS[settings.pieceStyle as keyof typeof PIECE_SYMBOLS][piece.type] : PIECE_SYMBOLS.solid[piece.type]
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Coordinates */}
          {settings.showCoords && c === 0 && (
            <span 
              className={cn("absolute z-10 text-[10px] font-bold px-1 py-0.5 top-0 left-0 transition-transform duration-[700ms] ease-in-out", 
                isLight ? "text-black/50" : "text-white/50",
                delayedFlipped ? "rotate-180 text-white/50" : "rotate-0"
              )}
            >
              {8 - r}
            </span>
          )}
          {settings.showCoords && r === 7 && (
            <span 
              className={cn("absolute z-10 text-[10px] font-bold px-1 py-0.5 bottom-0 right-0 transition-transform duration-[700ms] ease-in-out", 
                isLight ? "text-black/50" : "text-white/50",
                delayedFlipped ? "rotate-180 text-white/50" : "rotate-0"
              )}
            >
              {String.fromCharCode(97 + c)}
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className="w-auto h-full max-w-full max-h-full aspect-square mx-auto relative @container flex justify-center items-center">
      <div 
        className={cn(
          "w-full h-full rounded-sm overflow-hidden shadow-2xl grid grid-cols-8 grid-rows-8 border-4 border-gray-800/50 bg-gray-900 origin-center transition-transform duration-[700ms] ease-in-out",
          delayedFlipped ? "rotate-180" : "rotate-0"
        )}
      >
        {squares}
      </div>

      <AnimatePresence>
        {promoSquare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-sm p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="max-w-xs md:max-w-sm w-full"
            >
              <h3 className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase mb-6 font-sans">
                Choose Promotion
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'q', label: "Queen" },
                  { type: 'r', label: "Rook" },
                  { type: 'b', label: "Bishop" },
                  { type: 'n', label: "Knight" },
                ].map(({ type, label }) => {
                  const isSolid = settings.pieceStyle === 'solid';
                  const textColor = state.turn === 'w' ? "text-white" : "text-black";
                  const pieceSymbol = PIECE_SYMBOLS[settings.pieceStyle as keyof typeof PIECE_SYMBOLS]
                    ? PIECE_SYMBOLS[settings.pieceStyle as keyof typeof PIECE_SYMBOLS][type as PieceType]
                    : PIECE_SYMBOLS.solid[type as PieceType];

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        onSquareClick(promoSquare.r, promoSquare.c, type as PieceType);
                        setPromoSquare(null);
                      }}
                      className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-cyan-500/50 rounded-2xl group transition-all h-24 w-28 cursor-pointer shadow-lg"
                    >
                      <span
                        className={cn(
                          "text-4xl md:text-5xl select-none leading-none mb-1 drop-shadow-md transition-transform duration-200 group-hover:scale-110 flex items-center justify-center w-12 h-12",
                          type !== 'b' ? textColor : undefined
                        )}
                        style={{
                          WebkitTextStroke: type !== 'b' ? (isSolid ? (state.turn === "w" ? "1.5px rgba(0,0,0,0.8)" : "1px rgba(255,255,255,0.5)") : undefined) : undefined,
                          textShadow: type !== 'b' ? (isSolid ? (state.turn === "w" ? "0 2px 4px rgba(0,0,0,0.6)" : "0 2px 4px rgba(0,0,0,0.8)") : (state.turn === "w" ? "0 1px 3px rgba(0,0,0,0.4)" : undefined)) : undefined
                        }}
                      >
                        {type === 'b' ? (
                          <CustomBishopSVG color={state.turn} fillStyle={settings.pieceStyle} className="w-[1.12em] h-[1.12em]" />
                        ) : (
                          pieceSymbol
                        )}
                      </span>
                      <span className="text-[10px] md:text-xs font-mono font-medium tracking-wider text-slate-400 group-hover:text-cyan-200 uppercase">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPromoSquare(null)}
                className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-mono font-semibold tracking-wider text-slate-400 hover:text-white rounded-lg transition-all cursor-pointer border border-white/5"
              >
                CANCEL MOVE
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

