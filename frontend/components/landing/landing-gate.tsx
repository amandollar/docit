"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

/**
 * When user is logged in, redirect to dashboard so they don't see the landing/marketing page.
 */
export function LandingGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      window.location.href = "/dashboard";
    }
  }, [loading, isAuthenticated]);

  if (loading || isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </main>
    );
  }

  return <>{children}</>;
}
