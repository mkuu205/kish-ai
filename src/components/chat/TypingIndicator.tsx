"use client";

import { motion } from "framer-motion";

export function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-semibold"
        style={{ borderColor: `${color}55`, background: `${color}22`, color }}
      >
        K
      </div>
      <div className="flex items-center gap-3 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: color }}
              animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
        <div className="font-mono text-[11px] text-slate-500">Thinking...</div>
      </div>
    </div>
  );
}
