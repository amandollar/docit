"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Button } from "@/components/ui/button";
import { summarizeFileEnhanced, type EnhancedSummary } from "@/lib/api";
import { ArrowLeft, FileText, Sparkles, Loader2, Copy, Check, Tag, List, FileType } from "lucide-react";

export default function SummarizePage() {
  const { isAuthenticated, loading, getAccessToken, refreshAndGetToken } = useAuth();
  const auth = { getAccessToken, refreshAndGetToken };

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<EnhancedSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [loading, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    const res = await summarizeFileEnhanced(auth, file);
    setSubmitting(false);
    if (res.success) setResult(res.data);
    else setError(res.error?.message ?? "Summarization failed.");
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = [
      result.summary,
      "",
      "Key points:",
      ...result.keyPoints.map((p) => `• ${p}`),
      "",
      "Topics: " + result.topics.join(", "),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      <DashboardHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 text-sm mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wide flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              Summarize a document
            </h2>
            <p className="text-neutral-500 text-sm mb-4">
              Upload a PDF or text file. We&apos;ll generate a structured summary with key points, topics, and document type.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf,.txt,text/plain,.csv,text/csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  aria-label="Choose file"
                />
                <div
                  className="border-2 border-dashed border-neutral-200 rounded-xl p-6 text-center cursor-pointer hover:border-neutral-300 hover:bg-neutral-50/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const f = e.dataTransfer.files[0];
                    if (f) setFile(f);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {file ? (
                    <p className="text-neutral-900 font-medium">{file.name}</p>
                  ) : (
                    <p className="text-neutral-500 text-sm">Click or drop a PDF or text file</p>
                  )}
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={!file || submitting} className="gap-2">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get summary
                    </>
                  )}
                </Button>
                {file && !submitting && (
                  <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </div>

          {result && (
            <div className="space-y-4">
              {/* Document type badge */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-sm font-medium">
                    <FileType className="w-3.5 h-3.5" />
                    {result.documentType}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy all
                    </>
                  )}
                </Button>
              </div>

              {/* Summary */}
              <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
                  <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-500" />
                    Summary
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                </div>
              </div>

              {/* Key points */}
              {result.keyPoints.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                      <List className="w-4 h-4 text-neutral-500" />
                      Key points
                    </h3>
                  </div>
                  <ul className="p-5 space-y-2">
                    {result.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-3 text-sm text-neutral-700">
                        <span className="text-violet-500 font-medium shrink-0">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Topics */}
              {result.topics.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50">
                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-neutral-500" />
                      Topics
                    </h3>
                  </div>
                  <div className="p-5 flex flex-wrap gap-2">
                    {result.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={handleReset}>
                Summarize another
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
