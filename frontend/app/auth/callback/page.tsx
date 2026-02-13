"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { exchangeCodeForTokens } from "@/lib/api";
import { Button } from "@/components/ui/button";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const { setAuthFromCallback } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const code = searchParams.get("code");

  const handleCallback = useCallback(async () => {
    if (!code) {
      setStatus("error");
      setErrorMessage("Missing authorization code.");
      return;
    }
    const result = await exchangeCodeForTokens(code);
    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error?.message ?? "Sign-in failed.");
      return;
    }
    const { user, accessToken, refreshToken, expiresIn } = result.data;
    setAuthFromCallback(user, accessToken, refreshToken, expiresIn);
    setStatus("success");
    window.location.href = "/dashboard";
  }, [code, setAuthFromCallback]);

  useEffect(() => {
    if (code) handleCallback();
    else setStatus("error");
  }, [code, handleCallback]);

  useEffect(() => {
    if (status === "error" && !errorMessage) setErrorMessage("Missing authorization code.");
  }, [status, errorMessage]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-neutral-600">Signing you in...</p>
          <div className="mt-4 w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Sign-in failed</h1>
          <p className="text-neutral-600 mb-6">{errorMessage}</p>
          <Link href="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <p className="text-neutral-600">Redirecting to dashboard...</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-neutral-600">Signing you in...</p>
            <div className="mt-4 w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto" />
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
