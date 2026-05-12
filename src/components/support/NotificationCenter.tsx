"use client";

import { useEffect, useMemo, useState } from "react";

import { useSocket } from "@/context/SocketContext";
import { toast } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

type InboxItem = { id: string; title: string; body: string; ts: number };

function normalizeNotification(payload: unknown): { title: string; body: string } | null {
  if (typeof payload === "string") return { title: "Notification", body: payload };
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const title = typeof p.title === "string" ? p.title : "Notification";
  const body =
    typeof p.body === "string"
      ? p.body
      : typeof p.message === "string"
        ? p.message
        : JSON.stringify(payload);
  return { title, body };
}

export function NotificationCenter() {
  const { socket, status } = useSocket();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[]>([]);

  useEffect(() => {
    if (!socket) return;
    const onAny = (payload: unknown) => {
      const n = normalizeNotification(payload);
      if (!n) return;
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setItems((prev) => [{ id, title: n.title, body: n.body, ts: Date.now() }, ...prev].slice(0, 50));
      toast("info", n.body);
    };

    socket.on("notification", onAny);
    socket.on("support:update", onAny);
    return () => {
      socket.off("notification", onAny);
      socket.off("support:update", onAny);
    };
  }, [socket]);

  const statusLabel = useMemo(() => {
    if (status === "connected") return "Live";
    if (status === "connecting" || status === "reconnecting") return "Connecting";
    return "Offline";
  }, [status]);

  return (
    <div className="relative">
      <Button variant="ghost" className="px-3 py-2 text-xs" onClick={() => setOpen((v) => !v)}>
        🔔
        <span
          className={cn(
            "ml-2 rounded-full px-2 py-0.5 font-mono text-[10px]",
            status === "connected" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-slate-400",
          )}
        >
          {statusLabel}
        </span>
      </Button>

      {open ? (
        <div className="absolute right-0 z-[120] mt-2 w-[min(92vw,360px)] overflow-hidden rounded-xl border border-white/10 bg-[#0d1421] shadow-2xl">
          <div className="border-b border-white/10 px-4 py-3 text-sm font-semibold text-slate-100">
            Notifications
          </div>
          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">No notifications yet.</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className="border-b border-white/5 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-200">{it.title}</div>
                  <div className="mt-1 text-xs leading-relaxed text-slate-400">{it.body}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
