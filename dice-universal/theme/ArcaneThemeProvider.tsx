// dice-universal/theme/ArcaneThemeProvider.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getMeta, setMeta } from "../data/db/database";
import { useDb } from "../data/db/DbProvider";
import {
  applyArcaneTheme,
  ARCANE_THEMES,
  createArcaneTheme,
  DEFAULT_ARCANE_THEME_KEY,
  isArcaneThemeKey,
  type ArcaneTheme,
  type ArcaneThemeKey,
} from "./arcaneTheme";
import { createArcaneStyles } from "./arcaneStyles";

const THEME_META_KEY = "ui.theme";

type ArcaneThemeContextValue = {
  themeKey: ArcaneThemeKey;
  theme: ArcaneTheme;
  styles: ReturnType<typeof createArcaneStyles>;
  availableThemes: typeof ARCANE_THEMES;
  setThemeKey: (themeKey: ArcaneThemeKey) => Promise<void>;
};

const ArcaneThemeContext = createContext<ArcaneThemeContextValue | null>(null);

export function ArcaneThemeProvider({ children }: { children: ReactNode }) {
  const db = useDb();

  const [themeKey, setThemeKeyState] = useState<ArcaneThemeKey>(
    DEFAULT_ARCANE_THEME_KEY,
  );

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        const savedTheme = await getMeta(db, THEME_META_KEY);
        const nextThemeKey =
          savedTheme && isArcaneThemeKey(savedTheme)
            ? savedTheme
            : DEFAULT_ARCANE_THEME_KEY;

        applyArcaneTheme(nextThemeKey);

        if (mounted) {
          setThemeKeyState(nextThemeKey);
        }
      } catch {
        applyArcaneTheme(DEFAULT_ARCANE_THEME_KEY);

        if (mounted) {
          setThemeKeyState(DEFAULT_ARCANE_THEME_KEY);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [db]);

  const theme = useMemo(() => createArcaneTheme(themeKey), [themeKey]);
  const styles = useMemo(() => createArcaneStyles(theme), [theme]);

  const setThemeKey = useCallback(
    async (nextThemeKey: ArcaneThemeKey) => {
      applyArcaneTheme(nextThemeKey);
      setThemeKeyState(nextThemeKey);
      await setMeta(db, THEME_META_KEY, nextThemeKey);
    },
    [db],
  );

  const value = useMemo(
    () => ({
      themeKey,
      theme,
      styles,
      availableThemes: ARCANE_THEMES,
      setThemeKey,
    }),
    [themeKey, theme, styles, setThemeKey],
  );

  return (
    <ArcaneThemeContext.Provider value={value}>
      {children}
    </ArcaneThemeContext.Provider>
  );
}

export function useArcaneTheme() {
  const context = useContext(ArcaneThemeContext);

  if (!context) {
    throw new Error("useArcaneTheme must be used inside ArcaneThemeProvider");
  }

  return context;
}
