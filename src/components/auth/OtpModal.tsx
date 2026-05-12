"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { resendOtpRequest } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUiStore } from "@/store/uiStore";
import { toast } from "@/store/toastStore";

export function OtpModal() {
  const router = useRouter();
  const { verifyOtp, user } = useAuth();
  const open = useUiStore((s) => s.otpModalOpen);
  const email = useUiStore((s) => s.otpEmail);
  const setOtpModal = useUiStore((s) => s.setOtpModal);
  const setAuthModal = useUiStore((s) => s.setAuthModal);

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(600);
  const [resendDisabled, setResendDisabled] = useState(true);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const pendingRedirect = useRef(false);

  // Wait for user state to be populated before navigating to /chat
  useEffect(() => {
    if (pendingRedirect.current && user) {
      pendingRedirect.current = false;
      router.push("/chat");
    }
  }, [user, router]);

  useEffect(() => {
    if (!open) return;
    setDigits(["", "", "", "", "", ""]);
    setErr(null);
    setSeconds(600);
    setResendDisabled(true);

    const started = Date.now();
    const t = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const remain = Math.max(0, 600 - elapsed);
      setSeconds(remain);
      if (remain <= 0) setResendDisabled(false);
    }, 1000);

    const focusT = window.setTimeout(() => inputsRef.current[0]?.focus(), 80);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(focusT);
    };
  }, [open, email]);

  const countdown = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }, [seconds]);

  const code = digits.join("");

  const closeToLogin = () => {
    setOtpModal(false);
    setAuthModal(true, "login");
  };

  const onVerify = async (override?: string) => {
    if (busy) return;
    const final = override ?? digits.join("");
    if (final.length !== 6) {
      setErr("Enter all 6 digits.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await verifyOtp(email, final);
      toast("success", "Email verified — welcome to Kish AI");
      setOtpModal(false);
      pendingRedirect.current = true;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed");
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const onResend = async () => {
    setResendDisabled(true);
    try {
      await resendOtpRequest(email);
      toast("success", "New code sent to your email");
      setDigits(["", "", "", "", "", ""]);
      setSeconds(600);
      inputsRef.current[0]?.focus();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Resend failed");
      setResendDisabled(false);
    }
  };

  const setDigit = (idx: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputsRef.current[idx + 1]?.focus();
    const joined = next.join("");
    if (joined.length === 6) window.setTimeout(() => void onVerify(joined), 0);
  };

  const onKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const onPaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    e.preventDefault();
    const next = [...digits];
    pasted.split("").forEach((ch, j) => {
      if (idx + j < 6) next[idx + j] = ch;
    });
    setDigits(next);
    const last = Math.min(idx + pasted.length - 1, 5);
    inputsRef.current[Math.max(0, last)]?.focus();
    const joined = next.join("");
    if (joined.length === 6) window.setTimeout(() => void onVerify(joined), 0);
  };

  return (
    <Modal open={open} onClose={closeToLogin} title="Verify Your Email">
      <div className="text-center text-4xl">📬</div>
      <div className="mt-3 text-center">
        <div className="text-base font-semibold text-slate-50">Check Your Inbox</div>
        <div className="mt-2 text-sm text-slate-400">
          We sent a 6-digit code to <span className="text-cyan-300">{email}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={d}
            inputMode="numeric"
            maxLength={1}
            className={`h-14 w-11 rounded-lg border-2 bg-white/5 text-center font-mono text-xl font-bold text-slate-50 outline-none ${
              d ? "border-cyan-400/50" : "border-white/10"
            }`}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => onPaste(i, e)}
          />
        ))}
      </div>

      <div className="mt-4 text-center font-mono text-xs text-slate-400">
        Code expires in <span className="text-cyan-300">{seconds <= 0 ? "Expired" : countdown}</span>
      </div>

      {err ? <div className="mt-3 text-center font-mono text-xs text-red-400">{err}</div> : null}

      <Button variant="primary" className="mt-5 w-full py-3" disabled={busy} onClick={() => void onVerify()}>
        {busy ? <Spinner className="border-white/30 border-t-white" /> : "Verify Code"}
      </Button>

      <div className="mt-4 text-center text-xs text-slate-400">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          className="font-mono text-cyan-300 underline disabled:cursor-not-allowed disabled:text-slate-600 disabled:no-underline"
          disabled={resendDisabled}
          onClick={() => void onResend()}
        >
          Resend Code
        </button>
      </div>

      <div className="mt-3 text-center">
        <button type="button" className="text-xs text-slate-400 hover:text-slate-200" onClick={closeToLogin}>
          ← Back to Login
        </button>
      </div>
    </Modal>
  );
}
