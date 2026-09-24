import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./ui";
import { useSettings } from "../context";
import { THEME_COLORS } from "./Pieces";
import { ChessPieceSVG } from "./ChessBoard";
import { ArrowLeft, Archive, Bird, Crown, Dices, ExternalLink, HelpCircle, Mountain, Play, RotateCcw, Settings as SettingsIcon, Shield, Swords, UserSearch, WandSparkles, X } from "lucide-react";
import { IceParticles } from "./IceParticles";
import { useVariantRules, type VariantId } from "../game/variantRules";
import spellboundArt from "../assets/images/spellbound_card_v2.png";
import mysteryArt from "../assets/images/detective_silhouette_1782057897111.jpg";
import diceArt from "../assets/images/actual_dice_1782057882652.jpg";
import kingHillArt from "../assets/images/king_of_the_hill_card_v2.png";
import duckChessArt from "../assets/images/duck_chess_card.png";

export type ModeId = VariantId | "hill" | "duck";
type ScreenMode = { id: ModeId; title: string; sub: string; detail: string; icon: typeof Swords; tone: string; glyph: string; label: string };
const modes: ScreenMode[] = [
  { id: "classic", title: "Classic Clash", sub: "Pure chess. Your clock, your pressure.", detail: "Take turns on a standard chessboard. Checkmate wins. Choose a time control in the Workshop before you begin.", icon: Swords, tone: "ice", glyph: "♔", label: "THE ORIGINAL" },
  { id: "mystery", title: "Mystery Piece", sub: "Hide one piece. Find theirs.", detail: "Each player secretly chooses one of their own pieces behind a pass-device handoff. Move, ask questions aloud, or spend a turn guessing. Capturing the hidden piece or checkmating wins the round.", icon: UserSearch, tone: "mint", glyph: "◉", label: "INFORMATION GAME" },
  { id: "dice", title: "Dice Gambit", sub: "The roll decides what can move.", detail: "Roll a set of piece types, then move one eligible piece for each face in sequence. A roll with no legal move is skipped. The standard rules let you win by capturing the king or checkmate.", icon: Dices, tone: "amber", glyph: "⚄", label: "CHANCE & TACTICS" },
  { id: "spell", title: "Spellbound", sub: "Spend magic to reshape a turn.", detail: "Each side begins with a limited supply of Freeze and Jump. Freeze locks a 3×3 patch for a turn; Jump lets one friendly piece phase through blockers. Checkmate still decides the game.", icon: WandSparkles, tone: "violet", glyph: "✧", label: "TACTICAL MAGIC" },
  { id: "hill", title: "King of the Hill", sub: "Reach the center. Hold your nerve.", detail: "Play standard chess with a center-based victory condition. The Workshop lets you choose the hill size and whether checkmate also wins.", icon: Mountain, tone: "teal", glyph: "♚", label: "CENTER RACE" },
  { id: "duck", title: "Duck Chess", sub: "Move a piece. Then move the blocker.", detail: "Each turn has two steps: move a chess piece, then move the duck to an empty square. The duck blocks pieces from landing on or passing through its square; knights can jump over it. Check and checkmate do not apply. Capture the enemy king to win. If a player has no legal move anywhere after the duck is placed, that player wins by stalemate.", icon: Bird, tone: "gold", glyph: "♞", label: "TACTICAL BLOCKER" },
];

