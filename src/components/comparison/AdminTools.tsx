"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Archive, BadgeCheck, ShieldCheck } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface-2 px-4 py-3 text-sm text-muted">
      <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-subtle">
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
        Admin
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => act("markReviewed")}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 font-semibold text-brand-500 transition-colors hover:bg-brand-50 disabled:opacity-50"
      >
        <BadgeCheck aria-hidden="true" className="h-4 w-4" />
        Mark reviewed (prices &amp; facts checked)
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act("archive")}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 font-semibold text-bad transition-colors hover:bg-bad-bg disabled:opacity-50"
      >
        <Archive aria-hidden="true" className="h-4 w-4" />
        Archive
      </button>
      {message && (
        <span role="status" className="text-sm font-medium text-ink">
          {message}
        </span>
      )}
    </div>
  );
}
