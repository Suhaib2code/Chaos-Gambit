import { useState } from "react";
import { Cover, ModeSelect, SettingsScreen } from "./components/Screens";
import { ClassicMode } from "./modes/ClassicMode";
import { MysteryMode } from "./modes/MysteryMode";
import { DiceMode } from "./modes/DiceMode";
import { SpellMode } from "./modes/SpellMode";
import { SettingsProvider, useSettings } from "./context";
import { AnimatePresence, motion } from "motion/react";

function AppContent() {
  type ScreenName = "cover" | "settings" | "mode_select" | "classic" | "mystery" | "dice" | "spell";
  const [screen, setScreen] = useState<ScreenName>("cover");
  const [prevScreen, setPrevScreen] = useState<ScreenName>("cover");

  const navigate = (to: ScreenName) => {
    if (to === "settings" && screen !== "settings") {
      setPrevScreen(screen);
    }
    setScreen(to);
  };

  return (
    <div className="w-full min-h-screen bg-[#0C0C0E] text-[#E2E8F0] selection:bg-purple-500/30 font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -10 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="w-full h-screen absolute inset-0 overflow-y-auto"
        >
          {screen === "cover" && (
            <Cover onPlay={() => navigate("mode_select")} onSettings={() => navigate("settings")} />
          )}
          {screen === "settings" && <SettingsScreen onBack={() => navigate(prevScreen)} />}
          {screen === "mode_select" && <ModeSelect onSelect={(m: any) => navigate(m)} onBack={() => navigate("cover")} onSettings={() => navigate("settings")} />}
          {screen === "classic" && <ClassicMode onBack={() => navigate("mode_select")} />}
          {screen === "mystery" && <MysteryMode onBack={() => navigate("mode_select")} />}
          {screen === "dice" && <DiceMode onBack={() => navigate("mode_select")} />}
          {screen === "spell" && <SpellMode onBack={() => navigate("mode_select")} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
