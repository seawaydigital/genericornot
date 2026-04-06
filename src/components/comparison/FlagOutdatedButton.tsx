"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface FlagOutdatedButtonProps {
  slug: string;
}

export function FlagOutdatedButton({ slug }: FlagOutdatedButtonProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFlag() {
    if (!session?.user) {
      setMessage("You must be signed in to flag a comparison.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(`/api/comparisons/${slug}/flag`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Something went wrong.");
        setStatus("error");
      } else {
        setMessage("Thanks for the report — we'll review this comparison.");
        setStatus("done");
      }
    } catch {
      setMessage("Network error, please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="text-sm text-gray-400 italic">{message}</p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleFlag}
        disabled={status === "loading"}
        className="text-xs text-gray-500 hover:text-amber-400 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Flagging…" : "Flag as outdated"}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400">{message}</p>
      )}
    </div>
  );
}
