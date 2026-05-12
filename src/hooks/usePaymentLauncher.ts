"use client";

import { useAuth } from "@/context/AuthContext";
import { useUiStore } from "@/store/uiStore";
import { toast } from "@/store/toastStore";

export function usePaymentLauncher() {
  const setPaymentModalOpen = useUiStore((s) => s.setPaymentModalOpen);
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const { user } = useAuth();

  return () => {
    if (!user) {
      setAuthModal(true, "register");
      return;
    }
    if (user.plan === "pro") {
      toast("info", "You're already on Pro!");
      return;
    }
    setPaymentModalOpen(true);
  };
}
