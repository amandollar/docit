import Link from "next/link";
import { FileText, Github } from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/amandollar/dockit";

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-[#FDFBF7] dark:bg-neutral-950">
      <div className="container mx-auto px-4 py-10 lg:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
              <FileText className="w-4 h-4" />
            </span>
            DOCIT
          </Link>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </div>
        <p className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400 font-hand text-base">
          © {new Date().getFullYear()} DOCIT. Built with paper & tape.
        </p>
      </div>
    </footer>
  );
}
