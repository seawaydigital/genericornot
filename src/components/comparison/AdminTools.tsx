"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Inline moderation for admins browsing the live site. Renders nothing for
 * everyone else, so the comparison page itself can stay cached and shared.
 */
export function AdminTools({ comparisonId }: { comparisonId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (session?.user?.role !== "ADMIN") return null;

  async function act(action: "markReviewed" | "archive") {
    if (action === "archive" && !window.confirm("Archive this comparison? It will be hidden from the site (restorable).")) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comparisonId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error ?? "Action failed");
        return;
      }
      setMessage(action === "markReviewed" ? "Marked as reviewed today." : "Archived.");
      router.refresh();
    } catch {
      setMessage("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-2 text-xs text-gray-600">
      <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-500">Admin</span>
      <button type="button" disabled={busy} onClick={() => act("markReviewed")} className="text-[#0d1b4a] hover:underline disabled:opacity-50">
        Mark reviewed (prices &amp; facts checked)
      </button>
      <button type="button" disabled={busy} onClick={() => act("archive")} className="text-red-700 hover:underline disabled:opacity-50">
        Archive
      </button>
      {message && <span role="status">{message}</span>}
    </div>
  );
}
