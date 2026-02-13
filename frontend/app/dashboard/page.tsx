"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sticker } from "@/components/ui/sticker";
import { FileText, FolderOpen, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-2">
          Welcome, <span className="font-hand text-4xl md:text-5xl text-neutral-800">{user.name}</span>
        </h1>
        <p className="text-xl text-neutral-600 mb-12 max-w-2xl">
          Your document workspace. Upload, organize, and understand your files.
        </p>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          <Link href="/dashboard/workspaces">
            <Sticker className="min-h-[180px] flex flex-col cursor-pointer hover:scale-[1.02] transition-transform" rotation={-1} color="yellow" hasTape delay={0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-white/60 flex items-center justify-center border border-neutral-200/80">
                  <FolderOpen className="w-6 h-6 text-yellow-800/70" />
                </div>
                <h2 className="font-bold text-xl text-neutral-900">Workspaces</h2>
              </div>
              <p className="font-hand text-lg text-neutral-700 flex-1">
                Create workspaces and invite your team. Organize documents by project.
              </p>
              <p className="flex items-center gap-1 text-neutral-600 text-sm mt-2 font-medium">
                View workspaces <ArrowRight className="w-4 h-4" />
              </p>
            </Sticker>
          </Link>
          <Sticker className="min-h-[180px] flex flex-col" rotation={1} color="blue" hasTape tapeVariant="corner" delay={0.2}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/60 flex items-center justify-center border border-neutral-200/80">
                <FileText className="w-6 h-6 text-blue-800/70" />
              </div>
              <h2 className="font-bold text-xl text-neutral-900">Documents</h2>
            </div>
            <p className="font-hand text-lg text-neutral-700 flex-1">
              Upload PDFs and docs. AI summaries and search next.
            </p>
          </Sticker>
        </div>

        <div className="mt-12 pt-8 border-t border-dashed border-neutral-300">
          <p className="text-center text-neutral-400 font-hand text-lg">
            More features on the way — stay tuned.
          </p>
        </div>
      </div>
    </main>
  );
}
