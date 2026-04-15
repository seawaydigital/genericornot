"use client";

import Link from "next/link";
import { useEffect } from "react";

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
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <p className="text-7xl font-bold text-gray-200">!</p>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            An unexpected error occurred while loading this page. Please try again.
          </p>
          {error.digest && (
            <p className="mt-3 text-gray-300 text-xs font-mono">
              ref: {error.digest}
            </p>
          )}
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-gradient-to-b from-[#0d1b4a] to-[#162d6b] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-110"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
