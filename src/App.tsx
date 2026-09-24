import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Cover, ModeSelect, SettingsScreen } from "./components/Screens";
import { GameArchive } from "./components/GameArchive";
import { ClassicMode } from "./modes/ClassicMode";
import { MysteryMode } from "./modes/MysteryMode";
import { DiceMode } from "./modes/DiceMode";
import { SpellMode } from "./modes/SpellMode";
import { NewVariantMode } from "./modes/NewVariantMode";
import { SettingsProvider } from "./context";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { VariantRulesProvider, useVariantRules } from "./game/variantRules";
import { LocalizedRoot } from "./i18n";
import { useSettings } from "./context";

function AppContent() {
  type ScreenName = "cover" | "settings" | "mode_select" | "classic" | "mystery" | "dice" | "spell" | "hill" | "duck" | "archive";
  const [screen, setScreen] = useState<ScreenName>("cover");
  const [prevScreen, setPrevScreen] = useState<ScreenName>("cover");
  const { rules } = useVariantRules();
  const { settings } = useSettings();
  const reduceMotion = useReducedMotion();
  const hasNavigated = useRef(false);

  const navigate = (to: ScreenName) => {
    hasNavigated.current = true;
    if (to === "settings" && screen !== "settings") {
      setPrevScreen(screen);
    }
    setScreen(to);
  };

  return (
    <LocalizedRoot><div className="app-root w-full min-h-screen bg-[#0C0C0E] text-[#E2E8F0] selection:bg-purple-500/30 font-sans overflow-hidden" dir={settings.locale === "ar" ? "rtl" : "ltr"}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.02, y: -10 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeInOut" }}
          className="w-full h-screen absolute inset-0 overflow-y-auto"
        >
          <RouteFocus shouldFocus={hasNavigated.current}>
            {screen === "cover" && <Cover onPlay={() => navigate("mode_select")} onSettings={() => navigate("settings")} />}
            {screen === "settings" && <SettingsScreen onBack={() => navigate(prevScreen)} />}
            {screen === "mode_select" && <ModeSelect onSelect={(m: any) => navigate(m)} onBack={() => navigate("cover")} onSettings={() => navigate("settings")} onArchive={() => navigate("archive")} />}
            {screen === "archive" && <GameArchive onClose={() => navigate("mode_select")} />}
            {screen === "classic" && <ClassicMode onBack={() => navigate("mode_select")} classicRules={rules.classic} />}
            {screen === "mystery" && <MysteryMode onBack={() => navigate("mode_select")} />}
            {screen === "dice" && <DiceMode onBack={() => navigate("mode_select")} />}
            {screen === "spell" && <SpellMode onBack={() => navigate("mode_select")} />}
            {(screen === "hill" || screen === "duck") && <NewVariantMode mode={screen} onBack={() => navigate("mode_select")} />}
          </RouteFocus>
        </motion.div>
      </AnimatePresence>
    </div></LocalizedRoot>
  );
}

function RouteFocus({ children, shouldFocus }: { children: ReactNode; shouldFocus: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!shouldFocus) return;
    const frame = window.requestAnimationFrame(() => {
      const main = root.current?.querySelector<HTMLElement>("main");
      if (main) { main.tabIndex = -1; main.focus({ preventScroll: true }); }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [shouldFocus]);
  return <div ref={root}>{children}</div>;
}

export default function App() {
  return (
    <SettingsProvider>
      <VariantRulesProvider><AppContent /></VariantRulesProvider>
    </SettingsProvider>
  );
}
