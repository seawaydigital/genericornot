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
    emoji: "\ud83d\udc4d",
    selectedClass:
      "bg-emerald-50 border-emerald-300 text-emerald-700",
    unselectedClass:
      "bg-white border-gray-200 text-gray-500 hover:border-emerald-200 hover:text-emerald-600",
  },
  {
    value: "CLOSE_ENOUGH",
    label: "Close Enough",
    emoji: "\ud83e\udd37",
    selectedClass:
      "bg-amber-50 border-amber-300 text-amber-700",
    unselectedClass:
      "bg-white border-gray-200 text-gray-500 hover:border-amber-200 hover:text-amber-600",
  },
  {
    value: "NOT_WORTH_IT",
    label: "Not Worth It",
    emoji: "\ud83d\udc4e",
    selectedClass:
      "bg-red-50 border-red-300 text-red-700",
    unselectedClass:
      "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600",
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
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-gray-500 text-sm">
          <a href="/api/auth/signin" className="text-[#0d1b4a] hover:underline font-medium">
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
      <p className="text-gray-500 text-sm font-medium">Cast your vote</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {VOTE_OPTIONS.map((option) => {
          const isSelected = currentVote === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleVote(option.value)}
              disabled={isLoading}
              aria-pressed={isSelected}
              className={`flex-1 flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
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
        <p className="text-red-600 text-xs text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
