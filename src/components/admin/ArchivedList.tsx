"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ArchivedComparison {
  id: string;
  genericProductName: string;
  nameBrandProductName: string;
  reason: string | null;
}

/** Hidden comparisons with a one-click restore, so nothing archived is ever lost. */
export function ArchivedList({ initialArchived }: { initialArchived: ArchivedComparison[] }) {
  const [items, setItems] = useState(initialArchived);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function restore(id: string) {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", comparisonId: id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Restore failed");
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
    return <p className="text-sm text-gray-500">Nothing is archived.</p>;
  }

  return (
    <details className="glass rounded-2xl p-5">
      <summary className="cursor-pointer text-sm font-medium text-gray-700">
        Show {items.length} archived comparison{items.length === 1 ? "" : "s"}
      </summary>
      {error && <div className="mt-3 bg-red-50 rounded-xl p-3 text-red-600 text-sm">{error}</div>}
      <ul className="mt-4 divide-y divide-gray-100">
        {items.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 py-2.5" data-testid="archived-item">
            <div className="min-w-0">
              <p className="text-sm text-gray-900 truncate">
                {c.genericProductName} vs {c.nameBrandProductName}
              </p>
              {c.reason && <p className="text-xs text-gray-500">{c.reason}</p>}
            </div>
            <Button size="sm" variant="secondary" onClick={() => restore(c.id)} loading={processing === c.id} disabled={processing !== null}>
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </details>
  );
}