export function Cover({ onPlay, onSettings }: { onPlay: () => void; onSettings: () => void }) {
  return (
    <main className="cover-screen">
      <div className="cover-grain" aria-hidden="true" />
      <div className="cover-cold-glow" aria-hidden="true" />
      <div className="cover-board" aria-hidden="true">
        {Array.from({ length: 64 }, (_, i) => <span key={i} className={(Math.floor(i / 8) + i % 8) % 2 ? "dark" : "light"}>{[0, 7, 56, 63].includes(i) ? "♜" : [3, 59].includes(i) ? "♛" : [4, 60].includes(i) ? "♚" : ""}</span>)}
      </div>
      <IceParticles />
      <header className="cover-topline"><a className="brand-mark" href="#home" aria-label="Chaos Gambit home"><Crown size={17} /></a><span>AN EXPERIMENT IN CHESS</span><div className="cover-tools"><LanguageToggle /><button className="cover-settings" onClick={onSettings}><SettingsIcon size={16} /> Settings</button></div></header>
      <section className="cover-hero" id="home">
      <p className="cover-kicker"><span /> SIX WAYS TO OUTTHINK THE BOARD</p>
        <h1>Chaos<br /><em>Gambit</em></h1>
        <p className="cover-copy">A familiar board in unfamiliar territory.<br className="desktop-break" /> Pick a variant. Make the next move matter.</p>
        <div className="cover-actions">
          <Button onClick={onPlay} className="cover-primary"><Play size={17} fill="currentColor" /> Choose your gambit</Button>
          <span className="cover-footnote"><Shield size={14} /> Six local two-player variants</span>
        </div>
      </section>
      <footer className="cover-footer"><span>01 — 06</span><span>THE BOARD IS NEVER THE SAME TWICE</span><span>SCROLL? THERE IS NO OTHER SIDE.</span></footer>
      <div className="cover-side-note" aria-hidden="true">THINK COLD. MOVE BOLD.</div>
    </main>
  );
}

function LanguageToggle() {
  const { settings, updateSettings } = useSettings();
  const isArabic = settings.locale === "ar";
  return <button type="button" data-no-translate className="language-toggle" onClick={() => updateSettings({ locale: isArabic ? "en" : "ar" })} aria-label={isArabic ? "Switch language to English" : "Switch language to Arabic"} lang={isArabic ? "en" : "ar"}>{isArabic ? "English" : "العربية"}</button>;
}

const guideContent: Record<ModeId, { title: string; steps: string[] }> = {
  classic: { title: "A clean game of chess", steps: ["White moves first; then alternate turns.", "Select a piece, then a highlighted legal square.", "Checkmate ends the game. Use the move log to review the line."] },
  mystery: { title: "Hide. Move. Discover.", steps: ["White secretly marks one of their pieces, then passes the device to Black.", "Black marks a piece without seeing White’s choice; play then begins.", "On your turn, move, ask a question aloud, or guess a piece. Guessing costs your turn; a correct guess wins the round."] },
  dice: { title: "Let the roll narrow the board", steps: ["Roll to reveal the piece types you may move this turn.", "Play the shown types from left to right; impossible rolls are skipped.", "A king capture or checkmate ends the standard game. Change roll behavior in the Workshop."] },
  spell: { title: "Use magic with intent", steps: ["Choose Freeze, then a target square to freeze its surrounding area.", "Choose Jump, then a friendly piece to let it phase through blockers.", "Spells have limited uses and cooldowns. Checkmate still wins."] },
  hill: { title: "The center is another checkmate", steps: ["Move and capture by standard chess rules.", "Win by checkmate or by moving your king to a highlighted center square.", "Your king still cannot move into check. The hill win is checked immediately after each legal move."] },
  duck: { title: "Two actions. One tactical turn.", steps: ["Move one chess piece using standard movement; checks are ignored.", "Place the duck on an empty square. The Workshop can allow it to stay in place. It blocks every piece except that knights can jump over it.", "Capture the opposing king to win. The Workshop sets the result if the next player has no legal move after duck placement."] },
};

