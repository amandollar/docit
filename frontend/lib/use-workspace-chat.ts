"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkspaceChatMessage } from "@/types/chat";

const API_WS_BASE =
  (typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").replace(/^http/, "ws")
    : "ws://localhost:5000");

export type ChatStatus = "connecting" | "connected" | "disconnected" | "error";

export function useWorkspaceChat(workspaceId: string | null, getAccessToken: () => string | null) {
  const [messages, setMessages] = useState<WorkspaceChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    const accessToken = getAccessToken();
    if (!workspaceId || !accessToken) return;
    const url = `${API_WS_BASE}/ws?token=${encodeURIComponent(accessToken)}&workspaceId=${encodeURIComponent(workspaceId)}`;
    setStatus("connecting");
    setErrorMessage(null);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === "joined" && Array.isArray(data.history)) {
          setMessages(
            data.history.map((m: WorkspaceChatMessage) => ({
              ...m,
              createdAt: typeof m.createdAt === "string" ? m.createdAt : new Date(m.createdAt).toISOString(),
            }))
          );
        } else if (data.type === "message") {
          const newMsg = {
            id: data.id,
            userId: data.userId,
            userName: data.userName ?? "Unknown",
            text: data.text,
            createdAt: typeof data.createdAt === "string" ? data.createdAt : new Date(data.createdAt).toISOString(),
          };
          setMessages((prev) => (prev.some((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]));
        } else if (data.type === "error") {
          setErrorMessage(data.message ?? "Error");
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      setStatus("disconnected");
      if (event.code !== 1000 && event.code !== 4000 && workspaceId && getAccessToken()) {
        setStatus("error");
        if (event.code === 4001) setErrorMessage("Invalid or expired session. Refresh the page.");
        else if (event.code === 4003) setErrorMessage("You don’t have access to this workspace.");
        else setErrorMessage("Disconnected. Reconnecting…");
        const delay = Math.min(3000 * 2 ** reconnectAttempts.current, 30000);
        reconnectAttempts.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
      }
    };

    ws.onerror = () => {
      setStatus("error");
      setErrorMessage("Connection error");
    };
  }, [workspaceId, getAccessToken]);

  useEffect(() => {
    if (!workspaceId) {
      setStatus("disconnected");
      setMessages([]);
      return;
    }
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close(1000);
        wsRef.current = null;
      }
      setStatus("disconnected");
    };
  }, [workspaceId, getAccessToken, connect]);

  const send = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const trimmed = text.trim().slice(0, 2000);
    if (!trimmed) return;
    ws.send(JSON.stringify({ type: "message", text: trimmed }));
  }, []);

  return { messages, status, errorMessage, send, reconnect: connect };
}
