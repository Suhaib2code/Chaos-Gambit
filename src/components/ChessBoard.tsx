import { useId, useState, useEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "../lib/utils";
import { GameState, Square, Move, PieceType, Color } from "../game/engine";
import { useSettings } from "../context";
import { THEME_COLORS } from "./Pieces";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Snowflake, Wand2 } from "lucide-react";

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
      className={cn("w-[88%] h-[88%] select-none pointer-events-none drop-shadow-md inline-block align-middle", className)}
    >
      <defs>
        <mask id={maskId}>
          {/* Everything white remains visible */}
          <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
          {/* The diagonal opening gives the mitre its recognizable silhouette. */}
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
        {/* Tall, flared mitre with a jewel finial. */}
        <path d="M31 66 C32 53 35 38 42 28 L50 18 L58 28 C65 38 68 53 69 66 Z" />
        <path d="M35 62 C42 59 58 59 65 62" fill="none" stroke={hasColor ? (color === "w" ? "rgba(0,0,0,.42)" : "rgba(255,255,255,.42)") : "#7dd3fc"} strokeWidth="2" />
        <path d="M50 27 L45 38 L55 49 L46 60" fill="none" stroke={hasColor ? (color === "w" ? "rgba(0,0,0,.72)" : "rgba(255,255,255,.78)") : "#7dd3fc"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M50 8 L57 16 L50 24 L43 16 Z" fill="#67e8f9" stroke={stroke} strokeWidth={hasColor && isSolid ? "2" : "0"} />
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
      className={cn("w-[95%] h-[95%] select-none pointer-events-none drop-shadow-md inline-block align-middle", className)}
    >
      <defs>
        <radialGradient id={`${maskId}-aura`}>
          <stop offset="0%" stopColor="#fde68a" stopOpacity=".3" />
          <stop offset="60%" stopColor="#fbbf24" stopOpacity=".13" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${maskId}-gem`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#fff7cc" />
          <stop offset=".45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
        <filter id={`${maskId}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <g 
        fill={fill} 
        stroke={stroke} 
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      >
        {/* Warm royal aura behind the silhouette. */}
        <circle cx="50" cy="47" r="47" fill={`url(#${maskId}-aura)`} stroke="#fbbf24" strokeOpacity=".42" strokeWidth="1.5" strokeDasharray="2 5" />
        <path d="M50 1 L50 10 M18 12 L25 21 M82 12 L75 21 M3 42 L14 44 M97 42 L86 44" fill="none" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" opacity=".8" filter={`url(#${maskId}-glow)`} />
        {/* Heavy plinth and armored mantle. */}
        <path d="M17 86 C20 80 29 77 39 76 L35 68 L29 55 L38 48 L44 54 L50 43 L56 54 L62 48 L71 55 L65 68 L61 76 C71 77 80 80 83 86 Q84 91 76 91 H24 Q16 91 17 86 Z" />
        <path d="M28 73 Q50 68 72 73 M34 81 Q50 77 66 81" fill="none" stroke="#fbbf24" strokeOpacity=".85" strokeWidth="2" />
        {/* Crown: three spear points, broad shoulders, and a bright central jewel. */}
        <path d="M27 54 L19 30 L35 39 L37 18 L49 34 L50 11 L52 34 L64 18 L66 39 L82 30 L73 54 L69 66 H31 Z" />
        <path d="M26 53 Q50 60 74 53" fill="none" stroke="#fcd34d" strokeOpacity=".9" strokeWidth="2.4" />
        <circle cx="19" cy="28.5" r="3.2" fill={`url(#${maskId}-gem)`} stroke={stroke} strokeWidth={hasColor && isSolid ? "1.4" : "0"} />
        <circle cx="81" cy="28.5" r="3.2" fill={`url(#${maskId}-gem)`} stroke={stroke} strokeWidth={hasColor && isSolid ? "1.4" : "0"} />
        <path d="M50 26 L57 34 L50 43 L43 34 Z" fill={`url(#${maskId}-gem)`} stroke={stroke} strokeWidth={hasColor && isSolid ? "1.4" : "0"} filter={`url(#${maskId}-glow)`} />
      </g>
    </svg>
  );
}

