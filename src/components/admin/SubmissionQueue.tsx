"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CircleCheck } from "lucide-react";

interface Comparison {
  id: string; genericProductName: string; genericBrand: string; genericStore: string;
  nameBrandProductName: string; nameBrand: string; createdAt: string | Date;
  genericPrice?: number | null; genericSize?: string | null;
  nameBrandPrice?: number | null; nameBrandSize?: string | null;
  category: { name: string; icon: string } | null;
  submittedBy: { name?: string | null; username: string } | null;
  evidence?: { id: string; title: string; content: string }[];
}

function priceLine(price?: number | null, size?: string | null) {
  if (price == null && !size) return "no price";
  return [price != null ? "$" + price.toFixed(2) : null, size].filter(Boolean).join(" · ");
}

interface SubmissionQueueProps { initialComparisons: Comparison[]; }

export function SubmissionQueue({ initialComparisons }: SubmissionQueueProps) {
  const [comparisons, setComparisons] = useState<Comparison[]>(initialComparisons);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessing(id); setError(null);
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "approve", comparisonId: id }) });
      if (!res.ok) { const data = await res.json(); setError(data.error ?? "Failed to approve"); setProcessing(null); return; }
      setComparisons((prev) => prev.filter((c) => c.id !== id));
    } catch { setError("Network error. Please try again."); } finally { setProcessing(null); }
  }

  async function handleReject(id: string) {
    setProcessing(id); setError(null);
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reject", comparisonId: id, reason: rejectReason[id] ?? "" }) });
      if (!res.ok) { const data = await res.json(); setError(data.error ?? "Failed to reject"); setProcessing(null); return; }
      setComparisons((prev) => prev.filter((c) => c.id !== id));
      setRejectingId(null);
    } catch { setError("Network error. Please try again."); } finally { setProcessing(null); }
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
  }

  if (comparisons.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line-strong bg-surface-2 p-10 text-center">
        <CircleCheck aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-good" />
        <p className="font-semibold text-ink">All caught up!</p>
        <p className="mt-1 text-sm text-muted">No pending submissions to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (<div className="bg-red-50 rounded-xl p-4 text-red-600 text-sm">{error}</div>)}

      {comparisons.map((comp) => (
        <div key={comp.id} className="glass rounded-2xl p-5 space-y-4" data-testid="submission-item">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-gray-900 font-semibold text-sm">{comp.genericProductName} vs {comp.nameBrandProductName}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
                {comp.category && <span>{comp.category.icon} {comp.category.name}</span>}
                <span>&middot;</span>
                <span>{comp.genericBrand} ({comp.genericStore}) vs {comp.nameBrand}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
                <span>Submitted by {comp.submittedBy ? (<span className="text-gray-500">{comp.submittedBy.name ? comp.submittedBy.name + " " : ""}(@{comp.submittedBy.username})</span>) : "anonymous"}</span>
                <span>&middot;</span>
                <span>{formatDate(comp.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 text-xs text-gray-600">
            <p><span className="text-gray-400">Store brand:</span> {priceLine(comp.genericPrice, comp.genericSize)}</p>
            <p><span className="text-gray-400">Name brand:</span> {priceLine(comp.nameBrandPrice, comp.nameBrandSize)}</p>
          </div>

          {comp.evidence && comp.evidence.length > 0 && (
            <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700 space-y-2">
              <p className="font-medium text-gray-500 uppercase tracking-wider text-[10px]">Submitted evidence (approved with the comparison)</p>
              {comp.evidence.map((ev) => (
                <div key={ev.id}>
                  <p className="font-medium">{ev.title}</p>
                  <p className="whitespace-pre-line">{ev.content}</p>
                </div>
              ))}
            </div>
          )}

          {rejectingId === comp.id && (
            <div>
              <label htmlFor={`reject-reason-${comp.id}`} className="block text-xs text-gray-500 mb-1">Rejection reason (optional)</label>
              <textarea
                id={`reject-reason-${comp.id}`} value={rejectReason[comp.id] ?? ""}
                onChange={(e) => setRejectReason((prev) => ({ ...prev, [comp.id]: e.target.value }))}
                placeholder="Why is this being rejected?" rows={2}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              />
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="primary" size="sm" loading={processing === comp.id} onClick={() => handleApprove(comp.id)} disabled={processing !== null}>Approve</Button>
            {rejectingId === comp.id ? (
              <>
                <Button variant="secondary" size="sm" loading={processing === comp.id} onClick={() => handleReject(comp.id)} disabled={processing !== null}>Confirm Reject</Button>
                <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)} disabled={processing !== null}>Cancel</Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setRejectingId(comp.id)} disabled={processing !== null} className="text-red-600 hover:text-red-700 border-red-200">Reject</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
