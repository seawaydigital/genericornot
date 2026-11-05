"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
    return <p className="text-sm text-gray-500 italic" role="status">{message}</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleFlag}
        disabled={status === "loading"}
        className="text-xs text-gray-500 hover:text-amber-700 underline-offset-2 hover:underline transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Reporting…" : "Report outdated info"}
      </button>
      {status === "error" && <p className="text-xs text-red-600" role="alert">{message}</p>}
      {status === "signin" && (
        <p className="text-xs text-gray-600">
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent(`/compare/${slug}`)}`}
            className="text-[#0d1b4a] font-medium hover:underline"
          >
            Sign in
          </Link>{" "}
          to report outdated info.
        </p>
      )}
    </div>
  );
}
