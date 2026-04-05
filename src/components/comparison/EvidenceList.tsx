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
  createdAt: Date | string;
  user: EvidenceUser;
}

interface EvidenceListProps {
  evidence: Evidence[];
}

const evidenceTypeConfig: Record<string, { label: string; color: string }> = {
  MANUFACTURER_INFO: {
    label: "Manufacturer Info",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  INGREDIENT_COMPARISON: {
    label: "Ingredients",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  PHOTO: {
    label: "Photo",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  VIDEO_LINK: {
    label: "Video",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  OTHER: {
    label: "Other",
    color: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
};

const fallbackType = { label: "Evidence", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" };

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function EvidenceList({ evidence }: EvidenceListProps) {
  const [showAll, setShowAll] = useState(false);

  if (evidence.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-base mb-3">Evidence</h2>
        <p className="text-gray-500 text-sm">No evidence submitted yet.</p>
      </div>
    );
  }

  const visible = showAll ? evidence : evidence.slice(0, 3);
  const hasMore = evidence.length > 3;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <h2 className="text-white font-semibold text-base mb-4">
        Evidence{" "}
        <span className="text-gray-500 font-normal text-sm">({evidence.length})</span>
      </h2>
      <div className="flex flex-col gap-4">
        {visible.map((entry) => {
          const typeConfig = evidenceTypeConfig[entry.type] ?? fallbackType;
          return (
            <div key={entry.id} className="border-b border-gray-800 last:border-0 pb-4 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig.color}`}
                >
                  {typeConfig.label}
                </span>
                <span className="text-gray-500 text-xs">
                  by{" "}
                  <span className="text-gray-400 font-medium">{entry.user.username}</span>
                </span>
                <span className="text-gray-600 text-xs">{formatDate(entry.createdAt)}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{entry.content}</p>
              {entry.url && (
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-400 hover:text-blue-300 text-xs underline underline-offset-2 transition-colors"
                >
                  View source →
                </a>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Show all ({evidence.length})
        </button>
      )}
    </div>
  );
}
