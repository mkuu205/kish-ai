import Link from "next/link";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { PricingCards } from "@/components/payment/PricingCards";
import { BillingClient } from "./BillingClient";

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#060a12] text-slate-100">
        <MarketingNav />
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-cyan-300">BILLING</div>
              <h1 className="text-3xl font-semibold">Plans & payments</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Upgrade, manage subscription intent, and review payment status. Card checkout uses Stripe; M-Pesa uses
                PayHero via the unified `/api/v1/payment` contract.
              </p>
            </div>
            <Link
              href="/chat"
              className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              Back to chat
            </Link>
          </div>

          <div className="mt-10">
            <BillingClient />
          </div>

          <div className="mt-14" id="pricing">
            <div className="font-mono text-xs text-cyan-300">PRICING</div>
            <h2 className="mt-2 text-2xl font-semibold">Choose your plan</h2>
            <PricingCards />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