/** Original vector silhouettes keep every piece crisp and consistently scaled at any board size. */
function CustomChessPieceSVG({
  type,
  color,
  fillStyle,
  className,
}: {
  type: Exclude<PieceType, 'k' | 'b'>;
  color: 'w' | 'b';
  fillStyle: string;
  className?: string;
}) {
  const gradientId = `piece-${type}-${useId().replace(/:/g, '')}`;
  const solid = fillStyle === 'solid';
  const fill = color === 'w' ? '#ffffff' : '#101216';
  const outline = solid ? (color === 'w' ? '#11151b' : '#f8fafc') : 'none';
  const outlineWidth = solid ? 3 : 0;
  const accent = type === 'q' ? '#e879f9' : type === 'n' ? '#60a5fa' : type === 'p' ? '#a5f3fc' : '#fbbf24';

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={cn(
      'select-none pointer-events-none inline-block align-middle drop-shadow-md',
      type === 'p' ? 'w-[82%] h-[82%]' : 'w-[84%] h-[84%]',
      className
    )}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff7cc" />
          <stop offset=".48" stopColor={accent} />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      <g fill={fill} stroke={outline} strokeWidth={outlineWidth} strokeLinejoin="round" strokeLinecap="round">
        {type === 'q' && <>
          <path d="M17 83 Q20 77 31 76 L35 68 Q50 62 65 68 L69 76 Q80 77 83 83 L81 90 H19 Z" />
          <path d="M34 70 L29 48 L23 35 L39 44 L50 28 L61 44 L77 35 L71 49 L66 70 Z" />
          <path d="M29 49 Q50 57 71 49 M34 75 Q50 70 66 75" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
          <circle cx="23" cy="32" r="5" fill={`url(#${gradientId})`} />
          <circle cx="50" cy="24" r="5.5" fill={`url(#${gradientId})`} />
          <circle cx="77" cy="32" r="5" fill={`url(#${gradientId})`} />
          <circle cx="39" cy="42" r="2.5" fill={accent} stroke="none" />
          <circle cx="61" cy="42" r="2.5" fill={accent} stroke="none" />
        </>}
        {type === 'r' && <>
          <path d="M15 85 Q19 78 31 77 L34 71 H66 L69 77 Q81 78 85 85 L83 91 H17 Z" />
          <path d="M28 70 V35 H22 V20 H36 V27 H43 V18 H57 V27 H64 V20 H78 V35 H72 V70 Z" />
          <path d="M22 36 H78 M34 45 H66 M34 62 H66" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
          <path d="M41 47 V57 M59 47 V57" fill="none" stroke={accent} strokeWidth="3" />
          <path d="M37 72 H63" fill="none" stroke={accent} strokeWidth="2" />
        </>}
        {type === 'n' && <>
          <path d="M18 85 Q23 77 38 76 H76 Q82 78 83 87 L79 91 H20 Z" />
          <path d="M32 75 Q28 65 32 54 Q36 43 48 37 L37 25 L40 13 L52 23 L66 26 L77 39 Q82 48 74 55 L67 61 L68 75 Z" />
          <path d="M40 15 L51 30 L62 30 L71 41 Q76 48 68 54 L57 62 L58 75" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
          <path d="M37 42 Q49 48 61 43" fill="none" stroke={accent} strokeWidth="2.5" />
          <circle cx="65" cy="35" r="3.2" fill={accent} stroke={outline} strokeWidth={solid ? 1.2 : 0} />
          <path d="M32 54 L24 60 L39 61" />
        </>}
        {type === 'p' && <>
          <path d="M18 86 Q22 78 35 77 L39 69 H61 L65 77 Q78 78 82 86 L80 91 H20 Z" />
          <path d="M35 69 Q36 61 42 56 Q35 50 35 41 A15 15 0 0 1 65 41 Q65 50 58 56 Q64 61 65 69 Z" />
          <path d="M39 73 Q50 69 61 73 M42 61 Q50 65 58 61" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" />
          <circle cx="50" cy="39" r="2.2" fill={accent} stroke="none" />
        </>}
      </g>
    </svg>
  );
}

