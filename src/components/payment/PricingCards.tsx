"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/uiStore";
import { useAuth } from "@/context/AuthContext";
import { usePaymentLauncher } from "@/hooks/usePaymentLauncher";

export function PricingCards() {
  const { user } = useAuth();
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const openPay = usePaymentLauncher();

  return (
    <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-9">
        <div className="font-mono text-[13px] tracking-wide text-slate-400">FREE PLAN</div>
        <div className="mt-3 text-5xl font-bold leading-none">
          $0<span className="text-lg font-normal text-slate-400">/mo</span>
        </div>
        <div className="mt-2 text-sm text-slate-400">No credit card needed</div>
        <ul className="mt-8 space-y-2 text-sm text-slate-400">
          <li className="text-slate-100">✓ 10 messages per day</li>
          <li className="text-slate-100">✓ General AI mode</li>
          <li className="text-slate-100">✓ Full conversation memory</li>
          <li className="text-slate-100">✓ Email OTP security</li>
          <li>✗ Web search</li>
          <li>✗ Image analysis</li>
          <li>✗ All 5 AI modes</li>
        </ul>
        {user ? (
          <Link
            href="/chat"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-3.5 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            Open Chat
          </Link>
        ) : (
          <Button
            variant="ghost"
            className="mt-8 w-full border border-white/10 py-3.5"
            onClick={() => setAuthModal(true, "register")}
          >
            Get Started Free
          </Button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/35 bg-cyan-400/5 p-9">
        <div className="absolute right-4 top-4 rounded border border-cyan-400/30 bg-cyan-400/15 px-2 py-1 font-mono text-[9px] tracking-wide text-cyan-300">
          MOST POPULAR
        </div>
        <div className="font-mono text-[13px] tracking-wide text-slate-400">PRO PLAN</div>
        <div className="mt-3 bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-5xl font-bold leading-none text-transparent">
          $12<span className="text-lg font-normal text-slate-400">/mo</span>
        </div>
        <div className="mt-2 text-sm text-slate-400">or KES 1,200/mo · Card or M-Pesa</div>
        <ul className="mt-8 space-y-2 text-sm text-slate-300">
          <li>✓ Unlimited messages</li>
          <li>✓ All 5 AI modes</li>
          <li>✓ Live web search</li>
          <li>✓ Image analysis</li>
          <li>✓ Document reading</li>
          <li>✓ Custom AI persona</li>
          <li>✓ Longer AI responses</li>
        </ul>
        <Button variant="primary" className="mt-8 w-full py-3.5" onClick={openPay}>
          Upgrade to Pro
        </Button>
        <div className="mt-3 text-center font-mono text-[11px] text-slate-600">
          💳 Card (Stripe) · 📱 M-Pesa (PayHero)
        </div>
      </div>
    </div>
  );
}
