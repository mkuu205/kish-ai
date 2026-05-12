export type ChatModeId = "general" | "research" | "creative" | "coder" | "vision";

export interface ChatMode {
  id: ChatModeId;
  label: string;
  icon: string;
  color: string;
  desc: string;
  system: string;
}

export const CHAT_MODES: ChatMode[] = [
  {
    id: "general",
    label: "General",
    icon: "◈",
    color: "#00e5ff",
    desc: "All-purpose",
    system:
      "You are Kish, a powerful AI assistant. Be helpful, accurate, and insightful.",
  },
  {
    id: "research",
    label: "Research",
    icon: "◎",
    color: "#a78bfa",
    desc: "Research & data",
    system:
      "You are Kish in Research mode. Specialize in research and analysis. Always use web search for latest information.",
  },
  {
    id: "creative",
    label: "Creative",
    icon: "✦",
    color: "#fb923c",
    desc: "Writing & art",
    system:
      "You are Kish in Creative mode. Excel at storytelling, poetry, and creative writing. Be vivid and expressive.",
  },
  {
    id: "coder",
    label: "Coder",
    icon: "</>",
    color: "#4ade80",
    desc: "Code & tech",
    system:
      "You are Kish in Coder mode. Expert in all programming languages. Write clean, documented code.",
  },
  {
    id: "vision",
    label: "Vision",
    icon: "◉",
    color: "#f472b6",
    desc: "Image & docs",
    system:
      "You are Kish in Vision mode. Analyze images and documents with exceptional detail.",
  },
];

export function getModeById(id: ChatModeId): ChatMode {
  return CHAT_MODES.find((m) => m.id === id) ?? CHAT_MODES[0];
}
