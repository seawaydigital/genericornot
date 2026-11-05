"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FlaggedComparison {
  id: string;
  slug: string;
  genericProductName: string;
  nameBrandProductName: string;
  flagCount: number;
  flaggedOutdated: boolean;
  reasons: string[];
}

export function FlaggedQueue({ initialFlagged }: { initialFlagged: FlaggedComparison[] }) {
  const [items, setItems] = useState(initialFlagged);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "markReviewed" | "archive") {
    if (action === "archive" && !window.confirm("Archive this comparison? It will disappear from the site (you can restore it later).")) {
      return;
    }
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comparisonId: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action failed");
        return;
      }
      setItems((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-700 font-medium">Nothing has been reported as outdated.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 rounded-xl p-4 text-red-600 text-sm">{error}</div>}
      {items.map((c) => (
        <div key={c.id} className="glass rounded-2xl p-5 space-y-3" data-testid="flagged-item">
          <div className="flex items-start justify-between gap-4">
            <a href={`/compare/${c.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-900 font-semibold text-sm hover:text-[#0d1b4a]">
              {c.genericProductName} vs {c.nameBrandProductName}
            </a>
            <span className={`text-xs font-medium rounded-full px-2 py-0.5 shrink-0 ${c.flaggedOutdated ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
              {c.flagCount} report{c.flagCount === 1 ? "" : "s"}
            </span>
          </div>
          {c.reasons.length > 0 && (
            <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
              {c.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => act(c.id, "markReviewed")} loading={processing === c.id} disabled={processing !== null}>
              Mark reviewed (clears reports)
            </Button>
            <Button size="sm" variant="secondary" onClick={() => act(c.id, "archive")} disabled={processing !== null}>
              Archive
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
