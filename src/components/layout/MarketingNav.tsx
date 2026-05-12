"use client";

import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/uiStore";
import { usePaymentLauncher } from "@/hooks/usePaymentLauncher";

export function MarketingNav() {
  const { user, logout } = useAuth();
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const openPay = usePaymentLauncher();

  return (
    <nav className="fixed left-0 right-0 top-0 z-[100] flex h-16 items-center justify-between border-b border-white/10 bg-[#060a12]/85 px-4 backdrop-blur-xl sm:px-8">
      <Link href="/" className="flex cursor-pointer items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-400/30 to-cyan-400/10 font-mono text-sm font-semibold text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
          K
        </div>
        <div className="text-base font-bold tracking-[0.12em] text-slate-100">
          KISH <span className="text-cyan-300">AI</span>
        </div>
      </Link>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {user ? (
          <>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 sm:flex">
              <span className="max-w-[140px] truncate">{user.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-medium tracking-wide ${
                  user.plan === "pro"
                    ? "border border-cyan-400/30 bg-cyan-400/15 text-cyan-300"
                    : "bg-slate-500/20 text-slate-400"
                }`}
              >
                {user.plan.toUpperCase()}
              </span>
            </div>
            {user.plan === "free" ? (
              <Button variant="primary" className="px-3 py-2 text-xs sm:text-sm" onClick={openPay}>
                ⚡ Upgrade
              </Button>
            ) : null}
            <Button variant="ghost" className="px-3 py-2 text-xs sm:text-sm" onClick={() => void logout()}>
              Log Out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="px-3 py-2 text-xs sm:text-sm" onClick={() => setAuthModal(true, "login")}>
              Log In
            </Button>
            <Button variant="primary" className="px-3 py-2 text-xs sm:text-sm" onClick={() => setAuthModal(true, "register")}>
              Get Started Free
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
