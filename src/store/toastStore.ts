"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastState {
  toasts: ToastItem[];
  push: (variant: ToastVariant, message: string) => void;
  dismiss: (id: string) => void;
}

let seq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (variant, message) => {
    const id = `${Date.now()}-${seq++}`;
    set((s) => ({ toasts: [...s.toasts, { id, variant, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function toast(variant: ToastVariant, message: string) {
  useToastStore.getState().push(variant, message);
}
