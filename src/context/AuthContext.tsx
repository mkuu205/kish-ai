"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { meRequest, loginRequest, registerRequest, verifyOtpRequest } from "@/services/authService";
import {
  REFRESH_TOKEN_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  apiClient,
} from "@/lib/api/client";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ pendingVerification?: boolean; email?: string }>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setSession: (token: string, refreshToken: string | null, user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function readStoredRefresh(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((t: string, rt: string | null, u: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, t);
    if (rt) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, rt);
    else localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    setToken(t);
    setRefreshToken(rt);
    setUser(u);
    apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    delete apiClient.defaults.headers.common.Authorization;
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = readStoredToken();
    if (!t) {
      clearSession();
      return;
    }
    apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
    const u = await meRequest(t);
    setToken(t);
    setRefreshToken(readStoredRefresh());
    setUser(u);
  }, [clearSession]);

  useEffect(() => {
    const t = readStoredToken();
    if (!t) {
      setIsLoading(false);
      return;
    }
    setToken(t);
    setRefreshToken(readStoredRefresh());
    apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
    void meRequest(t)
      .then((u) => setUser(u))
      .catch(() => clearSession())
      .finally(() => setIsLoading(false));
  }, [clearSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const d = await loginRequest(email, password);
      if (d.pendingVerification) {
        return { pendingVerification: true, email: d.email ?? email };
      }
      persistSession(d.accessToken, d.refreshToken ?? null, d.user);
      return {};
    },
    [persistSession],
  );

  const register = useCallback(async (name: string, email: string, password: string) => {
    await registerRequest(name, email, password);
  }, []);

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      const d = await verifyOtpRequest(email, otp);
      persistSession(d.accessToken, d.refreshToken ?? null, d.user);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const setSession = useCallback(
    (t: string, rt: string | null, u: AuthUser) => {
      persistSession(t, rt, u);
    },
    [persistSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      refreshToken,
      isLoading,
      login,
      register,
      verifyOtp,
      logout,
      refreshUser,
      setSession,
    }),
    [user, token, refreshToken, isLoading, login, register, verifyOtp, logout, refreshUser, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
