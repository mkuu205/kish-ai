"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { getUserResource, postUserResource } from "@/services/userService";
import type { SupportTicket, SupportTicketDetail } from "@/types/support";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/store/toastStore";
import { cn } from "@/utils/cn";

export function SupportDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selected, setSelected] = useState<SupportTicketDetail | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const env = await getUserResource(token);
      setTickets(env.tickets ?? []);
    } catch (e) {
      // Backend may not embed tickets on GET /api/v1/user yet — fall back to explicit op.
      try {
        const env = await postUserResource(token, { op: "support_list_tickets" });
        setTickets(env.tickets ?? []);
      } catch (err) {
        toast("error", err instanceof Error ? err.message : "Failed to load support tickets");
        setTickets([]);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const openTicket = async (id: string) => {
    if (!token) return;
    setBusy(true);
    try {
      const env = await postUserResource(token, { op: "support_get_ticket", ticketId: id });
      setSelected(env.ticket ?? null);
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to open ticket");
    } finally {
      setBusy(false);
    }
  };

  const createTicket = async () => {
    if (!token) return;
    if (!subject.trim() || !message.trim()) {
      toast("error", "Subject and message are required.");
      return;
    }
    setBusy(true);
    try {
      await postUserResource(token, {
        op: "support_create_ticket",
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubject("");
      setMessage("");
      toast("success", "Ticket created");
      await load();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to create ticket");
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!token || !selected) return;
    if (!reply.trim()) return;
    setBusy(true);
    try {
      await postUserResource(token, {
        op: "support_reply",
        ticketId: selected.id,
        message: reply.trim(),
      });
      setReply("");
      toast("success", "Reply sent");
      await openTicket(selected.id);
      await load();
    } catch (e) {
      toast("error", e instanceof Error ? e.message : "Failed to send reply");
    } finally {
      setBusy(false);
    }
  };

  const selectedTitle = useMemo(() => selected?.subject ?? "Ticket", [selected]);

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-12">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-4">
        <div className="text-sm font-semibold text-slate-100">Create a ticket</div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-2 font-mono text-[11px] text-slate-400">Subject</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
              placeholder="Brief summary"
            />
          </div>
          <div>
            <div className="mb-2 font-mono text-[11px] text-slate-400">Message</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-32 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
              placeholder="Describe the issue…"
            />
          </div>
          <Button variant="primary" className="w-full" disabled={busy} onClick={() => void createTicket()}>
            {busy ? <Spinner className="border-white/30 border-t-white" /> : "Submit ticket"}
          </Button>
        </div>

        <div className="mt-8 text-sm font-semibold text-slate-100">Your tickets</div>
        <div className="mt-3 space-y-2">
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : tickets.length === 0 ? (
            <div className="text-sm text-slate-500">No tickets yet.</div>
          ) : (
            tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => void openTicket(t.id)}
                className={cn(
                  "w-full rounded-xl border border-white/10 bg-black/15 px-3 py-3 text-left transition hover:border-cyan-400/30",
                  selected?.id === t.id && "border-cyan-400/35 bg-cyan-400/10",
                )}
              >
                <div className="truncate text-sm font-medium text-slate-100">{t.subject}</div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{t.status}</span>
                  <span className="font-mono text-[10px] text-slate-600">{t.updatedAt}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-8">
        {!selected ? (
          <div className="text-sm text-slate-500">Select a ticket to view the thread.</div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-slate-50">{selectedTitle}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">{selected.id}</div>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[11px] text-slate-300">
                {selected.status}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {(selected.messages ?? []).map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-xl border border-white/10 bg-black/15 px-4 py-3",
                    m.role === "user" && "border-cyan-400/15",
                    m.role === "agent" && "border-amber-400/15",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-200">{m.role.toUpperCase()}</div>
                    <div className="font-mono text-[10px] text-slate-600">{m.createdAt}</div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-slate-200">{m.body}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="font-mono text-[11px] text-slate-400">Reply</div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="mt-2 h-28 w-full resize-none rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:border-cyan-400/40"
                placeholder="Write a message…"
              />
              <Button variant="primary" className="mt-3" disabled={busy} onClick={() => void sendReply()}>
                {busy ? <Spinner className="border-white/30 border-t-white" /> : "Send reply"}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
