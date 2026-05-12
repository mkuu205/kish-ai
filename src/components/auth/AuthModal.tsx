"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUiStore } from "@/store/uiStore";
import { toast } from "@/store/toastStore";
import { isPendingVerification } from "@/utils/errors";

export function AuthModal() {
  const router = useRouter();
  const { login, register, user } = useAuth();
  const open = useUiStore((s) => s.authModalOpen);
  const tab = useUiStore((s) => s.authModalTab);
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const setOtpModal = useUiStore((s) => s.setOtpModal);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [regErr, setRegErr] = useState<string | null>(null);
  // Track whether we should redirect to /chat once user state is populated
  const pendingRedirect = useRef(false);

  const title = useMemo(() => (tab === "login" ? "Welcome Back" : "Create Account"), [tab]);

  // Wait for the user state to be set before navigating, so ProtectedRoute
  // doesn't see a null user and bounce us back to the login page.
  useEffect(() => {
    if (pendingRedirect.current && user) {
      pendingRedirect.current = false;
      router.push("/chat");
    }
  }, [user, router]);

  const close = () => {
    setAuthModal(false);
    setLoginErr(null);
    setRegErr(null);
  };

  const onLogin = async () => {
    setBusy(true);
    setLoginErr(null);
    try {
      const result = await login(loginEmail.trim(), loginPass);
      if (result.pendingVerification) {
        close();
        setOtpModal(true, result.email ?? loginEmail.trim());
        return;
      }
      toast("success", `Welcome back!`);
      close();
      // Set the flag — the useEffect above will push to /chat once user is set
      pendingRedirect.current = true;
    } catch (e) {
      if (isPendingVerification(e)) {
        close();
        setOtpModal(true, loginEmail.trim());
        return;
      }
      setLoginErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const onRegister = async () => {
    setBusy(true);
    setRegErr(null);
    try {
      await register(regName.trim(), regEmail.trim(), regPass);
      close();
      setOtpModal(true, regEmail.trim());
    } catch (e) {
      setRegErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={title}>
      <div className="flex rounded-lg bg-white/5 p-1">
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            tab === "login" ? "bg-cyan-400/15 text-cyan-300" : "text-slate-400"
          }`}
          onClick={() => setAuthModal(true, "login")}
        >
          Log In
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            tab === "register" ? "bg-cyan-400/15 text-cyan-300" : "text-slate-400"
          }`}
          onClick={() => setAuthModal(true, "register")}
        >
          Register
        </button>
      </div>

      {tab === "login" ? (
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs text-slate-400">Email</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs text-slate-400">Password</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="Your password"
              type="password"
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && void onLogin()}
            />
          </div>
          {loginErr ? <div className="font-mono text-xs text-red-400">{loginErr}</div> : null}
          <Button variant="primary" className="w-full py-3" disabled={busy} onClick={() => void onLogin()}>
            {busy ? <Spinner className="border-white/30 border-t-white" /> : "Log In"}
          </Button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs text-slate-400">Full Name</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs text-slate-400">Email</label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs text-slate-400">
              Password (8+ characters)
            </label>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/50"
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              placeholder="Create a strong password"
              type="password"
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && void onRegister()}
            />
          </div>
          {regErr ? <div className="font-mono text-xs text-red-400">{regErr}</div> : null}
          <Button
            variant="primary"
            className="w-full py-3"
            disabled={busy}
            onClick={() => void onRegister()}
          >
            {busy ? <Spinner className="border-white/30 border-t-white" /> : "Create Free Account"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
