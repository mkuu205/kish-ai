"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";

import { CHAT_MODES, type ChatModeId, getModeById } from "@/constants/modes";
import { CHAT_SUGGESTIONS } from "@/constants/suggestions";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { sendChat } from "@/services/chatService";
import type { ApiMessageContent, ChatMessage } from "@/types/chat";
import { ApiError } from "@/types/api";
import { isAuthUpgradeError } from "@/utils/errors";
import { useUiStore } from "@/store/uiStore";
import { useThemeStore } from "@/store/themeStore";
import { toast } from "@/store/toastStore";
import { usePaymentLauncher } from "@/hooks/usePaymentLauncher";
import { cn } from "@/utils/cn";

import { Button } from "@/components/ui/Button";
import { NotificationCenter } from "@/components/support/NotificationCenter";
import { LiveSupportWidget } from "@/components/support/LiveSupportWidget";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ChatExperience() {
  const { user, token, logout } = useAuth();
  const { status } = useSocket();
  const openPay = usePaymentLauncher();
  const setAuthModal = useUiStore((s) => s.setAuthModal);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const desktopSidebarCollapsed = useUiStore((s) => s.desktopSidebarCollapsed);
  const toggleDesktopSidebarCollapsed = useUiStore((s) => s.toggleDesktopSidebarCollapsed);

  const [mode, setMode] = useState<ChatModeId>("general");
  const [webSearch, setWebSearch] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState<{
    type: "image" | "doc";
    name: string;
    preview?: string;
    base64?: string;
    mediaType?: string;
    text?: string;
  } | null>(null);

  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isPro = user?.plan === "pro";

  const modeObj = useMemo(() => getModeById(mode), [mode]);

  const [limitText, setLimitText] = useState<string | null>(null);
  const [showLimitBar, setShowLimitBar] = useState(false);

  const clearChat = () => {
    setMessages([]);
    setWelcome(true);
    setLimitText(null);
    setShowLimitBar(false);
  };

  const selectMode = (id: ChatModeId) => {
    if (id !== "general" && !isPro) {
      openPay();
      toast("info", "Switch to Pro to use all 5 modes.");
      return;
    }
    setMode(id);
  };

  const toggleSearch = () => {
    if (!isPro) {
      openPay();
      toast("info", "Web search is a Pro feature.");
      return;
    }
    setWebSearch((v) => !v);
  };

  const onImagePick = async (file: File) => {
    if (!isPro) {
      openPay();
      toast("info", "Image upload is a Pro feature.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      setPendingFile({
        type: "image",
        name: file.name,
        preview: result,
        base64,
        mediaType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const onDocPick = async (file: File) => {
    if (!isPro) {
      openPay();
      toast("info", "Document upload is a Pro feature.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingFile({ type: "doc", name: file.name, text: String(reader.result ?? "") });
    };
    reader.readAsText(file);
  };

  const send = useCallback(
    async (forcedText?: string) => {
      if (!user || !token) {
        setAuthModal(true, "login");
        return;
      }
      const txt = (forcedText ?? input).trim();
      if (!txt && !pendingFile) return;
      if (loading) return;

      setInput("");
      setWelcome(false);

      const hasImg = pendingFile?.type === "image";
      const userText = txt || (pendingFile ? `Analyzing: ${pendingFile.name}` : "");

      let apiContent: ApiMessageContent;
      if (pendingFile?.type === "image" && pendingFile.base64 && pendingFile.mediaType) {
        apiContent = [
          { type: "image", source: { type: "base64", media_type: pendingFile.mediaType, data: pendingFile.base64 } },
          { type: "text", text: txt || "Describe and analyze this image." },
        ];
      } else if (pendingFile?.type === "doc" && pendingFile.text) {
        apiContent = `${txt || "Analyze this document:"}\n\n[File: ${pendingFile.name}]\n\n${pendingFile.text}`;
      } else {
        apiContent = txt;
      }

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        text: userText,
        filePreview: pendingFile?.preview ?? null,
        fileName: pendingFile?.name ?? null,
        apiContent,
      };

      setPendingFile(null);
      setMessages((m) => [...m, userMsg]);
      setLoading(true);
      setLimitText(null);
      setShowLimitBar(false);

      try {
        const apiMsgs = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.apiContent ?? m.text,
        }));

        const res = await sendChat(token, {
          messages: apiMsgs,
          system: modeObj.system,
          webSearch,
          hasImage: Boolean(hasImg),
          mode,
        });

        const aiMsg: ChatMessage = {
          id: newId(),
          role: "assistant",
          text: res.reply,
          modeId: mode,
          modeLabel: modeObj.label,
          modeColor: modeObj.color,
          apiContent: res.reply,
        };
        setMessages((m) => [...m, aiMsg]);

        if (user.plan === "free" && typeof res.messagesRemaining === "number" && res.messagesRemaining <= 3) {
          setShowLimitBar(true);
          setLimitText(
            res.messagesRemaining > 0
              ? `${res.messagesRemaining} free message${res.messagesRemaining !== 1 ? "s" : ""} left today.`
              : "Daily limit reached.",
          );
        }
      } catch (e) {
        if (isAuthUpgradeError(e)) {
          openPay();
          toast("info", e.message);
        } else if (e instanceof ApiError && e.message.toLowerCase().includes("limit")) {
          setShowLimitBar(true);
          setLimitText(e.message);
        } else {
          const msg = e instanceof Error ? e.message : "Unknown error";
          const errMsg: ChatMessage = {
            id: newId(),
            role: "assistant",
            text: `⚠ ${msg}`,
            modeId: mode,
            modeLabel: modeObj.label,
            modeColor: modeObj.color,
          };
          setMessages((m) => [...m, errMsg]);
        }
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      token,
      input,
      pendingFile,
      loading,
      messages,
      modeObj.system,
      modeObj.label,
      modeObj.color,
      webSearch,
      mode,
      setAuthModal,
      openPay,
    ],
  );

  const [welcome, setWelcome] = useState(true);

  const msgCountLabel = `${messages.length} message${messages.length !== 1 ? "s" : ""}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#060a12] pt-16 text-slate-100 data-[theme=light]:bg-slate-50 data-[theme=light]:text-slate-900 md:flex-row">
      <LiveSupportWidget />
      {/* Mobile sidebar scrim */}
      <button
        type="button"
        aria-label="Close sidebar"
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden",
          mobileSidebarOpen ? "block" : "hidden",
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[230px] flex-col border-r border-cyan-400/10 bg-[#060a12]/95 pt-16 backdrop-blur-xl transition-[transform,width] md:static md:z-0 md:translate-x-0 md:pt-16",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          desktopSidebarCollapsed ? "md:w-[58px]" : "md:w-[230px]",
        )}
      >
        <div
          className="flex cursor-pointer items-center gap-3 border-b border-white/10 px-3 py-4"
          onClick={() => toggleDesktopSidebarCollapsed()}
          role="presentation"
        >
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-cyan-400/40 bg-gradient-to-br from-cyan-400/30 to-cyan-400/10 font-mono text-sm text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]">
            K
          </div>
          {!desktopSidebarCollapsed ? (
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-[0.12em] text-white">KISH AI</div>
              <div className="truncate font-mono text-[9px] tracking-[0.2em] text-slate-500">NEURAL OS v3.0</div>
            </div>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {!desktopSidebarCollapsed ? (
            <div className="px-2 pb-2 font-mono text-[9px] tracking-[0.2em] text-slate-600">MODES</div>
          ) : null}
          <div className="space-y-1">
            {CHAT_MODES.map((m) => {
              const active = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectMode(m.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2.5 py-2 text-left transition",
                    active ? "border-cyan-400/35 bg-cyan-400/10" : "hover:bg-white/5",
                  )}
                  style={
                    active
                      ? ({
                          borderColor: `${m.color}55`,
                          background: `${m.color}18`,
                        } as CSSProperties)
                      : undefined
                  }
                >
                  <span className="min-w-[20px] font-mono text-sm" style={{ color: active ? m.color : "#2d3a4a" }}>
                    {m.icon}
                  </span>
                  {!desktopSidebarCollapsed ? (
                    <div className="min-w-0">
                      <div className={cn("truncate text-[13px] font-medium", active ? "text-white" : "text-slate-400")}>
                        {m.label}
                      </div>
                      <div className="truncate text-[10px] text-slate-600">{m.desc}</div>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {!desktopSidebarCollapsed ? (
          <div className="border-t border-white/10 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-300">Web Search</div>
                <div className="text-[10px] text-slate-600">Live data</div>
              </div>
              <button
                type="button"
                aria-label="Toggle web search"
                className={cn(
                  "relative h-5 w-9 rounded-full bg-slate-800 transition",
                  webSearch && "bg-cyan-400",
                )}
                onClick={toggleSearch}
              >
                <span
                  className={cn(
                    "absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-white transition",
                    webSearch && "left-[18px]",
                  )}
                />
              </button>
            </div>

            <Button variant="ghost" className="mt-2.5 w-full border border-white/10 py-2 text-[11px]" onClick={clearChat}>
              ✕ Clear Chat
            </Button>

            {!isPro ? (
              <Button variant="primary" className="mt-2 w-full py-2 text-xs" onClick={openPay}>
                ⚡ Upgrade to Pro
              </Button>
            ) : null}

            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-slate-400">Theme</div>
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => toggleTheme()}>
                Toggle
              </Button>
            </div>

            <div className="mt-2 space-y-1">
              <Link className="block rounded-lg px-2 py-2 text-xs text-slate-300 hover:bg-white/5" href="/support">
                💬 Support
              </Link>
              <Link className="block rounded-lg px-2 py-2 text-xs text-slate-300 hover:bg-white/5" href="/billing">
                💳 Billing
              </Link>
              {user?.role === "admin" ? (
                <Link className="block rounded-lg px-2 py-2 text-xs text-amber-300 hover:bg-white/5" href="/admin">
                  ⚡ Admin
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#060a12]/70 px-4 py-3.5 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm md:hidden"
              onClick={() => setMobileSidebarOpen(true)}
            >
              ☰
            </button>
            <div
              className="inline-flex max-w-[65vw] items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:max-w-none"
              style={{
                borderColor: `${modeObj.color}44`,
                background: `${modeObj.color}15`,
                color: modeObj.color,
              }}
            >
              <span className="font-mono">{modeObj.icon}</span>
              <span className="truncate">{modeObj.label}</span>
            </div>
            {webSearch ? (
              <div className="hidden items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-300 sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.9)]" />
                Live Search
              </div>
            ) : null}
            {!isPro ? (
              <button
                type="button"
                className="hidden items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-[11px] text-orange-300 sm:inline-flex"
                onClick={openPay}
              >
                🔒 Pro Feature
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden font-mono text-[11px] text-slate-600 sm:block">{msgCountLabel}</div>
            <div className="hidden font-mono text-[10px] text-slate-600 sm:block">
              {status === "connected" ? "socket: ok" : `socket: ${status}`}
            </div>
            <NotificationCenter />
            <Link
              href="/"
              className="hidden rounded-lg border border-white/10 bg-transparent px-2 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-300 sm:inline-flex"
            >
              Home
            </Link>
            <Button variant="ghost" className="px-2 py-2 text-xs" onClick={() => void logout()}>
              Log out
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6">
            {welcome && messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-7 pb-10 pt-6 text-center">
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-cyan-400/25 to-transparent font-mono text-3xl shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                  K
                </div>
                <div>
                  <h2 className="text-3xl font-light tracking-[0.15em]">
                    KISH <em className="font-bold not-italic text-cyan-300">AI</em>
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">Web Search · Vision · Memory · 5 Modes</p>
                </div>
                <div className="flex max-w-xl flex-wrap justify-center gap-2">
                  {CHAT_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-slate-400 transition hover:border-cyan-400/35 hover:bg-cyan-400/10 hover:text-cyan-300"
                      onClick={() => void send(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    { icon: "🔍", label: "Live Search", color: "#00e5ff" },
                    { icon: "🖼️", label: "Image AI", color: "#f472b6" },
                    { icon: "📄", label: "Read Docs", color: "#4ade80" },
                    { icon: "🧠", label: "Memory", color: "#a78bfa" },
                    { icon: "⚙️", label: "Persona", color: "#fb923c" },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px]"
                      style={{ borderColor: `${p.color}33` }}
                    >
                      <span>{p.icon}</span>
                      <span style={{ color: p.color }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => <MessageBubble key={m.id} message={m} />)
            )}
            {loading ? <TypingIndicator color={modeObj.color} /> : null}
          </div>

          {showLimitBar ? (
            <div className="mx-4 mb-2 flex items-center gap-3 rounded-lg border border-orange-400/20 bg-orange-400/10 px-3 py-2 text-xs text-orange-200 sm:mx-6">
              <span>⚠</span>
              <div className="flex-1">{limitText}</div>
              <button type="button" className="font-mono text-[11px] text-cyan-300 underline" onClick={openPay}>
                Upgrade to Pro →
              </button>
            </div>
          ) : null}

          {pendingFile ? (
            <div className="mx-4 mb-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 sm:mx-6">
              {pendingFile.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={pendingFile.preview} alt="" className="h-9 w-9 rounded-md object-cover" />
              ) : (
                <span className="text-xl">📄</span>
              )}
              <div className="min-w-0 flex-1 truncate text-xs text-slate-400">{pendingFile.name}</div>
              <button type="button" className="text-slate-500 hover:text-red-400" onClick={() => setPendingFile(null)}>
                ×
              </button>
            </div>
          ) : null}

          <div className="border-t border-white/10 bg-[#060a12]/85 px-4 py-3.5 backdrop-blur-xl sm:px-6">
            <div className="flex items-end gap-2">
              <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void onImagePick(f);
              }} />
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,.json,.js,.ts,.py,.html,.css,.xml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void onDocPick(f);
                }}
              />

              <button
                type="button"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg transition hover:border-cyan-400/35 hover:bg-cyan-400/10",
                  !isPro && "opacity-45",
                )}
                title="Upload image"
                onClick={() => imgInputRef.current?.click()}
              >
                🖼️
              </button>
              <button
                type="button"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg transition hover:border-cyan-400/35 hover:bg-cyan-400/10",
                  !isPro && "opacity-45",
                )}
                title="Upload document"
                onClick={() => fileInputRef.current?.click()}
              >
                📄
              </button>

              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Message Kish..."
                className="max-h-40 min-h-[42px] flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400/45"
              />

              <button
                type="button"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg text-lg transition",
                  (input.trim() || pendingFile) && !loading
                    ? "cursor-pointer bg-gradient-to-br from-cyan-400 to-cyan-600 text-black shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : "cursor-not-allowed bg-white/5 text-white/40",
                )}
                onClick={() => void send()}
              >
                ↑
              </button>
            </div>
            <div className="mt-2 text-center font-mono text-[10px] tracking-wide text-slate-600">
              KISH AI · {modeObj.label.toUpperCase()} · {webSearch ? "WEB ON" : "OFFLINE"} · ENTER TO SEND
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