export function ChessPieceSVG({
  type,
  color,
  fillStyle,
  className,
}: {
  type: PieceType;
  color: 'w' | 'b';
  fillStyle: string;
  className?: string;
}) {
  if (type === 'k') return <CustomKingSVG color={color} fillStyle={fillStyle} className={className} />;
  if (type === 'b') return <CustomBishopSVG color={color} fillStyle={fillStyle} className={className} />;
  return <CustomChessPieceSVG type={type} color={color} fillStyle={fillStyle} className={className} />;
}

export type SpellJumpAnimation = { id: number; from: Square; to: Square; piece: PieceType; color: Color };
type FrozenBoardSquare = Square & { castId?: number; center?: Square };

interface ChessBoardProps {
  state: GameState;
  onSquareClick?: (r: number, c: number, promotion?: PieceType) => void;
  selectedSquare: Square | null;
  legalMoves: Move[];
  flipped?: boolean;
  frozenSquares?: FrozenBoardSquare[];
  animateSpellEffects?: boolean;
  jumpAnimation?: SpellJumpAnimation | null;
  onJumpAnimationComplete?: () => void;
  jumpSquare?: Square | null;
  duckSquare?: Square | null;
  duckPlacementMode?: boolean;
  highlightedSquares?: Square[];
  disabled?: boolean;
  readOnly?: boolean;
}

