"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { FileText, LogOut } from "lucide-react";

export function LandingHeader() {
  const { isAuthenticated, user, loading, error, loginWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-[#FDFBF7]/95 backdrop-blur-sm">
      {error && (
        <div className="bg-amber-100 text-amber-900 text-sm text-center py-2 px-4 border-b border-amber-200">
          {error}
        </div>
      )}
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg flex items-center gap-2 text-neutral-900">
          <FileText className="w-5 h-5" />
          DOCIT
        </Link>
        <nav className="flex items-center gap-3">
          {loading ? (
            <span className="text-sm text-neutral-400">Loading...</span>
          ) : isAuthenticated && user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" />
                Log out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={loginWithGoogle}>
              Sign in with Google
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
