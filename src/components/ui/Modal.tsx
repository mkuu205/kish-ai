"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/utils/cn";

import { Button } from "./Button";

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-4 backdrop-blur-md sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.22 }}
            className={cn(
              "w-full max-w-md rounded-2xl border border-cyan-400/20 bg-[#0d1421] shadow-2xl sm:rounded-2xl",
              className,
            )}
          >
            <div className="flex items-center justify-between px-7 pt-6">
              <div className="text-lg font-semibold text-slate-50">{title}</div>
              <Button variant="ghost" className="border-transparent px-2 text-2xl" onClick={onClose}>
                ×
              </Button>
            </div>
            <div className="px-7 pb-7 pt-2">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