export function ModeSelect({ onSelect, onBack, onSettings, onArchive }: { onSelect: (m: ModeId) => void; onBack: () => void; onSettings: () => void; onArchive: () => void }) {
  const { settings, updateSettings } = useSettings();
  const { rules, updateRules, applyPreset, resetRules } = useVariantRules();
  const [guided, setGuided] = useState<ModeId | null>(null);
  const [workshop, setWorkshop] = useState(false);
  const guideTriggerRef = useRef<HTMLButtonElement>(null);
  const guideCloseRef = useRef<HTMLButtonElement>(null);
  const guidePanelRef = useRef<HTMLElement>(null);
  const selectedTheme = THEME_COLORS[settings.theme as keyof typeof THEME_COLORS] ?? THEME_COLORS.midnight;
  const chosen = guided ? modes.find((mode) => mode.id === guided)! : null;

  useEffect(() => {
    if (!guided) return;
    guideCloseRef.current?.focus();
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setGuided(null); return; }
      if (event.key !== "Tab" || !guidePanelRef.current) return;
      const items = Array.from(guidePanelRef.current.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')) as HTMLElement[];
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeys);
    return () => { document.removeEventListener("keydown", handleKeys); guideTriggerRef.current?.focus(); };
  }, [guided]);

  return (
    <main className="menu-screen">
      <header className="menu-header">
        <button className="menu-brand" onClick={onBack} aria-label="Back to title"><span><Crown size={18} /></span><span>CHAOS <b>GAMBIT</b></span></button>
        <div className="menu-header-actions"><LanguageToggle /><button onClick={() => setWorkshop((open) => !open)} aria-expanded={workshop} className={workshop ? "active" : ""}><SettingsIcon size={16} /> Workshop</button><button onClick={onArchive}><Archive size={16} /> Archive</button><button onClick={onSettings}><SettingsIcon size={16} /> Display</button><button className="back-button" onClick={onBack} aria-label="Back to title"><X size={16} /><span>Back</span></button></div>
      </header>
      <section className="menu-intro"><div><p className="eyebrow"><span /> THE NEXT MOVE IS YOURS</p><h1>Choose your <em>gambit.</em></h1><p>Six local games. Six different kinds of pressure.</p></div><button ref={guideTriggerRef} className="guide-trigger" onClick={() => setGuided("classic")}><HelpCircle size={17} /> How to play <span>↗</span></button></section>

      <section className="mode-grid" aria-label="Choose a game mode">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return <article className={`mode-card mode-${mode.tone}`} key={mode.id}>
            <button type="button" className="mode-card-main" onClick={() => onSelect(mode.id)} aria-label={`Play ${mode.title}`}>
              <div className="mode-art" aria-hidden="true">
                {mode.id === "mystery" && <img src={mysteryArt} alt="" />}
                {mode.id === "dice" && <img src={diceArt} alt="" />}
                {mode.id === "spell" && <img src={spellboundArt} alt="" />}
                {mode.id === "hill" && <img src={kingHillArt} alt="" />}
                {mode.id === "duck" && <img src={duckChessArt} alt="" />}
                {mode.id === "classic" && <div className="classic-art"><span>♜</span><span>♞</span><span>♛</span><span>♚</span><span>♟</span></div>}
              </div>
              <div className="mode-card-top"><span className="mode-number">0{index + 1}</span><span className="mode-glyph" aria-hidden="true">{mode.glyph}</span></div>
              <div className="mode-card-copy"><span className="mode-label">{mode.label}</span><h2>{mode.title}</h2><p>{mode.sub}</p></div>
              <span className="mode-play"><Icon size={16} /> Play mode <span>→</span></span>
            </button>
            <div className="mode-card-actions"><button className="mode-help" aria-label={`Learn ${mode.title}`} onClick={() => setGuided(mode.id)}>Rules</button></div>
          </article>;
        })}
      </section>

      <section className="menu-utility">
        <div className="board-preview" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <span key={i} style={{ background: (Math.floor(i / 4) + i % 4) % 2 ? selectedTheme.dark : selectedTheme.light }} />)}</div>
        <div className="menu-utility-copy"><strong>Your table, your look</strong><span>Board theme · {settings.theme}</span></div>
        <div className="theme-dots" role="group" aria-label="Choose board theme">{Object.entries(THEME_COLORS).map(([key, colors]) => <button key={key} onClick={() => updateSettings({ theme: key as keyof typeof THEME_COLORS })} className={settings.theme === key ? "selected" : ""} style={{ backgroundColor: colors.dark, ["--theme-color" as string]: colors.dark }} aria-label={`${key} board theme`} aria-pressed={settings.theme === key} />)}</div>
        <button className="utility-link" onClick={() => setWorkshop((open) => !open)} aria-expanded={workshop}>Tune variant rules <span>→</span></button>
      </section>

      {workshop && <section className="workshop-panel" aria-labelledby="workshop-heading">
        <div className="workshop-heading"><div><p className="eyebrow">YOUR TABLE, YOUR RULES</p><h2 id="workshop-heading">Variant workshop</h2><p>Choose a preset or tune a rule. Changes save on this device and apply to new games.</p></div><button className="quiet-action" onClick={resetRules}><RotateCcw size={15} /> Reset defaults</button></div>
        <div className="workshop-grid">
          <WorkshopGroup title="Classic Clash" hint="Clock settings · applies to Classic games" presets={[["blitz", "Blitz"], ["rapid", "Rapid"], ["relaxed", "Relaxed"]]} onPreset={(preset) => applyPreset("classic", preset)}>
            <NumberSetting label="Minutes per player" value={rules.classic.timeMinutes} min={1} max={180} unit="min" onChange={(value) => updateRules({ classic: { timeMinutes: value } })} />
            <NumberSetting label="Increment per move" value={rules.classic.incrementSeconds} min={0} max={30} unit="sec" onChange={(value) => updateRules({ classic: { incrementSeconds: value } })} />
          </WorkshopGroup>
          <WorkshopGroup title="Mystery Piece" hint="Match length · handoff stays private" presets={[["quick", "Quick round"], ["match", "Best of 5"], ["series", "Best of 9"]]} onPreset={(preset) => applyPreset("mystery", preset)}>
            <NumberSetting label="Rounds to win match" value={rules.mystery.roundsToWin} min={1} max={5} unit="wins" onChange={(value) => updateRules({ mystery: { roundsToWin: value } })} />
            <p className="workshop-note">The secret-piece handoff remains enabled before each player selects.</p>
          </WorkshopGroup>
          <WorkshopGroup title="Dice Gambit" hint="Roll count, distribution, and win condition" presets={[["standard", "Standard"], ["wild", "Wild"], ["tactical", "Tactical"]]} onPreset={(preset) => applyPreset("dice", preset)}>
            <NumberSetting label="Piece rolls per turn" value={rules.dice.rollsPerTurn} min={1} max={5} unit="rolls" onChange={(value) => updateRules({ dice: { rollsPerTurn: value } })} />
            <SelectSetting label="Roll weighting" value={rules.dice.weightProfile} options={[["phase", "Game-phase weighting"], ["balanced", "Even odds"], ["chaos", "High volatility"]]} onChange={(value) => updateRules({ dice: { weightProfile: value as typeof rules.dice.weightProfile } })} />
            <SelectSetting label="Win condition" value={rules.dice.kingCapture} options={[["capture-king", "King capture or checkmate"], ["checkmate", "Checkmate only"]]} onChange={(value) => updateRules({ dice: { kingCapture: value as typeof rules.dice.kingCapture } })} />
          </WorkshopGroup>
          <WorkshopGroup title="Spellbound" hint="Per-player resources and spell timing" presets={[["standard", "Standard"], ["generous", "Generous magic"], ["severe", "Scarce magic"]]} onPreset={(preset) => applyPreset("spell", preset)}>
            <NumberSetting label="Freeze uses" value={rules.spell.freezeUses} min={0} max={10} unit="uses" onChange={(value) => updateRules({ spell: { freezeUses: value } })} />
            <NumberSetting label="Jump uses" value={rules.spell.jumpUses} min={0} max={6} unit="uses" onChange={(value) => updateRules({ spell: { jumpUses: value } })} />
            <NumberSetting label="Freeze cooldown" value={rules.spell.freezeCooldown} min={0} max={8} unit="turns" onChange={(value) => updateRules({ spell: { freezeCooldown: value } })} />
            <NumberSetting label="Jump cooldown" value={rules.spell.jumpCooldown} min={0} max={8} unit="turns" onChange={(value) => updateRules({ spell: { jumpCooldown: value } })} />
            <NumberSetting label="Freeze radius" value={rules.spell.freezeRadius} min={0} max={2} unit="squares" onChange={(value) => updateRules({ spell: { freezeRadius: value } })} />
            <NumberSetting label="Freeze duration" value={rules.spell.freezeDurationTurns} min={1} max={4} unit="turns" onChange={(value) => updateRules({ spell: { freezeDurationTurns: value } })} />
          </WorkshopGroup>
          <WorkshopGroup title="King of the Hill" hint="Center size and victory conditions" presets={[["standard", "Standard hill"], ["wide", "Wide hill"], ["race", "Center race"]]} onPreset={(preset) => applyPreset("hill", preset)}>
            <SelectSetting label="Center objective" value={rules.hill.centerSize} options={[["standard", "Four central squares"], ["wide", "Sixteen central squares"]]} onChange={(value) => updateRules({ hill: { centerSize: value as typeof rules.hill.centerSize } })} />
            <SelectSetting label="Checkmate wins too" value={String(rules.hill.checkmateWins)} options={[["true", "Yes, center or checkmate"], ["false", "No, center only"]]} onChange={(value) => updateRules({ hill: { checkmateWins: value === "true" } })} />
          </WorkshopGroup>
          <WorkshopGroup title="Duck Chess" hint="Duck movement and stalemate outcome" presets={[["standard", "Standard"], ["mobile", "Duck may stay"], ["draw", "Stalemate draw"]]} onPreset={(preset) => applyPreset("duck", preset)}>
            <SelectSetting label="Duck can stay in place" value={String(rules.duck.duckMayStay)} options={[["false", "No, it must move"], ["true", "Yes, it may stay"]]} onChange={(value) => updateRules({ duck: { duckMayStay: value === "true" } })} />
            <SelectSetting label="If opponent has no legal move" value={rules.duck.stalemateRule} options={[["last-move-wins", "Last mover wins"], ["draw", "Draw"]]} onChange={(value) => updateRules({ duck: { stalemateRule: value as typeof rules.duck.stalemateRule } })} />
          </WorkshopGroup>
        </div>
        <p className="workshop-saved"><span /> Rules saved locally · New games use the latest settings</p>
      </section>}

      <footer className="menu-footer"><span><span className="status-dot" /> LOCAL TABLE · 2 PLAYERS</span><span>CHAOS GAMBIT <i>—</i> TAKE YOUR TIME. THEN TAKE THE KING.</span><span className="menu-footer-meta"><a className="chess-profile-link" href="https://www.chess.com/member/mastermind_s7" target="_blank" rel="noopener noreferrer" aria-label="Visit Mastermind_S7's Chess.com profile (opens in a new tab)"><span className="chess-profile-dot" aria-hidden="true" />Mastermind_S7<ExternalLink size={11} aria-hidden="true" /></a><span className="menu-version">v6.7</span></span></footer>

      {guided && chosen && <div className="guide-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuided(null); }}>
        <section ref={guidePanelRef} className="guide-panel" role="dialog" aria-modal="true" aria-labelledby="guide-title" aria-describedby="guide-detail" tabIndex={-1}>
          <div className="guide-top"><span><HelpCircle size={16} /> RULES BRIEFING</span><button ref={guideCloseRef} onClick={() => setGuided(null)} aria-label="Close rules briefing"><X size={18} /></button></div>
          <div className={`guide-symbol tone-${chosen.tone}`}>{chosen.glyph}</div><span className="guide-mode">{chosen.title}</span><h2 id="guide-title">{guideContent[guided].title}</h2><p id="guide-detail" className="guide-detail">{chosen.detail}</p>
          <ol className="guide-steps">{guideContent[guided].steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol>
          <div className="guide-actions"><button className="guide-start" onClick={() => { setGuided(null); onSelect(guided); }}><Play size={16} fill="currentColor" /> Start {chosen.title}</button><div className="guide-switch" role="group" aria-label="Choose a variant briefing">{modes.map((mode) => <button key={mode.id} className={guided === mode.id ? "selected" : ""} onClick={() => setGuided(mode.id)} aria-label={`${mode.title} briefing`} aria-pressed={guided === mode.id} />)}</div></div>
        </section>
      </div>}
    </main>
  );
}

