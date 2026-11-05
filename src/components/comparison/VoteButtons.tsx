"use client";

import { Check, Scale, ThumbsDown, ThumbsUp, type LucideIcon } from "lucide-react";
import { VOTE_LABELS } from "@/lib/verdict-labels";

export type VoteValue = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT";

interface VoteButtonsProps {
  currentVote: VoteValue | null;
  onVote: (value: VoteValue) => void;
  disabled?: boolean;
}

const VOTE_OPTIONS: {
  value: VoteValue;
  Icon: LucideIcon;
  selectedClass: string;
  unselectedClass: string;
}[] = [
  {
    value: "SAME_QUALITY",
    Icon: ThumbsUp,
    selectedClass: "bg-good-bg border-good text-good ring-4 ring-good/10",
    unselectedClass: "bg-surface border-line text-ink hover:border-good-line hover:bg-good-bg/60",
  },
  {
    value: "CLOSE_ENOUGH",
    Icon: Scale,
    selectedClass: "bg-close-bg border-close text-close ring-4 ring-close/10",
    unselectedClass: "bg-surface border-line text-ink hover:border-close-line hover:bg-close-bg/60",
  },
  {
    value: "NOT_WORTH_IT",
    Icon: ThumbsDown,
    selectedClass: "bg-bad-bg border-bad text-bad ring-4 ring-bad/10",
    unselectedClass: "bg-surface border-line text-ink hover:border-bad-line hover:bg-bad-bg/60",
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
            className={`relative flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-sm font-semibold leading-tight transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${
              isSelected ? option.selectedClass : option.unselectedClass
            }`}
          >
            {isSelected && (
              <span aria-hidden="true" className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-current">
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
            )}
            <option.Icon aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
            <span>{VOTE_LABELS[option.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
