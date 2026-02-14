"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  getNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";
import type { Notification } from "@/types/notification";
import { Bell, FileText, UserPlus } from "lucide-react";

function formatTime(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function notificationMessage(n: Notification): string {
  const p = n.payload;
  if (n.type === "workspace_invite") {
    const who = p.actorName || "Someone";
    const ws = p.workspaceName || "a workspace";
    return `${who} added you to ${ws}`;
  }
  if (n.type === "document_uploaded") {
    const who = p.actorName || "Someone";
    const title = p.documentTitle || "a document";
    const ws = p.workspaceName ? ` in ${p.workspaceName}` : "";
    return `${who} uploaded "${title}"${ws}`;
  }
  return "New update";
}

function notificationLink(n: Notification): string {
  const p = n.payload;
  if (p.workspaceId) return `/dashboard/workspaces/${p.workspaceId}`;
  return "/dashboard";
}

export function NotificationBell() {
  const { getAccessToken, refreshAndGetToken } = useAuth();
  const auth = useCallback(
    () => ({ getAccessToken, refreshAndGetToken }),
    [getAccessToken, refreshAndGetToken]
  );
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchUnreadCount = useCallback(async () => {
    const res = await getNotificationUnreadCount(auth());
    if (res.success) setUnreadCount(res.data.count);
  }, [auth]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const res = await getNotifications(auth(), { limit: 15 });
    setLoading(false);
    if (res.success) setList(res.data);
  }, [auth]);

  useEffect(() => {
    fetchUnreadCount();
    const t = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(t);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const onFocus = () => fetchUnreadCount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (open) fetchList();
  }, [open, fetchList]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsRead(auth());
    if (res.success) {
      setUnreadCount(0);
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const handleClickNotification = async (n: Notification) => {
    if (!n.read) {
      await markNotificationRead(auth(), n._id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setList((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-semibold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 max-h-[min(24rem,70vh)] flex flex-col rounded-xl border border-neutral-200 bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
            <span className="text-sm font-semibold text-neutral-900">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-neutral-400 text-sm">
                Loading…
              </div>
            ) : list.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-sm">No notifications yet.</div>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {list.map((n) => (
                  <li key={n._id}>
                    <Link
                      href={notificationLink(n)}
                      onClick={() => handleClickNotification(n)}
                      className={`flex gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50 ${!n.read ? "bg-amber-50/50" : ""}`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {n.type === "workspace_invite" ? (
                          <UserPlus className="w-4 h-4 text-violet-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-blue-500" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-neutral-900 leading-snug">
                          {notificationMessage(n)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">{formatTime(n.createdAt)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
