"use client";

import { AnimatePresence, motion } from "framer-motion";

import { useToastStore } from "@/store/toastStore";
import { cn } from "@/utils/cn";

const icons: Record<string, string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
};

export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[999] flex max-w-sm flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-lg border border-white/10 bg-[#0d1421] px-4 py-3 text-sm text-slate-100 shadow-lg",
              t.variant === "success" && "border-emerald-400/30",
              t.variant === "error" && "border-red-400/30",
              t.variant === "info" && "border-cyan-400/25",
            )}
          >
            <span>{icons[t.variant]}</span>
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-200"
              onClick={() => dismiss(t.id)}
            >
              Close
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
