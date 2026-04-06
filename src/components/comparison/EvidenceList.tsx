"use client";

import { useState } from "react";

interface EvidenceUser {
  username: string;
}

interface Evidence {
  id: string;
  type: string;
  title: string;
  content: string;
  url?: string | null;
  confidence?: string | null;
  createdAt: Date | string;
  user: EvidenceUser;
}

interface EvidenceListProps {
  evidence: Evidence[];
}

const evidenceTypeConfig: Record<string, { label: string; color: string }> = {
  MANUFACTURER_INFO: {
    label: "Manufacturer Info",
    color: "bg-emerald-50 text-emerald-700",
  },
  INGREDIENT_COMPARISON: {
    label: "Ingredients",
    color: "bg-blue-50 text-blue-700",
  },
  PHOTO: {
    label: "Photo",
    color: "bg-violet-50 text-violet-700",
  },
  VIDEO_LINK: {
    label: "Video",
    color: "bg-red-50 text-red-700",
  },
  OTHER: {
    label: "Other",
    color: "bg-gray-100 text-gray-500",
  },
};

const fallbackType = { label: "Evidence", color: "bg-gray-100 text-gray-500" };

const confidenceConfig: Record<string, { label: string; color: string }> = {
  CONFIRMED: {
    label: "\u2713 Confirmed",
    color: "bg-emerald-50 text-emerald-700",
  },
  COMMUNITY: {
    label: "Community Reported",
    color: "bg-blue-50 text-blue-700",
  },
  UNVERIFIED: {
    label: "Unverified",
    color: "bg-gray-100 text-gray-500",
  },
};

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  const [showAll, setShowAll] = useState(false);

  if (evidence.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h2 className="text-gray-900 font-semibold text-base mb-3">Evidence</h2>
        <p className="text-gray-400 text-sm">No evidence submitted yet.</p>
      </div>
    );
  }

  const visible = showAll ? evidence : evidence.slice(0, 3);
  const hasMore = evidence.length > 3;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-gray-900 font-semibold text-base mb-4">
        Evidence{" "}
        <span className="text-gray-400 font-normal text-sm">({evidence.length})</span>
      </h2>
      <div className="flex flex-col gap-4">
        {visible.map((entry) => {
          const typeConfig = evidenceTypeConfig[entry.type] ?? fallbackType;
          const confKey = entry.confidence ?? "UNVERIFIED";
          const conf = confidenceConfig[confKey] ?? confidenceConfig.UNVERIFIED;
          return (
            <div key={entry.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}
                >
                  {typeConfig.label}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${conf.color}`}
                >
                  {conf.label}
                </span>
                <span className="text-gray-400 text-xs">
                  by{" "}
                  <span className="text-gray-500 font-medium">{entry.user.username}</span>
                </span>
                <span className="text-gray-300 text-xs">{formatDate(entry.createdAt)}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{entry.content}</p>
              {entry.url && (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[#0d1b4a] hover:text-[#1e3a7a] text-xs transition-colors"
                >
                  View source &rarr;
                </a>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors font-medium"
        >
          Show all ({evidence.length})
        </button>
      )}
    </div>
  );
}
