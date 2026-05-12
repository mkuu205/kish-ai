"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";

import { useAuth } from "@/context/AuthContext";
import { API_URL, SOCKET_PATH } from "@/lib/env";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "reconnecting";

interface SocketContextValue {
  socket: Socket | null;
  status: ConnectionStatus;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    if (!token || !user || !API_URL || API_URL.length < 4) {
      socket?.disconnect();
      setSocket(null);
      setStatus("disconnected");
      return;
    }

    setStatus("connecting");
    const s = io(API_URL, {
      path: SOCKET_PATH,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 50,
      reconnectionDelay: 800,
      auth: { token },
    });

    s.on("connect", () => setStatus("connected"));
    s.on("disconnect", () => setStatus("disconnected"));
    s.io.on("reconnect_attempt", () => setStatus("reconnecting"));
    s.io.on("reconnect", () => setStatus("connected"));

    setSocket(s);
    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [token, user]);

  const value = useMemo(() => ({ socket, status }), [socket, status]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
