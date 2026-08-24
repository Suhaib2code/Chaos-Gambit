import { useMemo } from "react";
import { Button } from "./ui";
import { useSettings } from "../context";
import { THEME_COLORS, PIECE_SYMBOLS } from "./Pieces";
import { Crown, X, Play, Settings as SettingsIcon, Swords, Dices, Wand2, UserSearch, ArrowLeft, Snowflake, Sparkles } from "lucide-react";
import { motion } from "motion/react";

import { IceParticles } from "./IceParticles";

import frostCrystalsImg from "../assets/images/frost_crystals_1782057865257.jpg";
import actualDiceImg from "../assets/images/actual_dice_1782057882652.jpg";
import detectiveSilhouetteImg from "../assets/images/detective_silhouette_1782057897111.jpg";

export function Cover({ onPlay, onSettings }: { onPlay: () => void; onSettings: () => void }) {
  const closeTab = () => {
    try {
      window.close();
      alert("You can close this tab now.");
    } catch {
      alert("You can close this tab now.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-12 relative overflow-hidden bg-[#0C0C0E] px-4">
      {/* Ambient background glow blooms */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4F46E5]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#D97706]/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[35%] h-[35%] bg-[#7C3AED]/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Grid background overlay for faint chess vibe */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Cold Atmosphere Ice-Particle Floating background animations */}
      <IceParticles />

      {/* Dynamic Floating Glimpse 1: Frozen Spell Card (representing Spellbound mode) */}
      <motion.div
        initial={{ y: "-50%", rotate: -6 }}
        animate={{ 
          y: ["-53%", "-47%", "-53%"],
          rotate: [-6, -4, -6]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-4 md:left-8 lg:left-12 xl:left-20 w-56 h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-[2.5rem] backdrop-blur-xl bg-cyan-950/30 border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)] md:flex hidden flex-col items-center justify-center overflow-hidden p-0 select-none cursor-default group hover:border-cyan-400/60 hover:shadow-[0_0_70px_rgba(6,182,212,0.55)] transition-all duration-500 z-10"
      >
        <div className="relative w-full h-full">
          {/* Main frost crystals background */}
          <img 
            src={frostCrystalsImg} 
            alt="Ice Spellbound variant symbol" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000"
          />

          {/* Core Freezing animations overlay: Breathing shimmer */}
          <motion.div
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-t from-cyan-950/60 via-cyan-500/10 to-transparent pointer-events-none mix-blend-color-dodge"
          />

          {/* Ice Shimmering Line Sweep */}
          <motion.div
            animate={{ x: ["-100%", "250%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Freezing Particles (growing/floating snowflakes & sparkles) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 120 + 20, 
                y: Math.random() * 120 + 20, 
                scale: 0.3, 
                opacity: 0 
              }}
              animate={{ 
                scale: [0.3, 1, 0.3], 
                opacity: [0, 0.7, 0],
                y: [120, 10] 
              }}
              transition={{ 
                duration: 4 + Math.random() * 3, 
                repeat: Infinity, 
                delay: Math.random() * 2 
              }}
              className="absolute text-cyan-200 pointer-events-none text-xs"
            >
              ❄
            </motion.div>
          ))}

          {/* Sparkles on corner */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-3 right-3"
          >
            <Sparkles className="w-5 h-5 text-cyan-200 fill-cyan-200 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Dynamic Floating Glimpse 2: Shadow Detective Card (representing Mystery Piece mode) */}
      <motion.div
        initial={{ y: 0, rotate: 4 }}
        animate={{ 
          y: [10, -10, 10],
          rotate: [4, 6, 4]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="absolute top-24 right-10 lg:right-24 xl:right-32 w-44 h-44 md:w-52 md:h-52 rounded-[2rem] backdrop-blur-xl bg-yellow-950/30 border-2 border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.2)] md:flex hidden flex-col items-center justify-center overflow-hidden p-0 select-none cursor-default group hover:border-yellow-400/60 hover:shadow-[0_0_55px_rgba(234,179,8,0.35)] transition-all duration-500 z-10"
      >
        <div className="relative w-full h-full">
          {/* Main detective silhouette background */}
          <img 
            src={detectiveSilhouetteImg} 
            alt="Secret Mystery Piece variant symbol" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />

          {/* Soft yellow spotlight breathing glow */}
          <motion.div
            animate={{ opacity: [0.1, 0.35, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay pointer-events-none"
          />

          {/* Moving shadow / scan sweep for mystery feeling */}
          <motion.div
            animate={{ x: ["-150%", "150%"] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
            className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent skew-x-12 pointer-events-none"
          />
        </div>
      </motion.div>

      {/* Dynamic Floating Glimpse 3: Amber Dice Gambit Card (representing Dice Gambit mode) */}
      <motion.div
        initial={{ y: 0, rotate: 8 }}
        animate={{ 
          y: [12, -12, 12],
          rotate: [8, 12, 8],
          rotateX: [0, 8, 0],
          rotateY: [0, -8, 0]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="absolute bottom-28 right-10 lg:right-24 xl:right-32 w-44 h-44 md:w-52 md:h-52 rounded-[2rem] backdrop-blur-xl bg-red-950/20 border-2 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.2)] md:flex hidden flex-col items-center justify-center overflow-hidden p-0 select-none cursor-default group hover:border-red-400/60 hover:shadow-[0_0_55px_rgba(239,68,68,0.35)] transition-all duration-500 z-10"
      >
        <div className="relative w-full h-full">
          {/* Main dice background */}
          <img 
            src={actualDiceImg} 
            alt="Dice Gambit variant symbol" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          />

          {/* Soft warm breathing shine */}
          <motion.div 
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-red-500/5 mix-blend-color-dodge pointer-events-none"
          />
        </div>
      </motion.div>

      {/* Decorative Chess Glyphs floating in 3D-like depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* White Knight floating */}
        <motion.div 
          animate={{ y: [-15, 15, -15], rotate: [-12, -8, -12] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute top-[12%] right-[22%] text-7xl text-white/5 drop-shadow-lg filter blur-[0.5px]"
        >
          ♞
        </motion.div>
        {/* Black Queen floating */}
        <motion.div 
          animate={{ y: [10, -10, 10], rotate: [12, 18, 12] }}
          transition={{ duration: 11, repeat: Infinity }}
          className="absolute bottom-[20%] left-[25%] text-8xl text-white/5 drop-shadow-lg filter blur-[1px]"
        >
          ♛
        </motion.div>
        {/* White Pawn floating tiny */}
        <motion.div 
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-[45%] left-[18%] text-4xl text-white/5"
        >
          ♟
        </motion.div>
      </div>

      {/* Tilted Ice-Themed Chessboard Background */}
      <div 
        className="absolute w-[360px] h-[360px] md:w-[600px] md:h-[600px] opacity-25 md:opacity-40 pointer-events-none select-none overflow-hidden rounded-[2rem] z-0"
        style={{
          transform: "perspective(1200px) rotateX(54deg) rotateZ(-32deg) translateY(20px)",
          transformStyle: "preserve-3d",
          boxShadow: "0 0 100px rgba(6, 182, 212, 0.12)"
        }}
      >
        <div className="grid grid-cols-8 grid-rows-8 w-full h-full border border-cyan-500/20 bg-cyan-950/20 backdrop-blur-[1px]">
          {Array.from({ length: 64 }).map((_, idx) => {
            const r = Math.floor(idx / 8);
            const c = idx % 8;
            const isLight = (r + c) % 2 === 0;
            return (
              <div 
                key={idx} 
                className={`w-full h-full flex items-center justify-center border-[0.5px] border-cyan-500/5 transition-colors duration-1000 ${
                  isLight 
                    ? 'bg-cyan-200/10' 
                    : 'bg-cyan-950/40'
                }`}
              >
                {/* Subtle frosty hints and symbols on few squares */}
                {(idx === 14 || idx === 25 || idx === 43 || idx === 52) && (
                  <span className="text-[10px] md:text-sm text-cyan-400/20">❄</span>
                )}
                {idx === 28 && (
                  <span className="text-xl md:text-2xl text-cyan-300/10 select-none font-sans">♔</span>
                )}
                {idx === 35 && (
                  <span className="text-xl md:text-2xl text-cyan-300/10 select-none font-sans">♞</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Glassmorphic Hero Panel */}
      <div className="relative text-center z-10 max-w-lg w-full px-6 py-12 rounded-[2.5rem] backdrop-blur-2xl bg-white/[0.03] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col items-center">
        
        {/* Subtle decorative Crown element */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] font-sans">
          <Crown className="w-7 h-7 text-purple-400 animate-pulse" />
        </div>

        <div className="relative mb-10 w-full">
          <h1 className="text-6xl md:text-7xl font-sans font-black tracking-tight text-white uppercase leading-none drop-shadow-sm select-none">
            Chaos
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-amber-400">
              Gambit
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-4 tracking-widest uppercase font-bold text-xs">
            Chess Redefined • Tactical Variants
          </p>
        </div>

        {/* Buttons Group */}
        <div className="flex flex-col gap-4 w-full sm:w-80">
          <Button 
            onClick={onPlay} 
            className="h-14 text-lg font-bold rounded-2xl w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_4px_20px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_30px_rgba(124,58,237,0.4)] transition-all duration-300"
          >
            <Play className="w-5 h-5 mr-3 fill-current" /> Play Game
          </Button>
          <Button 
            onClick={onSettings} 
            variant="outline" 
            className="h-14 text-lg font-bold rounded-2xl w-full border-white/10 bg-white/[0.02] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 text-white"
          >
            <SettingsIcon className="w-5 h-5 mr-3" /> Settings
          </Button>
          <Button 
            onClick={closeTab} 
            variant="ghost" 
            className="h-12 text-sm font-medium rounded-xl w-full text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200"
          >
            <X className="w-4 h-4 mr-2" /> Exit Hub
          </Button>
        </div>

      </div>

      {/* Decorative footer line */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-slate-600 text-[10px] font-bold tracking-[0.25em] uppercase pointer-events-none select-none z-10">
        Created for Ultimate Minds • v6.7
      </div>
    </div>
  );
}

export function ModeSelect({ onSelect, onBack, onSettings }: { onSelect: (m: string) => void; onBack: () => void; onSettings: () => void }) {
  const { settings, updateSettings } = useSettings();
  const modes = [
    { id: "classic", title: "Classic Clash", icon: Swords, desc: "Standard hotseat chess with shared time control.", color: "text-blue-400" },
    { id: "mystery", title: "Mystery Piece", icon: UserSearch, desc: "Secretly pick a piece. Ask questions to guess the opponent's piece.", color: "text-green-400" },
    { id: "dice", title: "Dice Gambit", icon: Dices, desc: "Roll 3 dice. Move 3 pieces in sequence based on the faces.", color: "text-amber-400" },
    { id: "spell", title: "Spellbound", icon: Wand2, desc: "Use Freeze and Jump spells to bend the rules.", color: "text-fuchsia-400" },
  ];

  return (
    <div className="flex flex-col p-10 max-w-6xl mx-auto h-full animate-in slide-in-from-bottom-8 fade-in duration-300">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">SELECT A <span className="text-purple-500">GAMBIT</span></h1>
        </div>
        <div className="flex gap-3">
          <button onClick={onSettings} className="px-6 py-2 bg-[#1A1A1E] border border-white/10 rounded-full text-sm font-medium hover:bg-white/5 transition-colors text-white flex items-center gap-2">
            <SettingsIcon className="w-4 h-4" /> Settings
          </button>
          <button onClick={onBack} className="px-6 py-2 bg-[#1A1A1E] border border-white/10 rounded-full text-sm font-medium hover:bg-white/5 transition-colors text-white flex items-center gap-2">
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-12 grid-rows-none md:grid-rows-6 gap-6 flex-grow pb-8">
        {/* Featured Mode: Spellbound Chess */}
        <button onClick={() => onSelect('spell')} className="col-span-1 border-purple-500/30 text-left md:col-span-8 md:row-span-4 bg-gradient-to-br from-[#1A1A1E] to-[#121216] border rounded-3xl p-8 relative overflow-hidden group transition-all hover:scale-[1.01] hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col items-start w-full focus:outline-none">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          </div>
          <div className="flex flex-col h-full w-full">
            <div className="flex justify-between items-start w-full">
              <div>
                <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest rounded-full border border-purple-500/20 mb-4 inline-block">Featured</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-none text-white tracking-tighter">Spellbound</h2>
                <p className="text-slate-400 max-w-md text-lg">Use Freeze and Jump spells to bend the rules. Manage cooldowns and manipulate the board physics to capture the King.</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                  <span className="text-purple-300 font-bold">5❄️</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/40">
                  <span className="text-purple-300 font-bold">2✨</span>
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-auto">
              <div className="px-6 py-3 bg-purple-600 group-hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all inline-block pointer-events-none">Play Spellbound</div>
            </div>
          </div>
        </button>

        {/* Mode: Dice Gambit */}
        <button onClick={() => onSelect('dice')} className="col-span-1 md:col-span-4 md:row-span-3 bg-[#1A1A1E] border border-white/5 hover:border-white/20 rounded-3xl p-6 flex flex-col text-left transition-all hover:scale-[1.02] group w-full focus:outline-none">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20 mb-4 transition-transform group-hover:scale-110">
             <Dices className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">Dice Gambit</h3>
          <p className="text-slate-500 text-sm mb-6">Roll 3 dice. Move 3 pieces in sequence based on the faces.</p>
          <div className="flex gap-2 mt-auto w-full">
            <div className="flex-1 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/50 text-xl font-bold group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">♞</div>
            <div className="flex-1 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/50 text-xl font-bold group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">♟</div>
            <div className="flex-1 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/50 text-xl font-bold group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">♛</div>
          </div>
        </button>

        {/* Mode: Mystery Piece */}
        <button onClick={() => onSelect('mystery')} className="col-span-1 md:col-span-4 md:row-span-3 bg-[#1A1A1E] border border-white/5 hover:border-white/20 rounded-3xl p-6 flex flex-col text-left transition-all hover:scale-[1.02] group w-full focus:outline-none">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 mb-4 transition-transform group-hover:scale-110">
            <UserSearch className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-white">Mystery Piece</h3>
          <p className="text-slate-500 text-sm mb-4">Secretly pick a piece. Ask questions to guess the opponent's piece.</p>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-blue-400 mt-auto">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Pass-To-Reveal Enabled
          </div>
        </button>

        {/* Mode: Classic Clash */}
        <button onClick={() => onSelect('classic')} className="col-span-1 md:col-span-4 md:row-span-2 bg-[#1A1A1E] border border-white/5 hover:border-white/20 rounded-3xl p-6 flex items-center gap-6 text-left transition-all hover:scale-[1.02] group w-full focus:outline-none">
          <div className="w-16 h-16 min-w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
            <span className="text-4xl text-white/80">♔</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Classic Clash</h3>
            <p className="text-slate-500 text-sm">Standard hotseat chess with shared time control.</p>
          </div>
        </button>

        {/* Visual Decoration Box */}
        <div className="hidden md:flex col-span-1 md:col-span-4 md:row-span-2 bg-[#1A1A1E] border border-white/5 rounded-3xl p-4 gap-4 items-center">
          <div className="h-full w-auto aspect-square bg-[#332111] rounded-lg grid grid-cols-4 grid-rows-4 border border-[#1A1A1E] overflow-hidden opacity-80 pointer-events-none select-none">
            {Array.from({ length: 16 }).map((_, i) => {
              const r = Math.floor(i / 4);
              const c = i % 4;
              const isLight = (r + c) % 2 === 0;
              return (
                <div key={i} style={{ backgroundColor: isLight ? THEME_COLORS[settings.theme as keyof typeof THEME_COLORS].light : THEME_COLORS[settings.theme as keyof typeof THEME_COLORS].dark }}></div>
              );
            })}
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Engine Default</span>
            <span className="text-sm font-bold text-white mb-2 tracking-tight capitalize">{settings.theme}</span>
            <div className="flex gap-1">
              {Object.entries(THEME_COLORS).map(([key, colors]) => (
                <button
                  key={key}
                  onClick={() => updateSettings({ theme: key as any })}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${settings.theme === key ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}`}
                  style={{ backgroundColor: colors.dark }}
                  aria-label={key}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Status Bar */}
      <footer className="mt-8 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[10px] md:text-[11px] font-bold tracking-widest uppercase border-t border-white/5 pt-6 w-full">
        <div className="flex gap-4 md:gap-6 mb-4 md:mb-0">
          <span>Session: Active</span>
          <span>Variant: Multiple</span>
          <span className="text-purple-500">Engine: Chaos.v6.7</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <a 
            href="https://www.chess.com/member/mastermind_s7" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-[14px] md:text-[15px] hover:text-white transition-colors normal-case"
          >
            Mastermind_S7
          </a>
        </div>
      </footer>
    </div>
  );
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = (t: any) => updateSettings({ theme: t });

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-4xl mx-auto h-full animate-in fade-in duration-300 w-full">
      <div className="w-full mb-8">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
      </div>

      <h2 className="text-4xl font-bold text-white mb-12 tracking-widest border-b border-gray-800 pb-4 w-full">SETTINGS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full text-white">
        
        <div className="space-y-8">
          <div>
            <label className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4 block">Board Theme</label>
            <div className="flex gap-4">
              {Object.keys(THEME_COLORS).map(k => (
                <button
                  key={k}
                  onClick={() => handleThemeChange(k)}
                  className={`w-16 h-16 rounded-2xl border-4 overflow-hidden flex flex-col ${settings.theme === k ? 'border-purple-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                >
                  {/* Fake mini board */}
                  <div className="flex-1 flex w-full">
                    <div className="flex-1" style={{backgroundColor: THEME_COLORS[k as keyof typeof THEME_COLORS].light}} />
                    <div className="flex-1" style={{backgroundColor: THEME_COLORS[k as keyof typeof THEME_COLORS].dark}} />
                  </div>
                  <div className="flex-1 flex w-full">
                    <div className="flex-1" style={{backgroundColor: THEME_COLORS[k as keyof typeof THEME_COLORS].dark}} />
                    <div className="flex-1" style={{backgroundColor: THEME_COLORS[k as keyof typeof THEME_COLORS].light}} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4 block">Piece Style</label>
            <div className="flex gap-4">
              {['solid', 'flat'].map((k, i) => (
                <button
                  key={k}
                  onClick={() => updateSettings({ pieceStyle: k as any })}
                  className={`px-6 py-4 rounded-2xl border border-gray-700 bg-gray-800 flex items-center justify-center text-4xl hover:bg-gray-700 transition-all ${settings.pieceStyle === k ? 'ring-2 ring-purple-500' : ''}`}
                >
                  <span className={k === 'solid' ? "text-white" : "text-[#b0b6c6]"} style={{ WebkitTextStroke: k === 'solid' ? "1.5px rgba(0,0,0,0.8)" : undefined, textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>
                    {PIECE_SYMBOLS[k as 'solid'|'flat'].n}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Toggle label="Enable Sounds" checked={settings.soundEnabled} onChange={(v) => updateSettings({soundEnabled: v})} />
          <Toggle label="Show Coordinates" checked={settings.showCoords} onChange={(v) => updateSettings({showCoords: v})} />
          <Toggle label="Highlight Legal Moves" checked={settings.highlightLegal} onChange={(v) => updateSettings({highlightLegal: v})} />
          <Toggle label="Confirm Moves (Tap to confirm)" checked={settings.confirmMove} onChange={(v) => updateSettings({confirmMove: v})} />
          
          <div className="pt-4">
            <label className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-4 block">Animation Speed</label>
            <div className="flex bg-gray-800 p-1 rounded-xl">
              {['slow','normal','fast'].map(s => (
                <button
                  key={s}
                  onClick={() => updateSettings({ animSpeed: s as any })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold uppercase transition-colors ${settings.animSpeed === s ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v:boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-purple-600' : 'bg-gray-700'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
      </div>
    </label>
  );
}
