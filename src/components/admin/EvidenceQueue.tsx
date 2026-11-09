"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface PendingEvidence {
  id: string;
  type: string;
  title: string;
  content: string;
  url: string | null;
  createdAt: string;
  user: { username: string };
  comparison: { slug: string; genericProductName: string; nameBrandProductName: string };
}

type Confidence = "UNVERIFIED" | "COMMUNITY" | "CONFIRMED";

const CONFIDENCE_HELP: Record<Confidence, string> = {
  UNVERIFIED: "Single report or personal experience",
  COMMUNITY: "Corroborated by several people",
  CONFIRMED: "Backed by a regulator, label or official source (link required)",
};

export function EvidenceQueue({ initialEvidence }: { initialEvidence: PendingEvidence[] }) {
  const [items, setItems] = useState(initialEvidence);
  const [confidence, setConfidence] = useState<Record<string, Confidence>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(id: string, action: "approveEvidence" | "rejectEvidence") {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, evidenceId: id, confidence: confidence[id] ?? "UNVERIFIED" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Action failed");
        return;
      }
      setItems((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-700 font-medium">No evidence waiting for review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 rounded-xl p-4 text-red-600 text-sm">{error}</div>}
      {items.map((ev) => {
        const level = confidence[ev.id] ?? "UNVERIFIED";
        return (
          <div key={ev.id} className="glass rounded-2xl p-5 space-y-3" data-testid="evidence-item">
            <div>
              <a href={`/compare/${ev.comparison.slug}`} className="text-xs font-medium text-brand-500 hover:underline" target="_blank" rel="noopener noreferrer">
                {ev.comparison.genericProductName} vs {ev.comparison.nameBrandProductName}
              </a>
              <h3 className="text-gray-900 font-semibold text-sm mt-1">{ev.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {ev.type.replace(/_/g, " ").toLowerCase()} · by @{ev.user.username} ·{" "}
                {new Date(ev.createdAt).toLocaleDateString("en-CA")}
              </p>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{ev.content}</p>
            {ev.url && (
              <p className="text-xs break-all">
                Link:{" "}
                <a href={ev.url} target="_blank" rel="nofollow ugc noopener noreferrer" className="text-brand-500 hover:underline">
                  {ev.url}
                </a>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor={`conf-${ev.id}`} className="text-xs text-gray-500">Approve as</label>
              <select
                id={`conf-${ev.id}`}
                value={level}
                onChange={(e) => setConfidence((prev) => ({ ...prev, [ev.id]: e.target.value as Confidence }))}
                className="bg-white border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1"
              >
                <option value="UNVERIFIED">Unverified</option>
                <option value="COMMUNITY">Community reported</option>
                <option value="CONFIRMED">Confirmed</option>
              </select>
              <span className="text-[11px] text-gray-400">{CONFIDENCE_HELP[level]}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => act(ev.id, "approveEvidence")} loading={processing === ev.id} disabled={processing !== null}>
                Approve
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => act(ev.id, "rejectEvidence")}
                disabled={processing !== null}
                className="text-red-600 hover:text-red-700 border-red-200"
              >
                Reject
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
