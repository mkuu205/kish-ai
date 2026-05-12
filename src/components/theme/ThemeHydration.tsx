"use client";

import { useEffect } from "react";

import { hydrateThemeFromStorage, useThemeStore } from "@/store/themeStore";

export function ThemeHydration() {
  const theme = useThemeStore((s) => s.theme);
  const hydrated = useThemeStore((s) => s.hydrated);

  useEffect(() => {
    hydrateThemeFromStorage();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
  }, [theme, hydrated]);

  return null;
}
