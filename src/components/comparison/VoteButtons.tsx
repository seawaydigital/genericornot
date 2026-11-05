"use client";

import { VOTE_LABELS } from "@/lib/verdict-labels";

export type VoteValue = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT";

interface VoteButtonsProps {
  currentVote: VoteValue | null;
  onVote: (value: VoteValue) => void;
  disabled?: boolean;
}

const VOTE_OPTIONS: {
  value: VoteValue;
  emoji: string;
  selectedClass: string;
  unselectedClass: string;
}[] = [
  {
    value: "SAME_QUALITY",
    emoji: "👍",
    selectedClass: "bg-emerald-50 border-emerald-300 text-emerald-700",
    unselectedClass: "bg-white border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-700",
  },
  {
    value: "CLOSE_ENOUGH",
    emoji: "🤷",
    selectedClass: "bg-amber-50 border-amber-300 text-amber-700",
    unselectedClass: "bg-white border-gray-200 text-gray-600 hover:border-amber-200 hover:text-amber-700",
  },
  {
    value: "NOT_WORTH_IT",
    emoji: "👎",
    selectedClass: "bg-red-50 border-red-300 text-red-700",
    unselectedClass: "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-700",
  },
];

export function VoteButtons({ currentVote, onVote, disabled = false }: VoteButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2" role="group" aria-label="Your vote">
      {VOTE_OPTIONS.map((option) => {
        const isSelected = currentVote === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onVote(option.value)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-3 text-sm leading-tight text-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d1b4a]/30 ${
              isSelected ? option.selectedClass : option.unselectedClass
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span>{VOTE_LABELS[option.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
