"use client";

import { create } from "zustand";

interface UiState {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  desktopSidebarCollapsed: boolean;
  setDesktopSidebarCollapsed: (collapsed: boolean) => void;
  toggleDesktopSidebarCollapsed: () => void;
  authModalOpen: boolean;
  authModalTab: "login" | "register";
  setAuthModal: (open: boolean, tab?: "login" | "register") => void;
  paymentModalOpen: boolean;
  setPaymentModalOpen: (open: boolean) => void;
  otpModalOpen: boolean;
  otpEmail: string;
  setOtpModal: (open: boolean, email?: string) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set({ mobileSidebarOpen: !get().mobileSidebarOpen }),
  desktopSidebarCollapsed: false,
  setDesktopSidebarCollapsed: (collapsed) => set({ desktopSidebarCollapsed: collapsed }),
  toggleDesktopSidebarCollapsed: () =>
    set({ desktopSidebarCollapsed: !get().desktopSidebarCollapsed }),
  authModalOpen: false,
  authModalTab: "login",
  setAuthModal: (open, tab) =>
    set((s) => ({
      authModalOpen: open,
      authModalTab: tab ?? s.authModalTab,
    })),
  paymentModalOpen: false,
  setPaymentModalOpen: (open) => set({ paymentModalOpen: open }),
  otpModalOpen: false,
  otpEmail: "",
  setOtpModal: (open, email) =>
    set((s) => ({
      otpModalOpen: open,
      otpEmail: email ?? s.otpEmail,
    })),
}));
