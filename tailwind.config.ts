import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-oxanium)", "system-ui", "sans-serif"],
        mono: ["var(--font-fira-code)", "ui-monospace", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#00e5ff",
          muted: "rgba(0, 229, 255, 0.15)",
        },
        surface: "rgba(255, 255, 255, 0.04)",
      },
      backgroundImage: {
        "grid-cyan":
          "linear-gradient(rgba(0, 229, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.025) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 24px rgba(0, 229, 255, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
