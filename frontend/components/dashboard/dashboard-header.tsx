"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/dashboard/notification-bell";
import {
  FileText,
  LogOut,
  User,
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  BarChart3,
} from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: FolderOpen },
  { href: "/dashboard/summarize", label: "Summarize", icon: Sparkles },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl h-16 flex items-center justify-between gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 text-neutral-900 font-semibold tracking-tight"
        >
          <span className="flex w-9 h-9 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <FileText className="w-4 h-4" />
          </span>
          <span className="text-lg hidden sm:inline">DOCIT</span>
        </Link>

        <nav className="flex items-center gap-1 flex-1 justify-center max-w-xl">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-100 text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <NotificationBell />
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 rounded-lg py-1.5 pr-2 text-neutral-600 hover:text-neutral-900 transition-colors min-w-0"
            aria-label="Profile"
          >
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full border border-neutral-200 object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xs font-medium border border-neutral-200 shrink-0">
                {getInitials(user.name) || <User className="w-4 h-4" />}
              </div>
            )}
            <span className="hidden sm:inline max-w-[100px] truncate text-sm text-neutral-700">
              {user.name}
            </span>
          </Link>
          <span className="h-6 w-px bg-neutral-200 hidden sm:block" aria-hidden />
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-neutral-50"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
