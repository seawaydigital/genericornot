"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface Comparison {
  id: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  nameBrandProductName: string;
  nameBrand: string;
  createdAt: string | Date;
  category: {
    name: string;
    icon: string;
  } | null;
  submittedBy: {
    name: string;
    username: string;
  } | null;
}

interface SubmissionQueueProps {
  initialComparisons: Comparison[];
}

export function SubmissionQueue({ initialComparisons }: SubmissionQueueProps) {
  const [comparisons, setComparisons] = useState<Comparison[]>(initialComparisons);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", comparisonId: id }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to approve");
        setProcessing(null);
        return;
      }
      // Optimistic: remove from list
      setComparisons((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(id: string) {
    setProcessing(id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          comparisonId: id,
          reason: rejectReason[id] ?? "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to reject");
        setProcessing(null);
        return;
      }
      // Optimistic: remove from list
      setComparisons((prev) => prev.filter((c) => c.id !== id));
      setRejectingId(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setProcessing(null);
    }
  }

  function formatDate(date: string | Date) {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  }

  if (comparisons.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-gray-300 font-medium">All caught up!</p>
        <p className="text-gray-500 text-sm mt-1">No pending submissions to review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {comparisons.map((comp) => (
        <div
          key={comp.id}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4"
          data-testid="submission-item"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-white font-semibold text-sm">
                {comp.genericProductName} vs {comp.nameBrandProductName}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-400">
                {comp.category && (
                  <span>
                    {comp.category.icon} {comp.category.name}
                  </span>
                )}
                <span>•</span>
                <span>
                  {comp.genericBrand} ({comp.genericStore}) vs {comp.nameBrand}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-gray-500">
                <span>
                  Submitted by{" "}
                  {comp.submittedBy ? (
                    <span className="text-gray-400">
                      {comp.submittedBy.name} (@{comp.submittedBy.username})
                    </span>
                  ) : (
                    "anonymous"
                  )}
                </span>
                <span>•</span>
                <span>{formatDate(comp.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Reject reason textarea (shown only when rejecting this item) */}
          {rejectingId === comp.id && (
            <div>
              <label
                htmlFor={`reject-reason-${comp.id}`}
                className="block text-xs text-gray-400 mb-1"
              >
                Rejection reason (optional)
              </label>
              <textarea
                id={`reject-reason-${comp.id}`}
                value={rejectReason[comp.id] ?? ""}
                onChange={(e) =>
                  setRejectReason((prev) => ({ ...prev, [comp.id]: e.target.value }))
                }
                placeholder="Why is this being rejected?"
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              loading={processing === comp.id}
              onClick={() => handleApprove(comp.id)}
              disabled={processing !== null}
            >
              Approve
            </Button>

            {rejectingId === comp.id ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={processing === comp.id}
                  onClick={() => handleReject(comp.id)}
                  disabled={processing !== null}
                >
                  Confirm Reject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejectingId(null)}
                  disabled={processing !== null}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRejectingId(comp.id)}
                disabled={processing !== null}
                className="text-red-400 hover:text-red-300 border-red-900/40"
              >
                Reject
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
