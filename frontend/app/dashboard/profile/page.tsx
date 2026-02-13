"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Upload, Loader2, Pencil } from "lucide-react";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_SIZE_MB = 2;

export default function ProfilePage() {
  const { user, isAuthenticated, loading, updateProfile, uploadAvatar } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage(null);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: "error", text: `Image must be under ${MAX_SIZE_MB}MB.` });
      return;
    }
    setUploading(true);
    const res = await uploadAvatar(file);
    setUploading(false);
    if (res.success) {
      setMessage({ type: "success", text: "Photo updated." });
    } else {
      setMessage({ type: "error", text: res.error ?? "Upload failed." });
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    const res = await updateProfile({ name: name.trim() || undefined });
    setSaving(false);
    if (res.success) {
      setMessage({ type: "success", text: "Profile updated." });
    } else {
      setMessage({ type: "error", text: res.error ?? "Update failed." });
    }
  };

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-6xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-sm mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="max-w-2xl space-y-6">
          {/* Profile photo — standard card */}
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-neutral-500" />
              Profile photo
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt=""
                  className="w-20 h-20 rounded-full border-2 border-neutral-200 object-cover shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 text-xl font-medium border border-neutral-200 shrink-0">
                  {getInitials(name) || <User className="w-10 h-10" />}
                </div>
              )}
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_IMAGES}
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-label="Upload profile photo"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-neutral-500 mt-1">
                  JPEG, PNG, WebP or GIF. Max {MAX_SIZE_MB}MB.
                </p>
              </div>
            </div>
          </div>

          {/* Display name — standard card */}
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide flex items-center gap-2 mb-4">
              <Pencil className="w-4 h-4 text-neutral-500" />
              Display name
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-neutral-700 mb-1">
                  Name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-3 py-2 text-neutral-900 text-sm placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
              </div>
              {message && (
                <p
                  className={
                    message.type === "success" ? "text-green-700 text-sm" : "text-red-600 text-sm"
                  }
                >
                  {message.text}
                </p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline" size="sm">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </div>

          {/* Email — read-only */}
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide mb-2">Email</h2>
            <p className="text-neutral-700">{user.email}</p>
            <p className="text-neutral-500 text-sm mt-1">Managed by your Google account.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
