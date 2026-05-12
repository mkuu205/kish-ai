"use client";

import { create } from "zustand";

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "kish_theme_mode";

function readInitial(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" ? "light" : "dark";
}

interface ThemeState {
  theme: ThemeMode;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "dark",
  hydrated: false,
  setTheme: (theme) => {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, next);
    set({ theme: next });
  },
}));

export function hydrateThemeFromStorage() {
  const theme = readInitial();
  useThemeStore.setState({ theme, hydrated: true });
}
