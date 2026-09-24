import React from "react";
import { User } from "lucide-react";
import { ChessPieceSVG } from "./ChessBoard";
import { useSettings } from "../context";
import { cn } from "../lib/utils";

interface PlayerBarProps {
  name: string;
  color: "w" | "b";
  capturedPieces: import("../game/engine").PieceType[];
  advantage: number;
  isActive: boolean;
  time?: string;
  className?: string;
}

export function PlayerBar({ name, color, capturedPieces, advantage, isActive, time, className }: PlayerBarProps) {
  const { settings } = useSettings();

  return (
    <div aria-current={isActive ? "step" : undefined} className={cn("flex justify-between items-center w-full bg-[#1A1A1E]/80 backdrop-blur-md px-4 py-2 sm:px-6 sm:py-3 rounded-xl border transition-colors", isActive ? "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/5", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", color === "w" ? "bg-white text-gray-900 border-gray-200" : "bg-gray-800 text-white border-gray-700")}>
          <User className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight text-white/90 text-sm sm:text-base", isActive && "text-white")}>{name}</span>
          {isActive && <span role="status" aria-live="polite" className="sr-only">Current turn: {name}</span>}
          <div className="flex items-center gap-1 min-h-[1.5rem]">
            {capturedPieces.map((p, i) => (
              <span key={i} className="flex h-5 w-5 items-center justify-center drop-shadow-md">
                <ChessPieceSVG type={p} color={color === 'w' ? 'b' : 'w'} fillStyle={settings.pieceStyle} className="!h-full !w-full" />
              </span>
            ))}
            {advantage > 0 && (
              <span className="text-xs font-bold text-gray-400 ml-1">+{advantage}</span>
            )}
          </div>
        </div>
      </div>
      {time && (
        <div className={cn("text-xl sm:text-2xl font-mono px-3 py-1 rounded-lg border", isActive ? "bg-white text-black border-white" : "bg-[#25252A] text-white/80 border-white/10")}>
          {time}
        </div>
      )}
    </div>
  );
}
