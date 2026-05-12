"use client";

import { motion } from "framer-motion";

import { cn } from "@/utils/cn";
import type { ChatMessage } from "@/types/chat";

import { MarkdownContent } from "./MarkdownContent";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const color = message.modeColor ?? "#22d3ee";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-semibold"
        style={{
          borderColor: `${color}55`,
          background: `${color}22`,
          color,
        }}
      >
        {isUser ? "U" : "K"}
      </div>

      <div className={cn("flex max-w-[72%] flex-col gap-2", isUser && "items-end")}>
        {message.filePreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.filePreview}
            alt=""
            className="max-h-40 max-w-[200px] rounded-lg object-cover"
          />
        ) : null}
        {message.fileName && !message.filePreview ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <span>📄</span>
            <span className="truncate">{message.fileName}</span>
          </div>
        ) : null}

        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm leading-relaxed",
            isUser ? "rounded-br-sm" : "rounded-bl-sm border-white/10 bg-white/5",
          )}
          style={
            isUser
              ? {
                  borderColor: `${color}55`,
                  background: `${color}18`,
                }
              : undefined
          }
        >
          {isUser ? (
            <div className="whitespace-pre-wrap text-slate-50">{message.text}</div>
          ) : (
            <MarkdownContent text={message.text} />
          )}
        </div>

        {!isUser && message.modeLabel ? (
          <div className="font-mono text-[10px] tracking-wide text-slate-500">
            <span style={{ color }}>{message.modeLabel.toUpperCase()} MODE</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
