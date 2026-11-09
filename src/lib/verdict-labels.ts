// Shared, dependency-free verdict wording so every badge, card and vote
// button uses the same language.

export const VERDICT_LABELS: Record<string, string> = {
  SAME_QUALITY: "Generic Worth It",
  CLOSE_ENOUGH: "Close Enough",
  NOT_WORTH_IT: "Stick with Brand",
  MIXED: "Mixed Reviews",
  PENDING: "Awaiting Votes",
};

/** Wording for individual votes, answering "Is the store brand worth it?" */
export const VOTE_LABELS: Record<string, string> = {
  SAME_QUALITY: "Same Quality",
  CLOSE_ENOUGH: "Close Enough",
  NOT_WORTH_IT: "Not Worth It",
};

export function verdictLabel(verdict: string): string {
  return VERDICT_LABELS[verdict] ?? VERDICT_LABELS.PENDING;
}
