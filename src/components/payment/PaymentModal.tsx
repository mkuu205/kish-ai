"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { mpesaInitiate, mpesaStatus, stripeCheckout } from "@/services/paymentService";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUiStore } from "@/store/uiStore";
import { toast } from "@/store/toastStore";

type PayTab = "card" | "mpesa";

export function PaymentModal() {
  const { token, user, refreshUser } = useAuth();
  const open = useUiStore((s) => s.paymentModalOpen);
  const setPaymentModalOpen = useUiStore((s) => s.setPaymentModalOpen);
  const setAuthModal = useUiStore((s) => s.setAuthModal);

  const [tab, setTab] = useState<PayTab>("card");
  const [busy, setBusy] = useState(false);
  const [cardErr, setCardErr] = useState<string | null>(null);
  const [mpesaErr, setMpesaErr] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [mpesaPhase, setMpesaPhase] = useState<"form" | "poll">("form");
  const [pollTitle, setPollTitle] = useState("Check Your Phone");
  const [pollSub, setPollSub] = useState("Enter your M-Pesa PIN to complete");
  const [pollIcon, setPollIcon] = useState("📲");

  const ref = useRef<string | null>(null);
  const pollTimer = useRef<number | null>(null);

  const close = () => {
    stopPoll();
    setPaymentModalOpen(false);
    setMpesaPhase("form");
    setPhone("");
    setCardErr(null);
    setMpesaErr(null);
    ref.current = null;
  };

  const stopPoll = () => {
    if (pollTimer.current) window.clearInterval(pollTimer.current);
    pollTimer.current = null;
  };

  useEffect(() => {
    if (!open) stopPoll();
  }, [open]);

  const canPay = useMemo(() => Boolean(token && user), [token, user]);

  const onStripe = async () => {
    if (!token) return;
    setBusy(true);
    setCardErr(null);
    try {
      const d = await stripeCheckout(token);
      window.location.href = d.url;
    } catch (e) {
      setCardErr(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const onMpesa = async () => {
    if (!token) return;
    const trimmed = phone.trim();
    if (trimmed.length < 9) {
      setMpesaErr("Enter a valid 9-digit number e.g. 712345678");
      return;
    }
    setBusy(true);
    setMpesaErr(null);
    try {
      const d = await mpesaInitiate(token, `0${trimmed.replace(/\D/g, "")}`);
      ref.current = d.reference;
      setMpesaPhase("poll");
      setPollIcon("📲");
      setPollTitle("Check Your Phone");
      setPollSub("Enter your M-Pesa PIN to complete\nWaiting for confirmation...");
      setBusy(false);
      startPoll();
    } catch (e) {
      setMpesaErr(e instanceof Error ? e.message : "M-Pesa initiate failed");
      setBusy(false);
    }
  };

  const startPoll = () => {
    stopPoll();
    let n = 0;
    pollTimer.current = window.setInterval(async () => {
      if (!token || !ref.current) return;
      n += 1;
      if (n > 24) {
        stopPoll();
        setPollIcon("❌");
        setPollTitle("Timeout");
        setPollSub("No payment received. Try again.");
        return;
      }
      try {
        const d = await mpesaStatus(token, ref.current);
        if (d.status === "completed") {
          stopPoll();
          setPollIcon("✅");
          setPollTitle("Payment Successful!");
          setPollSub(`KES ${d.amount ?? ""} received. Upgrading...`);
          window.setTimeout(async () => {
            await refreshUser();
            close();
            toast("success", "You're now on Pro! All features unlocked.");
          }, 1200);
        } else if (d.status === "failed") {
          stopPoll();
          setPollIcon("❌");
          setPollTitle("Payment Failed");
          setPollSub("Not completed. Please try again.");
        }
      } catch {
        // keep polling
      }
    }, 5000);
  };

  const resetMpesa = () => {
    stopPoll();
    setMpesaPhase("form");
    setPhone("");
    ref.current = null;
  };

  return (
    <Modal open={open} onClose={close} title="Upgrade to Pro">
      {!canPay ? (
        <div className="text-sm text-slate-300">
          Sign in to upgrade.{" "}
          <button
            type="button"
            className="text-cyan-300 underline"
            onClick={() => {
              close();
              setAuthModal(true, "register");
            }}
          >
            Create account
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-bold text-cyan-300">Pro Plan</div>
                <div className="mt-1 font-mono text-[11px] text-slate-400">
                  Unlimited messages · All features
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-cyan-300">$12/mo</div>
                <div className="font-mono text-[11px] text-slate-400">KES 1,200/mo</div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex rounded-lg bg-white/5 p-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                tab === "card" ? "bg-cyan-400/15 text-cyan-300" : "text-slate-400"
              }`}
              onClick={() => setTab("card")}
            >
              💳 Card
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
                tab === "mpesa" ? "bg-cyan-400/15 text-cyan-300" : "text-slate-400"
              }`}
              onClick={() => setTab("mpesa")}
            >
              📱 M-Pesa
            </button>
          </div>

          {tab === "card" ? (
            <div className="mt-5">
              <p className="text-sm leading-relaxed text-slate-400">
                Secure card payment via Stripe. Visa, Mastercard, Amex accepted. Cancel anytime.
              </p>
              {cardErr ? <div className="mt-3 font-mono text-xs text-red-400">{cardErr}</div> : null}
              <Button variant="primary" className="mt-5 w-full py-3" disabled={busy} onClick={() => void onStripe()}>
                {busy ? <Spinner className="border-white/30 border-t-white" /> : "Pay with Card →"}
              </Button>
              <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
                🔒 Powered by Stripe · PCI Compliant
              </p>
            </div>
          ) : mpesaPhase === "form" ? (
            <div className="mt-5">
              <p className="text-sm text-slate-400">
                Enter your Safaricom number to receive an STK push prompt.
              </p>
              <div className="mt-4">
                <label className="mb-2 block font-mono text-xs text-slate-400">M-Pesa Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center rounded-lg border border-white/10 bg-white/5 px-3 font-mono text-sm text-slate-400">
                    🇰🇪 +254
                  </div>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
                    placeholder="712 345 678"
                    maxLength={9}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
              </div>
              <ol className="mt-4 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-slate-400">
                <li>Enter your number above and tap &quot;Send STK Push&quot;</li>
                <li>An M-Pesa prompt appears on your phone</li>
                <li>Enter your M-Pesa PIN to confirm KES 1,200</li>
                <li>Your account upgrades automatically ✓</li>
              </ol>
              {mpesaErr ? <div className="mt-3 font-mono text-xs text-red-400">{mpesaErr}</div> : null}
              <Button variant="primary" className="mt-5 w-full py-3" disabled={busy} onClick={() => void onMpesa()}>
                {busy ? <Spinner className="border-white/30 border-t-white" /> : "📲 Send STK Push"}
              </Button>
              <p className="mt-3 text-center font-mono text-[11px] text-slate-500">
                Powered by PayHero · Safaricom M-Pesa
              </p>
            </div>
          ) : (
            <div className="mt-6 text-center">
              <div className="text-5xl">{pollIcon}</div>
              <div className="mt-3 text-base font-semibold text-slate-50">{pollTitle}</div>
              <div className="mt-2 whitespace-pre-line font-mono text-xs text-slate-400">{pollSub}</div>
              <Button variant="ghost" className="mt-5" onClick={resetMpesa}>
                ← Try Again
              </Button>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
