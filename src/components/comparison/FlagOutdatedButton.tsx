"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Flag } from "lucide-react";

interface FlagOutdatedButtonProps {
  slug: string;
}

export function FlagOutdatedButton({ slug }: FlagOutdatedButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "signin">("idle");
  const [message, setMessage] = useState("");

  async function handleFlag() {
    if (!session?.user) {
      setStatus("signin");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`/api/comparisons/${slug}/flag`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setMessage(
          data.alreadyFlagged
            ? "You've already reported this one — thanks, we'll review it."
            : "Thanks for the report — we'll review this comparison."
        );
        setStatus("done");
      }
    } catch {
      setMessage("Network error, please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-xs font-medium text-muted" role="status">{message}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleFlag}
        disabled={status === "loading"}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-muted transition-colors hover:bg-paper hover:text-close disabled:opacity-50"
      >
        <Flag aria-hidden="true" className="h-3.5 w-3.5" />
        {status === "loading" ? "Reporting…" : "Report outdated info"}
      </button>
      {status === "error" && <p className="text-xs font-medium text-bad" role="alert">{message}</p>}
      {status === "signin" && (
        <p className="text-xs text-muted">
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(`/compare/${slug}`)}`}
            className="font-semibold text-brand-500 hover:underline"
          >
            Sign in
          </Link>{" "}
          to report outdated info.
        </p>
      )}
    </div>
  );
}
