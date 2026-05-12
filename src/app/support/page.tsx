import Link from "next/link";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { SupportDashboard } from "@/components/support/SupportDashboard";

export default function SupportPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#060a12] text-slate-100">
        <MarketingNav />
        <div className="pt-16">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-2 pt-8">
            <div>
              <div className="font-mono text-xs text-cyan-300">HELPDESK</div>
              <h1 className="text-2xl font-semibold">Support</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-400">
                Create tickets, reply in-thread, and receive realtime updates when your backend emits Socket.IO events.
              </p>
            </div>
            <Link href="/chat" className="text-sm text-cyan-300 hover:underline">
              ← Back to chat
            </Link>
          </div>
          <SupportDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
}
