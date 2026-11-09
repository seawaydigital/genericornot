"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="bg-hero">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-bad-bg text-bad ring-1 ring-bad-line">
          <TriangleAlert aria-hidden="true" className="h-8 w-8" />
        </span>
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight text-ink">Something went wrong</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        {error.digest && <p className="mt-3 font-mono text-xs text-subtle">ref: {error.digest}</p>}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-line-strong"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