export function ChessBoard({
  state,
  onSquareClick,
  selectedSquare,
  legalMoves,
  flipped = false,
  frozenSquares = [],
  animateSpellEffects = false,
  jumpAnimation = null,
  onJumpAnimationComplete,
  jumpSquare = null,
  duckSquare = null,
  duckPlacementMode = false,
  highlightedSquares = [],
  disabled = false,
  readOnly = false,
}: ChessBoardProps) {
  const { settings } = useSettings();
  const theme = THEME_COLORS[settings.theme];

  const [delayedFlipped, setDelayedFlipped] = useState(flipped);
  const [promoSquare, setPromoSquare] = useState<{ r: number; c: number } | null>(null);
  const [focusedSquare, setFocusedSquare] = useState<Square | null>(null);
  const squareRefs = useRef(new Map<string, HTMLButtonElement>());
  const boardRef = useRef<HTMLDivElement>(null);
  const [jumpMetrics, setJumpMetrics] = useState<{ id: number; dx: number; dy: number; lift: number; from: Square } | null>(null);
  const reduceMotion = useReducedMotion();
  const isReadOnly = readOnly || disabled || !onSquareClick;

  const initialFocus = focusedSquare ?? { r: state.turn === "w" ? 7 : 0, c: 0 };

  useEffect(() => {
    setPromoSquare(null);
  }, [selectedSquare, state.turn]);

  useEffect(() => {
    // Keep the board orientation steady until the jump arc has crossed the board.
    if (jumpAnimation) return;
    // Wait for the piece movement animation to settle before rotating the board
    const duration = reduceMotion ? 0 : settings.animSpeed === "fast" ? 180 : settings.animSpeed === "slow" ? 750 : 450;
    const timer = setTimeout(() => {
      setDelayedFlipped(flipped);
    }, duration);
    return () => clearTimeout(timer);
  }, [flipped, settings.animSpeed, reduceMotion, jumpAnimation?.id]);

  useEffect(() => {
    if (!jumpAnimation) { setJumpMetrics(null); return; }
    const bounds = boardRef.current?.getBoundingClientRect();
    const squareSize = bounds ? (bounds.width - 8) / 8 : 0;
    const orient = (square: Square) => delayedFlipped ? { r: 7 - square.r, c: 7 - square.c } : square;
    const from = orient(jumpAnimation.from);
    const to = orient(jumpAnimation.to);
    setJumpMetrics({ id: jumpAnimation.id, dx: (to.c - from.c) * squareSize, dy: (to.r - from.r) * squareSize, lift: squareSize * 0.95, from });
  }, [jumpAnimation?.id]);

  const handleSquareClickInternal = (r: number, c: number) => {
    if (disabled || isReadOnly) return;
    const isPromo = legalMoves.some((m) => m.to.r === r && m.to.c === c && m.promotion);
    const isMoveTarget = legalMoves.some((m) => m.to.r === r && m.to.c === c);
    if (isMoveTarget && settings.confirmMove && !window.confirm("Make this move?")) return;
    if (isPromo) {
      setPromoSquare({ r, c });
    } else {
      if (isMoveTarget && settings.soundEnabled) {
        try {
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = state.board[r][c] ? 520 : 390;
          gain.gain.setValueAtTime(0.08, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.09);
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.09);
          oscillator.onended = () => void audioContext.close();
        } catch { /* Audio can be unavailable or blocked by the browser. */ }
      }
      onSquareClick(r, c);
    }
  };

  const handleSquareKeyDown = (event: KeyboardEvent<HTMLButtonElement>, r: number, c: number) => {
    if (disabled || isReadOnly) return;
    const vertical = flipped ? 1 : -1;
    const horizontal = flipped ? 1 : -1;
    const delta = event.key === "ArrowUp" ? { r: vertical, c: 0 }
      : event.key === "ArrowDown" ? { r: -vertical, c: 0 }
      : event.key === "ArrowLeft" ? { r: 0, c: horizontal }
      : event.key === "ArrowRight" ? { r: 0, c: -horizontal }
      : null;
    if (!delta) return;
    event.preventDefault();
    const next = { r: Math.max(0, Math.min(7, r + delta.r)), c: Math.max(0, Math.min(7, c + delta.c)) };
    setFocusedSquare(next);
    squareRefs.current.get(`${next.r}-${next.c}`)?.focus();
  };

  const rows = [];
  for (let r = 0; r < 8; r++) {
    const row = [];
    for (let c = 0; c < 8; c++) {
      const isLight = (r + c) % 2 === 0;
      const bg = isLight ? theme.light : theme.dark;

      const piece = state.board[r][c];
      const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
      const moveTarget = legalMoves.find((m) => m.to.r === r && m.to.c === c);
      const frozenSquare = frozenSquares.find((sq) => sq.r === r && sq.c === c);
      const isFrozen = !!frozenSquare;
      const isJump = jumpSquare?.r === r && jumpSquare?.c === c;
      const isDuck = duckSquare?.r === r && duckSquare?.c === c;
      const isHighlighted = highlightedSquares.some(sq => sq.r === r && sq.c === c);
      const squareName = `${String.fromCharCode(97 + c)}${8 - r}`;
      const englishPieceNames = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" } as const;
      const arabicPieceNames = { p: "بيدق", n: "حصان", b: "فيل", r: "قلعة", q: "وزير", k: "ملك" } as const;
      const pieceName = piece
        ? settings.locale === "ar"
          ? `${piece.color === "w" ? "الأبيض" : "الأسود"} ${arabicPieceNames[piece.type]}`
          : `${piece.color === "w" ? "White" : "Black"} ${englishPieceNames[piece.type]}`
        : settings.locale === "ar" ? "فارغ" : "empty";
      const statusWords = settings.locale === "ar"
        ? { selected: "محدد", target: "هدف نقلة قانونية", frozen: "متجمد", phase: "مصدر العبور", duck: "بطة تسد المربع", duckTarget: "هدف صالح لوضع البطة", center: "مربع الهدف المركزي" }
        : { selected: "selected", target: "legal move target", frozen: "frozen", phase: "phase source", duck: "duck blocker", duckTarget: "valid duck placement square", center: "central objective square" };
      const squareDescription = [squareName, pieceName, isSelected ? statusWords.selected : "", moveTarget ? statusWords.target : "", isFrozen ? statusWords.frozen : "", isJump ? statusWords.phase : "", isDuck ? statusWords.duck : "", duckPlacementMode && !piece && !isDuck ? statusWords.duckTarget : "", isHighlighted ? statusWords.center : ""].filter(Boolean).join(", ");

      row.push(
        <button
          key={`${r}-${c}`}
          ref={(element) => {
            if (element) squareRefs.current.set(`${r}-${c}`, element);
            else squareRefs.current.delete(`${r}-${c}`);
          }}
          type="button"
          role="gridcell"
          aria-label={squareDescription}
          aria-selected={isSelected}
          disabled={isReadOnly || disabled}
          tabIndex={!isReadOnly && !disabled && initialFocus.r === r && initialFocus.c === c ? 0 : -1}
          onFocus={() => setFocusedSquare({ r, c })}
          onKeyDown={(event) => handleSquareKeyDown(event, r, c)}
          onClick={() => handleSquareClickInternal(r, c)}
          className={cn(
            "relative flex min-w-0 items-center justify-center w-full aspect-square appearance-none border-0 p-0 cursor-pointer select-none leading-none focus-visible:z-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-cyan-100",
            (readOnly || disabled) && "cursor-default"
          )}
          style={{ backgroundColor: bg, color: "inherit" }}
        >
          {isSelected && (
            <div className="absolute inset-0 bg-yellow-400 opacity-50 z-10" />
          )}

          {isHighlighted && <div aria-hidden="true" className="absolute inset-[7%] z-[9] rounded-[14%] border-2 border-cyan-100/80 shadow-[inset_0_0_14px_rgba(165,243,252,.45),0_0_13px_rgba(34,211,238,.48)] pointer-events-none" />}
          {duckPlacementMode && !piece && !isDuck && <div aria-hidden="true" className="absolute inset-[15%] z-[9] rounded-full border border-amber-50/75 bg-amber-200/10 shadow-[0_0_10px_rgba(251,191,36,.4)] pointer-events-none" />}
          {isDuck && <span aria-hidden="true" className="absolute inset-0 z-30 grid place-items-center text-[clamp(1rem,6vmin,3rem)] drop-shadow-[0_2px_5px_rgba(0,0,0,.8)] pointer-events-none">🦆</span>}

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
            <motion.div
              key={animateSpellEffects && frozenSquare?.castId ? `freeze-${frozenSquare.castId}-${r}-${c}` : `frozen-${r}-${c}`}
              initial={animateSpellEffects && frozenSquare?.castId && !reduceMotion ? { opacity: 0, transform: "scale(.72)" } : false}
              animate={{ opacity: 1, transform: "scale(1)" }}
              transition={{ duration: reduceMotion ? 0 : 0.32, delay: animateSpellEffects && frozenSquare?.center ? Math.max(Math.abs(r - frozenSquare.center.r), Math.abs(c - frozenSquare.center.c)) * 0.045 : 0, ease: [0.23, 1, 0.32, 1] }}
              className="freeze-tile absolute inset-0 z-20 flex items-center justify-center overflow-hidden border border-cyan-100/70 bg-[linear-gradient(135deg,rgba(220,252,255,.58),rgba(34,211,238,.2)_48%,rgba(8,145,178,.44))] shadow-[inset_0_0_18px_rgba(186,230,253,.68),0_0_12px_rgba(34,211,238,.3)] backdrop-blur-[2px] pointer-events-none"
            >
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(135deg,transparent_46%,rgba(255,255,255,.52)_48%,transparent_50%),linear-gradient(45deg,transparent_46%,rgba(165,243,252,.35)_48%,transparent_50%)] [background-size:18px_18px]" />
              <motion.div
                className="absolute -inset-1 rounded-full border border-cyan-50/45 shadow-[0_0_16px_rgba(224,242,254,.55)]"
                animate={reduceMotion ? undefined : { scale: [0.75, 1.35], opacity: [0.65, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
              <div className="absolute inset-[10%] border border-white/35 [clip-path:polygon(0_0,14%_0,14%_3%,3%_3%,3%_14%,0_14%,0_0,100%_0,100%_14%,97%_14%,97%_3%,86%_3%,86%_0,100%_0,100%_100%,86%_100%,86%_97%,97%_97%,97%_86%,100%_86%,100%_100%,0_100%,0_86%,3%_86%,3%_97%,14%_97%,14%_100%,0_100%)]" />
              <Snowflake className="relative h-[38%] w-[38%] text-white drop-shadow-[0_0_9px_rgba(224,242,254,.95)]" strokeWidth={1.25} />
              <span className="absolute bottom-1 right-1 rounded-sm bg-cyan-950/70 px-1 py-px text-[6px] font-black uppercase tracking-[.12em] text-cyan-50/90">ICE</span>
              {animateSpellEffects && frozenSquare?.center && frozenSquare.castId && <motion.span aria-hidden="true" className="freeze-fracture-ring absolute inset-[6%] rounded-[18%] border-2 border-white/90" initial={{ opacity: reduceMotion ? 0 : 0.9, transform: "scale(.62)" }} animate={{ opacity: 0, transform: "scale(1.3)" }} transition={{ duration: reduceMotion ? 0 : 0.44, delay: Math.max(Math.abs(r - frozenSquare.center.r), Math.abs(c - frozenSquare.center.c)) * 0.045, ease: [0.23, 1, 0.32, 1] }} />}
            </motion.div>
          )}
          {isJump && (
            <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden border border-fuchsia-200/80 bg-[radial-gradient(circle,rgba(232,121,249,.38)_0%,rgba(168,85,247,.22)_42%,rgba(88,28,135,.12)_100%)] shadow-[inset_0_0_22px_rgba(217,70,239,.5),0_0_12px_rgba(192,38,211,.38)] pointer-events-none">
              <motion.div className="absolute inset-[12%] rounded-full border border-fuchsia-100/75 border-dashed shadow-[0_0_10px_rgba(232,121,249,.8)]" animate={reduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} />
              <motion.div className="absolute h-[58%] w-[58%] rounded-full border border-fuchsia-200/50" animate={reduceMotion ? undefined : { scale: [0.8, 1.15], opacity: [0.65, 0.12] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
              <span className="relative grid h-[34%] w-[34%] place-items-center rounded-full bg-fuchsia-100/15 text-fuchsia-50 shadow-[0_0_18px_rgba(232,121,249,.55)]">
                <Wand2 className="h-[72%] w-[72%] drop-shadow-[0_0_6px_rgba(255,255,255,.9)]" />
              </span>
              <span className="absolute bottom-1 right-1 rounded-sm bg-fuchsia-950/75 px-1 py-px text-[6px] font-black uppercase tracking-[.1em] text-fuchsia-50/95">PHASE</span>
            </div>
          )}

          <AnimatePresence>
            {piece && (
              <motion.div
                key={piece.id || `${piece.color}${piece.type}-${r}-${c}`}
                layout="position"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: jumpAnimation?.to.r === r && jumpAnimation?.to.c === c ? 0 : isJump ? 0.42 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{
                  duration: reduceMotion ? 0 : undefined,
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
                  `chess-piece-render chess-piece-${piece.type} absolute inset-0 z-30 drop-shadow-md origin-center flex items-center justify-center transition-transform duration-[700ms] ease-in-out`,
                  piece.color === "w" ? "text-white" : "text-black",
                  delayedFlipped ? "rotate-180" : "rotate-0"
                )}
                style={{
                  WebkitTextStroke: (piece.type !== 'b' && piece.type !== 'k') ? (settings.pieceStyle === 'solid' ? (piece.color === "w" ? "1.5px rgba(0,0,0,0.85)" : "1.5px rgba(255,255,255,0.9)") : undefined) : undefined,
                  textShadow: (piece.type !== 'b' && piece.type !== 'k') ? (settings.pieceStyle === 'solid' ? (piece.color === "w" ? "0 2px 4px rgba(0,0,0,0.65)" : "0 0 4px rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.8)") : (piece.color === "w" ? "0 1px 3px rgba(0,0,0,0.4)" : undefined)) : undefined
                }}
              >
                <ChessPieceSVG type={piece.type} color={piece.color} fillStyle={settings.pieceStyle} />
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
        </button>
      );
    }
    rows.push(
      <div key={`row-${r}`} role="row" className="grid grid-cols-8 grid-rows-1 min-h-0">
        {row}
      </div>
    );
  }

  return (
    <div ref={boardRef} dir="ltr" className="chessboard-ltr w-auto h-full max-w-full max-h-full aspect-square mx-auto relative @container flex justify-center items-center">
      <div 
        className={cn(
          "w-full h-full rounded-sm overflow-hidden shadow-2xl grid grid-rows-8 border-4 border-gray-800/50 bg-gray-900 origin-center transition-transform duration-[700ms] ease-in-out",
          reduceMotion && "transition-none",
          delayedFlipped ? "rotate-180" : "rotate-0"
        )}
        role="grid"
        aria-label={isReadOnly ? "Chessboard replay position" : "Chessboard. Use arrow keys to move between squares and Enter or Space to select."}
        aria-rowcount={8}
        aria-colcount={8}
        aria-readonly={isReadOnly || undefined}
      >
        {rows}
      </div>

      {jumpAnimation && jumpMetrics?.id === jumpAnimation.id && <motion.div
        key={`phase-flight-${jumpAnimation.id}`}
        aria-hidden="true"
        className="phase-flight-layer"
        style={{ left: `${(jumpMetrics.from.c + 0.5) * 12.5}%`, top: `${(jumpMetrics.from.r + 0.5) * 12.5}%` }}
        initial={{ transform: "translate3d(0px,0px,0) scale(.92) rotate(0deg)" }}
        animate={{ transform: [
          "translate3d(0px,0px,0) scale(.92) rotate(0deg)",
          `translate3d(${jumpMetrics.dx / 2}px,${jumpMetrics.dy / 2 - jumpMetrics.lift}px,0) scale(1.16) rotate(-7deg)`,
          `translate3d(${jumpMetrics.dx}px,${jumpMetrics.dy}px,0) scale(1) rotate(0deg)`,
        ] }}
        transition={{ duration: reduceMotion ? 0 : 0.92, times: [0, 0.52, 1], ease: [0.77, 0, 0.175, 1] }}
        onAnimationComplete={onJumpAnimationComplete}
      ><ChessPieceSVG type={jumpAnimation.piece} color={jumpAnimation.color} fillStyle={settings.pieceStyle} /></motion.div>}

      <AnimatePresence>
        {promoSquare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex flex-col items-center justify-center rounded-sm p-4 text-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promotion-title"
            onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setPromoSquare(null); } }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="max-w-xs md:max-w-sm w-full"
            >
              <h3 id="promotion-title" className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase mb-6 font-sans">
                Choose Promotion
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { type: 'q', label: "Queen" },
                  { type: 'r', label: "Rook" },
                  { type: 'b', label: "Bishop" },
                  { type: 'n', label: "Knight" },
                ].map(({ type, label }) => {
                  return (
                    <button
                      key={type}
                      autoFocus={type === "q"}
                      onClick={() => {
                        onSquareClick?.(promoSquare.r, promoSquare.c, type as PieceType);
                        setPromoSquare(null);
                      }}
                      className="flex flex-col items-center justify-center p-4 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 hover:border-cyan-500/50 rounded-2xl group transition-all h-24 w-28 cursor-pointer shadow-lg"
                    >
                      <span className="mb-1 flex h-12 w-12 items-center justify-center drop-shadow-md transition-transform duration-200 group-hover:scale-110">
                        <ChessPieceSVG type={type as PieceType} color={state.turn} fillStyle={settings.pieceStyle} className="w-[92%] h-[92%]" />
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
