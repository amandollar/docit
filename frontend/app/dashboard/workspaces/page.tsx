"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { listWorkspaces, createWorkspace } from "@/lib/api";
import type { Workspace } from "@/types/workspace";
import { ArrowLeft, FolderOpen, Plus, Loader2, ChevronRight } from "lucide-react";

export default function WorkspacesPage() {
  const { user, isAuthenticated, loading: authLoading, getAccessToken, refreshAndGetToken } = useAuth();
  const auth = useMemo(() => ({ getAccessToken, refreshAndGetToken }), [getAccessToken, refreshAndGetToken]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await listWorkspaces(auth);
    setLoading(false);
    if (res.success) setWorkspaces(res.data);
    else setError(res.error?.message ?? "Failed to load workspaces");
  }, [auth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
      return;
    }
    if (isAuthenticated) fetchWorkspaces();
  }, [authLoading, isAuthenticated, fetchWorkspaces]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreateError(null);
    setCreating(true);
    const res = await createWorkspace(auth, createName.trim(), createDescription.trim() || undefined);
    setCreating(false);
    if (res.success) {
      setWorkspaces((prev) => [res.data!, ...prev]);
      setShowCreate(false);
      setCreateName("");
      setCreateDescription("");
    } else {
      setCreateError(res.error?.message ?? "Failed to create workspace");
    }
  };

  if (authLoading) {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-sm mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 mb-2">
            Your <span className="font-hand text-4xl md:text-5xl text-neutral-800">workspaces</span>
          </h1>
          <p className="text-xl text-neutral-600 font-hand text-lg max-w-2xl">
            Create workspaces to organize documents and collaborate with your team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New workspace
          </Button>
        </div>

        {showCreate && (
          <div className="max-w-md mb-8 bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
            <h2 className="text-base font-semibold text-neutral-900 mb-4">Create workspace</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="ws-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Name
                </label>
                <input
                  id="ws-name"
                  type="text"
                  required
                  placeholder="e.g. Legal docs"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-neutral-900 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>
              <div>
                <label htmlFor="ws-desc" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description (optional)
                </label>
                <input
                  id="ws-desc"
                  type="text"
                  placeholder="Short description"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-neutral-900 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>
              {createError && <p className="text-red-600 text-sm">{createError}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-neutral-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading workspaces…
          </div>
        ) : error ? (
          <p className="text-red-600 text-sm">{error}</p>
        ) : workspaces.length === 0 ? (
          <div className="max-w-lg bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <FolderOpen className="w-8 h-8 text-neutral-400" />
              <h2 className="font-semibold text-neutral-900">No workspaces yet</h2>
            </div>
            <p className="text-neutral-600 text-sm mb-4">
              Create your first workspace to start uploading and organizing documents.
            </p>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create workspace
            </Button>
          </div>
        ) : (
          <ul className="space-y-2 max-w-4xl">
            {workspaces.map((ws) => (
              <li key={ws._id}>
                <Link
                  href={`/dashboard/workspaces/${ws._id}`}
                  className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg shadow-sm hover:border-neutral-300 hover:bg-neutral-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                    <FolderOpen className="w-5 h-5 text-neutral-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-neutral-900">{ws.name}</span>
                    {ws.description && (
                      <p className="text-sm text-neutral-500 truncate mt-0.5">{ws.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10 pt-6 border-t border-neutral-200">
          <p className="text-neutral-400 text-sm">
            Documents live inside each workspace — open one to upload and manage files.
          </p>
        </div>
      </div>
    </main>
  );
}
