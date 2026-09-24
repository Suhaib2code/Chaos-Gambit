import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type VariantId = "classic" | "mystery" | "dice" | "spell" | "hill" | "duck";
export interface VariantRules {
  classic: { timeMinutes: number; incrementSeconds: number };
  mystery: { roundsToWin: number; handoff: "pass-device" };
  dice: { rollsPerTurn: number; weightProfile: "phase" | "balanced" | "chaos"; kingCapture: "capture-king" | "checkmate" };
  spell: { freezeUses: number; jumpUses: number; freezeCooldown: number; jumpCooldown: number; freezeRadius: number; freezeDurationTurns: number };
  hill: { centerSize: "standard" | "wide"; checkmateWins: boolean };
  duck: { duckMayStay: boolean; stalemateRule: "last-move-wins" | "draw" };
}

export const DEFAULT_VARIANT_RULES: VariantRules = {
  classic: { timeMinutes: 10, incrementSeconds: 0 },
  mystery: { roundsToWin: 1, handoff: "pass-device" },
  dice: { rollsPerTurn: 3, weightProfile: "phase", kingCapture: "capture-king" },
  spell: { freezeUses: 5, jumpUses: 2, freezeCooldown: 3, jumpCooldown: 3, freezeRadius: 1, freezeDurationTurns: 1 },
  hill: { centerSize: "standard", checkmateWins: true },
  duck: { duckMayStay: false, stalemateRule: "last-move-wins" },
};

const STORAGE_KEY = "chaos-gambit-variant-rules-v1";
const clampNumber = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

export function readVariantRules(): VariantRules {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VARIANT_RULES;
    const saved = JSON.parse(raw) as Partial<VariantRules>;
    return {
      classic: {
        timeMinutes: clampNumber(saved.classic?.timeMinutes, 10, 1, 180),
        incrementSeconds: clampNumber(saved.classic?.incrementSeconds, 0, 0, 30),
      },
      mystery: {
        roundsToWin: clampNumber(saved.mystery?.roundsToWin, 1, 1, 5),
        handoff: "pass-device",
      },
      dice: {
        rollsPerTurn: clampNumber(saved.dice?.rollsPerTurn, 3, 1, 5),
        weightProfile: ["phase", "balanced", "chaos"].includes(String(saved.dice?.weightProfile)) ? saved.dice!.weightProfile! : "phase",
        kingCapture: ["capture-king", "checkmate"].includes(String(saved.dice?.kingCapture)) ? saved.dice!.kingCapture! : "capture-king",
      },
      spell: {
        freezeUses: clampNumber(saved.spell?.freezeUses, 5, 0, 10),
        jumpUses: clampNumber(saved.spell?.jumpUses, 2, 0, 6),
        freezeCooldown: clampNumber(saved.spell?.freezeCooldown, 3, 0, 8),
        jumpCooldown: clampNumber(saved.spell?.jumpCooldown, 3, 0, 8),
        freezeRadius: clampNumber(saved.spell?.freezeRadius, 1, 0, 2),
        freezeDurationTurns: clampNumber(saved.spell?.freezeDurationTurns, 1, 1, 4),
      },
      hill: {
        centerSize: saved.hill?.centerSize === "wide" ? "wide" : "standard",
        checkmateWins: saved.hill?.checkmateWins !== false,
      },
      duck: {
        duckMayStay: saved.duck?.duckMayStay === true,
        stalemateRule: saved.duck?.stalemateRule === "draw" ? "draw" : "last-move-wins",
      },
    };
  } catch {
    return DEFAULT_VARIANT_RULES;
  }
}

function persistVariantRules(rules: VariantRules) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(rules)); } catch { /* Storage may be disabled; in-memory rules still work. */ }
}

const PRESETS: Record<VariantId, Record<string, Partial<VariantRules[VariantId]>>> = {
  classic: {
    blitz: { timeMinutes: 5, incrementSeconds: 0 },
    rapid: { timeMinutes: 10, incrementSeconds: 5 },
    relaxed: { timeMinutes: 15, incrementSeconds: 10 },
  },
  mystery: {
    quick: { roundsToWin: 1 },
    match: { roundsToWin: 3 },
    series: { roundsToWin: 5 },
  },
  dice: {
    standard: { rollsPerTurn: 3, weightProfile: "phase", kingCapture: "capture-king" },
    wild: { rollsPerTurn: 3, weightProfile: "chaos", kingCapture: "capture-king" },
    tactical: { rollsPerTurn: 2, weightProfile: "balanced", kingCapture: "checkmate" },
  },
  spell: {
    standard: { freezeUses: 5, jumpUses: 2, freezeCooldown: 3, jumpCooldown: 3, freezeRadius: 1, freezeDurationTurns: 1 },
    generous: { freezeUses: 7, jumpUses: 3, freezeCooldown: 2, jumpCooldown: 2, freezeRadius: 1, freezeDurationTurns: 1 },
    severe: { freezeUses: 3, jumpUses: 1, freezeCooldown: 4, jumpCooldown: 4, freezeRadius: 1, freezeDurationTurns: 1 },
  },
  hill: {
    standard: { centerSize: "standard", checkmateWins: true },
    wide: { centerSize: "wide", checkmateWins: true },
    race: { centerSize: "standard", checkmateWins: false },
  },
  duck: {
    standard: { duckMayStay: false, stalemateRule: "last-move-wins" },
    mobile: { duckMayStay: true, stalemateRule: "last-move-wins" },
    draw: { duckMayStay: false, stalemateRule: "draw" },
  },
};

type VariantRulesContextValue = {
  rules: VariantRules;
  updateRules: (updates: { [K in VariantId]?: Partial<VariantRules[K]> }) => void;
  applyPreset: (mode: VariantId, presetId: string) => void;
  resetRules: () => void;
};
const VariantRulesContext = createContext<VariantRulesContextValue | null>(null);

export function VariantRulesProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<VariantRules>(readVariantRules);
  const updateRules: VariantRulesContextValue["updateRules"] = (updates) => {
    setRules((current) => {
      const next = { ...current, ...updates,
        classic: { ...current.classic, ...updates.classic },
        mystery: { ...current.mystery, ...updates.mystery },
        dice: { ...current.dice, ...updates.dice },
        spell: { ...current.spell, ...updates.spell },
        hill: { ...current.hill, ...updates.hill },
        duck: { ...current.duck, ...updates.duck },
      };
      persistVariantRules(next);
      return next;
    });
  };
  const applyPreset = (mode: VariantId, presetId: string) => {
    const preset = PRESETS[mode][presetId] as Partial<VariantRules[typeof mode]> | undefined;
    if (preset) updateRules({ [mode]: preset } as Pick<VariantRules, typeof mode>);
  };
  const resetRules = () => {
    setRules(DEFAULT_VARIANT_RULES);
    persistVariantRules(DEFAULT_VARIANT_RULES);
  };
  const value = useMemo(() => ({ rules, updateRules, applyPreset, resetRules }), [rules]);
  return <VariantRulesContext.Provider value={value}>{children}</VariantRulesContext.Provider>;
}

export function useVariantRules() {
  const context = useContext(VariantRulesContext);
  if (!context) throw new Error("useVariantRules must be used within VariantRulesProvider");
  return context;
}
