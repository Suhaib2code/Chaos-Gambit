import { createContext, useContext, useState, ReactNode } from "react";

export interface Settings {
  theme: "classic" | "walnut" | "midnight" | "ice";
  pieceStyle: "solid" | "flat";
  soundEnabled: boolean;
  showCoords: boolean;
  highlightLegal: boolean;
  animSpeed: "slow" | "normal" | "fast";
  confirmMove: boolean;
}

export const defaultSettings: Settings = {
  theme: "midnight",
  pieceStyle: "solid",
  soundEnabled: true,
  showCoords: true,
  highlightLegal: true,
  animSpeed: "normal",
  confirmMove: false,
};

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem("chess_app_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultSettings, ...parsed };
      }
    } catch (e) {
      console.error("Error loading settings from localStorage", e);
    }
    return defaultSettings;
  });

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("chess_app_settings", JSON.stringify(next));
      } catch (e) {
        console.error("Error saving settings to localStorage", e);
      }
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
