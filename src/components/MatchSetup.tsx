import type { ReactNode } from "react";
import { ArrowLeft, Clock3, Crown, Play, Sparkles, UserRound, UsersRound } from "lucide-react";

export type TimeOption = { label: string; value: number };

export function MatchSetup({
  title,
  subtitle,
  eyebrow,
  variant,
  timeControl,
  timeOptions,
  onTimeControlChange,
  bonusTime,
  bonusOptions,
  onBonusTimeChange,
  opponent,
  onOpponentChange,
  opponentDetails,
  onStart,
  onBack,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  variant: "classic" | "hill" | "duck";
  timeControl: number | null;
  timeOptions: TimeOption[];
  onTimeControlChange: (value: number) => void;
  bonusTime: number;
  bonusOptions: number[];
  onBonusTimeChange: (seconds: number) => void;
  opponent?: "local" | "ai";
  onOpponentChange?: (opponent: "local" | "ai") => void;
  opponentDetails?: ReactNode;
  onStart: () => void;
  onBack: () => void;
}) {
  const untimed = timeControl === -1;
  return (
    <main className={`match-setup match-setup-${variant}`}>
      <header className="match-setup-header">
        <button className="match-setup-back" onClick={onBack}><ArrowLeft size={17} /> Back to modes</button>
        <a className="match-setup-brand" href="#home" aria-label="Chaos Gambit"><Crown size={16} /> CHAOS GAMBIT</a>
        <span className="match-setup-badge"><span /> LOCAL MATCH</span>
      </header>

      <div className="match-setup-body">
        <section className="match-setup-hero">
          <div className="match-setup-title">
            <p className="setup-eyebrow"><span /> {eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="setup-board-mark" aria-hidden="true">
            <div className="setup-board-grid">{Array.from({ length: 16 }, (_, i) => <span key={i} className={(Math.floor(i / 4) + i % 4) % 2 ? "dark" : "light"} />)}</div>
            <span className="setup-board-piece">{variant === "duck" ? "♞" : variant === "hill" ? "♔" : "♕"}</span>
            <span className="setup-board-coordinate">d4</span>
          </div>
        </section>

        <section className="setup-opponent setup-panel" aria-labelledby="setup-opponent-title">
          <div className="setup-panel-heading"><span className="setup-step">01</span><div><h2 id="setup-opponent-title">Opponent</h2><p>Choose who will take the other side.</p></div></div>
          {onOpponentChange && opponent ? (
            <>
              <div className="setup-opponent-options" role="group" aria-label="Choose opponent">
                <button type="button" className={opponent === "local" ? "selected" : ""} aria-pressed={opponent === "local"} onClick={() => onOpponentChange("local")}><UsersRound size={18} /><span><strong>Two players</strong><small>Share this board</small></span></button>
                <button type="button" className={opponent === "ai" ? "selected" : ""} aria-pressed={opponent === "ai"} onClick={() => onOpponentChange("ai")}><Sparkles size={18} /><span><strong>Play the computer</strong><small>Choose your side</small></span></button>
              </div>
              {opponent === "ai" && opponentDetails && <div className="setup-opponent-details">{opponentDetails}</div>}
            </>
          ) : <div className="setup-local-only"><UsersRound size={19} /><div><strong>Two players, one board</strong><span>Pass the device after each turn. This variant is local play.</span></div><span className="setup-local-tag"><UserRound size={13} /> 2 PLAYERS</span></div>}
        </section>

        <section className="setup-time setup-panel" aria-labelledby="setup-time-title">
          <div className="setup-panel-heading"><span className="setup-step">02</span><div><h2 id="setup-time-title">Time control</h2><p>Set a clock for each player.</p></div><Clock3 className="setup-heading-icon" size={19} /></div>
          <div className="setup-time-options" role="group" aria-label="Time control">
            {[...timeOptions, { label: "Untimed", value: -1 }].map((option) => <button type="button" key={`${option.value}-${option.label}`} className={timeControl === option.value ? "selected" : ""} aria-pressed={timeControl === option.value} onClick={() => onTimeControlChange(option.value)}>
              {option.value === -1 ? <><strong className="untimed-label">Untimed</strong><small>No clock</small></> : <><strong>{option.label.split(" ")[0]}</strong><small>MIN</small></>}
            </button>)}
          </div>
        </section>

        <section className={`setup-bonus setup-panel ${untimed ? "is-disabled" : ""}`} aria-labelledby="setup-bonus-title" aria-disabled={untimed}>
          <div className="setup-panel-heading"><span className="setup-step">03</span><div><h2 id="setup-bonus-title">Bonus per move</h2><p>Add time after each completed move.</p></div></div>
          <div className="setup-bonus-options" role="group" aria-label="Bonus time per move">{bonusOptions.map((seconds) => <button type="button" key={seconds} disabled={untimed} aria-pressed={bonusTime === seconds} className={bonusTime === seconds ? "selected" : ""} onClick={() => onBonusTimeChange(seconds)}>{seconds === 0 ? "No increment" : `+${seconds}s`}</button>)}</div>
        </section>

        <div className="setup-actions">
          <button type="button" className="setup-start" disabled={timeControl === null} onClick={onStart}><Play size={19} fill="currentColor" /> <span>Start game</span></button>
          <p><span className="setup-ready-dot" /> {untimed ? "A relaxed game with no clock" : `${Math.floor((timeControl ?? 0) / 60000)} minute clock${bonusTime ? ` · +${bonusTime}s per move` : ""}`}</p>
        </div>
      </div>
    </main>
  );
}
