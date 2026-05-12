"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useUiStore } from "@/store/uiStore";
import { toast } from "@/store/toastStore";

export function HomeClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshUser } = useAuth();
  const setAuthModal = useUiStore((s) => s.setAuthModal);

  useEffect(() => {
    const payment = params.get("payment");
    if (payment === "success") {
      void refreshUser().finally(() => {
        toast("success", "🎉 Welcome to Pro! All features unlocked.");
        router.replace("/");
      });
    }
    if (payment === "cancelled") {
      toast("info", "Payment cancelled.");
      router.replace("/");
    }
  }, [params, router, refreshUser]);

  useEffect(() => {
    if (params.get("auth") === "login") {
      setAuthModal(true, "login");
      router.replace("/");
    }
  }, [params, router, setAuthModal]);

  return null;
}
