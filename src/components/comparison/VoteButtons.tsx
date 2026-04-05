"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type VoteValue = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT";

interface VoteButtonsProps {
  comparisonId: string;
  initialVote?: string | null;
  initialVoteCounts?: {
    sameQuality: number;
    closeEnough: number;
    notWorthIt: number;
  };
}

const VOTE_OPTIONS: {
  value: VoteValue;
  label: string;
  emoji: string;
  selectedClass: string;
  unselectedClass: string;
}[] = [
  {
    value: "SAME_QUALITY",
    label: "Same Quality",
    emoji: "👍",
    selectedClass:
      "bg-emerald-500/10 border-emerald-500 text-emerald-400",
    unselectedClass:
      "bg-gray-800 border-gray-700 text-gray-300 hover:border-emerald-700 hover:text-emerald-400",
  },
  {
    value: "CLOSE_ENOUGH",
    label: "Close Enough",
    emoji: "🤷",
    selectedClass:
      "bg-amber-500/10 border-amber-500 text-amber-400",
    unselectedClass:
      "bg-gray-800 border-gray-700 text-gray-300 hover:border-amber-700 hover:text-amber-400",
  },
  {
    value: "NOT_WORTH_IT",
    label: "Not Worth It",
    emoji: "👎",
    selectedClass:
      "bg-red-500/10 border-red-500 text-red-400",
    unselectedClass:
      "bg-gray-800 border-gray-700 text-gray-300 hover:border-red-700 hover:text-red-400",
  },
];

export function VoteButtons({
  comparisonId,
  initialVote = null,
}: VoteButtonsProps) {
  const { data: session, status } = useSession();
  const [currentVote, setCurrentVote] = useState<VoteValue | null>(
    (initialVote as VoteValue) ?? null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading" || status === "unauthenticated" || !session) {
    return (
      <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 text-center">
        <p className="text-gray-400 text-sm">
          <a href="/api/auth/signin" className="text-emerald-400 hover:underline">
            Sign in to vote
          </a>{" "}
          on this comparison.
        </p>
      </div>
    );
  }

  async function handleVote(value: VoteValue) {
    if (isLoading) return;
    const previousVote = currentVote;
    // Optimistic update
    setCurrentVote(value);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comparisonId, value }),
      });

      if (!res.ok) {
        // Revert on error
        setCurrentVote(previousVote);
        setError("Failed to save your vote. Please try again.");
      }
    } catch {
      setCurrentVote(previousVote);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-gray-400 text-sm font-medium">Cast your vote</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {VOTE_OPTIONS.map((option) => {
          const isSelected = currentVote === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleVote(option.value)}
              disabled={isLoading}
              aria-pressed={isSelected}
              className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${
                isSelected ? option.selectedClass : option.unselectedClass
              }`}
            >
              <span className="text-xl" role="img" aria-hidden="true">
                {option.emoji}
              </span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-red-400 text-xs text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