function WorkshopGroup({ title, hint, presets, onPreset, children }: { title: string; hint: string; presets: [string, string][]; onPreset: (id: string) => void; children: ReactNode }) {
  return <section className="workshop-group"><div className="workshop-group-head"><div><h3>{title}</h3><p>{hint}</p></div><div className="preset-row">{presets.map(([id, label]) => <button key={id} onClick={() => onPreset(id)}>{label}</button>)}</div></div><div className="workshop-controls">{children}</div></section>;
}
function NumberSetting({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (value: number) => void }) {
  return <label className="number-setting"><span>{label}</span><span className="number-control"><input type="number" min={min} max={max} value={value} aria-label={label} onChange={(event) => { const next = Number(event.target.value); if (event.target.value !== "" && Number.isFinite(next)) onChange(Math.min(max, Math.max(min, next))); }} onBlur={(event) => { if (event.target.value === "") onChange(min); }} /><small>{unit}</small></span></label>;
}
function SelectSetting({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return <label className="select-setting"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select></label>;
}

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { settings, updateSettings } = useSettings();
  const handleThemeChange = (theme: keyof typeof THEME_COLORS) => updateSettings({ theme });
  return <main className="settings-screen">
    <header className="settings-header"><button onClick={onBack} className="settings-back"><ArrowLeft size={17} /> Back</button><span>DISPLAY PREFERENCES</span></header>
    <div className="settings-title"><p className="eyebrow">MAKE THE BOARD YOURS</p><h1>Settings</h1><p>Visual preferences are saved on this device.</p></div>
    <div className="settings-grid">
      <section className="settings-group"><h2>Board palette</h2><p>Choose the light and dark square colors.</p><div className="theme-options">{Object.entries(THEME_COLORS).map(([key, colors]) => <button key={key} aria-label={`${key} board theme`} aria-pressed={settings.theme === key} onClick={() => handleThemeChange(key as keyof typeof THEME_COLORS)} className={settings.theme === key ? "selected" : ""}><span style={{ background: `linear-gradient(90deg, ${colors.light} 50%, ${colors.dark} 50%)` }} /><b>{key}</b></button>)}</div></section>
      <section className="settings-group"><h2>Language / اللغة</h2><p>Choose the interface language.</p><div className="speed-options"><button aria-pressed={settings.locale === "en"} className={settings.locale === "en" ? "selected" : ""} onClick={() => updateSettings({ locale: "en" })}>English</button><button aria-pressed={settings.locale === "ar"} className={settings.locale === "ar" ? "selected" : ""} onClick={() => updateSettings({ locale: "ar" })}>العربية</button></div></section>
      <section className="settings-group"><h2>Piece finish</h2><p>Pick a style that reads clearly on your board.</p><div className="piece-options">{(["solid", "flat"] as const).map((style) => <button key={style} aria-pressed={settings.pieceStyle === style} onClick={() => updateSettings({ pieceStyle: style })} className={settings.pieceStyle === style ? "selected" : ""}><span className="flex h-7 w-7 items-center justify-center"><ChessPieceSVG type="n" color="w" fillStyle={style} className="!h-full !w-full" /></span>{style}</button>)}</div></section>
      <section className="settings-group settings-toggles"><h2>Board details</h2><p>Clarity and feedback in play.</p><Toggle label="Show coordinates" checked={settings.showCoords} onChange={(showCoords) => updateSettings({ showCoords })} /><Toggle label="Highlight legal moves" checked={settings.highlightLegal} onChange={(highlightLegal) => updateSettings({ highlightLegal })} /><Toggle label="Enable sounds" checked={settings.soundEnabled} onChange={(soundEnabled) => updateSettings({ soundEnabled })} /><Toggle label="Confirm moves" checked={settings.confirmMove} onChange={(confirmMove) => updateSettings({ confirmMove })} /></section>
      <section className="settings-group"><h2>Motion pace</h2><p>Choose the board animation speed.</p><div className="speed-options">{(["slow", "normal", "fast"] as const).map((speed) => <button key={speed} onClick={() => updateSettings({ animSpeed: speed })} aria-pressed={settings.animSpeed === speed} className={settings.animSpeed === speed ? "selected" : ""}>{speed}</button>)}</div></section>
    </div>
  </main>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="settings-toggle"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i aria-hidden="true" /></label>;
}
