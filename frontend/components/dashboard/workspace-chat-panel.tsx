"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { WorkspaceChatMessage } from "@/types/chat";
import { MessageCircle, Send, Loader2, AlertCircle } from "lucide-react";
import type { ChatStatus } from "@/lib/use-workspace-chat";

interface WorkspaceChatPanelProps {
  messages: WorkspaceChatMessage[];
  status: ChatStatus;
  errorMessage: string | null;
  onSend: (text: string) => void;
  onReconnect?: () => void;
  currentUserId?: string | null;
}

function formatChatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function WorkspaceChatPanel({
  messages,
  status,
  errorMessage,
  onSend,
  onReconnect,
  currentUserId,
}: WorkspaceChatPanelProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    onSend(t);
    setInput("");
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[360px]">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-neutral-500" />
          Workspace chat
        </h2>
        <div className="flex items-center gap-2">
          {status === "connecting" && (
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Connecting…
            </span>
          )}
          {status === "connected" && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Live
            </span>
          )}
          {status === "error" && errorMessage && (
            <span className="flex items-center gap-1.5 text-xs text-amber-700" title={errorMessage}>
              <AlertCircle className="w-3.5 h-3.5" />
              {errorMessage}
              {onReconnect && (
                <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onReconnect}>
                  Retry
                </Button>
              )}
            </span>
          )}
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && status === "connected" && (
          <p className="text-neutral-500 text-sm text-center py-6">No messages yet. Say hello!</p>
        )}
        {messages.length === 0 && status !== "connected" && status !== "connecting" && (
          <p className="text-neutral-500 text-sm text-center py-6">Connect to see and send messages.</p>
        )}
        {messages.map((m) => {
          const isOwn = currentUserId && m.userId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[85%] ${isOwn ? "ml-auto items-end" : "items-start"}`}
            >
              {!isOwn && (
                <span className="text-xs font-medium text-neutral-500 mb-0.5">{m.userName}</span>
              )}
              <div
                className={`rounded-xl px-3 py-2 text-sm ${
                  isOwn
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <p className="break-words">{m.text}</p>
              </div>
              <span className="text-[10px] text-neutral-400 mt-0.5">{formatChatTime(m.createdAt)}</span>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-100 flex gap-2">
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          disabled={status !== "connected"}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 disabled:bg-neutral-50 disabled:text-neutral-500"
        />
        <Button type="submit" size="sm" disabled={status !== "connected" || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
