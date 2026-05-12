"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { getUserResource } from "@/services/userService";
import { usePaymentLauncher } from "@/hooks/usePaymentLauncher";
import { Button } from "@/components/ui/Button";

export function BillingClient() {
  const { token, user } = useAuth();
  const openPay = usePaymentLauncher();
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    void getUserResource(token)
      .then((env) => {
        if (env.user) setNote(null);
        else setNote("Billing details will appear here once your backend includes them on `GET /api/v1/user`.");
      })
      .catch(() => setNote("Unable to load billing envelope from `GET /api/v1/user`."));
  }, [token]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
        <div className="text-sm font-semibold text-slate-100">Account</div>
        <div className="mt-4 space-y-2 font-mono text-xs text-slate-400">
          <div className="flex justify-between gap-4">
            <span>Email</span>
            <span className="truncate text-slate-200">{user?.email}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Plan</span>
            <span className="text-slate-200">{user?.plan.toUpperCase()}</span>
          </div>
        </div>
        {note ? <div className="mt-4 text-sm text-slate-500">{note}</div> : null}
      </div>

      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">
        <div className="text-sm font-semibold text-cyan-200">Upgrade</div>
        <p className="mt-3 text-sm text-slate-400">
          Unlock unlimited usage, all modes, uploads, and web search.
        </p>
        <Button variant="primary" className="mt-5 w-full py-3" onClick={openPay}>
          Manage subscription
        </Button>
      </div>
    </div>
  );
}
