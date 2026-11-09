import { parseSize } from "./units";

export type VoteValue = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT";
export type VerdictValue = VoteValue | "MIXED" | "PENDING";

/** Votes needed before a community verdict replaces "pending". */
export const MIN_VOTES_FOR_VERDICT = 5;

/** Below this many votes a community verdict is shown as an "early result". */
export const EARLY_RESULT_VOTES = 20;

export interface VoteCounts {
  sameQuality: number;
  closeEnough: number;
  notWorthIt: number;
}

interface VerdictResult {
  verdict: VerdictValue;
  confidenceScore: number;
  totalVotes: number;
}

export function computeVerdict(votes: VoteCounts): VerdictResult {
  const totalVotes = votes.sameQuality + votes.closeEnough + votes.notWorthIt;

  if (totalVotes < MIN_VOTES_FOR_VERDICT) {
    return { verdict: "PENDING", confidenceScore: 0, totalVotes };
  }

  const percentages = {
    sameQuality: (votes.sameQuality / totalVotes) * 100,
    closeEnough: (votes.closeEnough / totalVotes) * 100,
    notWorthIt: (votes.notWorthIt / totalVotes) * 100,
  };

  const topPercent = Math.max(percentages.sameQuality, percentages.closeEnough, percentages.notWorthIt);

  let verdict: VerdictResult["verdict"];
  if (topPercent <= 40) {
    verdict = "MIXED";
  } else if (percentages.sameQuality === topPercent) {
    verdict = "SAME_QUALITY";
  } else if (percentages.closeEnough === topPercent) {
    verdict = "CLOSE_ENOUGH";
  } else {
    verdict = "NOT_WORTH_IT";
  }

  const confidenceScore = Math.round(Math.min(100, totalVotes * 2) * (topPercent / 100));

  return { verdict, confidenceScore, totalVotes };
}

/** Share of votes (0–100, rounded) for the most-chosen option; null with no votes. */
export function topVoteShare(votes: VoteCounts): number | null {
  const total = votes.sameQuality + votes.closeEnough + votes.notWorthIt;
  if (total === 0) return null;
  return Math.round((Math.max(votes.sameQuality, votes.closeEnough, votes.notWorthIt) / total) * 100);
}

/**
 * True while a community verdict rests on only a handful of votes. Shoppers
 * see "Early result" instead of a raw confidence score, which reads as
 * "unsure" ("10% confidence") even when every voter agrees.
 */
export function isEarlyResult(totalVotes: number): boolean {
  return totalVotes < EARLY_RESULT_VOTES;
}

/** Tally vote rows (or groupBy results) into counts. */
export function tallyVotes(votes: Array<{ value: string; count?: number }>): VoteCounts {
  const counts: VoteCounts = { sameQuality: 0, closeEnough: 0, notWorthIt: 0 };
  for (const vote of votes) {
    const n = vote.count ?? 1;
    if (vote.value === "SAME_QUALITY") counts.sameQuality += n;
    else if (vote.value === "CLOSE_ENOUGH") counts.closeEnough += n;
    else if (vote.value === "NOT_WORTH_IT") counts.notWorthIt += n;
  }
  return counts;
}

export type VerdictSource = "community" | "research" | "none";

export interface DisplayVerdict {
  verdict: VerdictValue;
  source: VerdictSource;
}

/**
 * The verdict a shopper should see.
 *
 * Community votes win once there are enough of them. Until then we show the
 * editors' research verdict — always labelled as research, never presented
 * as votes — or "pending" when there is no objective evidence to go on.
 */
export function getDisplayVerdict(input: {
  verdict: string;
  totalVotes: number;
  editorialVerdict?: string | null;
}): DisplayVerdict {
  if (input.verdict !== "PENDING" && input.totalVotes >= MIN_VOTES_FOR_VERDICT) {
    return { verdict: input.verdict as VerdictValue, source: "community" };
  }
  if (input.editorialVerdict) {
    return { verdict: input.editorialVerdict as VoteValue, source: "research" };
  }
  return { verdict: "PENDING", source: "none" };
}

/**
 * Percentage saved by choosing the generic.
 *
 * When both package sizes parse to the same kind of unit we compare unit
 * prices, so a bulk pack isn't mistaken for "more expensive". Otherwise we
 * compare package prices. Negative means the generic costs more.
 */
export function computeSavings(
  genericPrice: number | null,
  nameBrandPrice: number | null,
  genericSize?: string | null,
  nameBrandSize?: string | null
): number | null {
  if (genericPrice == null || nameBrandPrice == null || nameBrandPrice <= 0 || genericPrice < 0) {
    return null;
  }

  const g = parseSize(genericSize);
  const b = parseSize(nameBrandSize);
  if (g && b && g.unit === b.unit && g.quantity > 0 && b.quantity > 0) {
    const genericUnit = genericPrice / g.quantity;
    const brandUnit = nameBrandPrice / b.quantity;
    return Math.round(((brandUnit - genericUnit) / brandUnit) * 100);
  }

  return Math.round(((nameBrandPrice - genericPrice) / nameBrandPrice) * 100);
}

/** True when savings were computed per unit rather than per package. */
export function savingsAreUnitBased(genericSize?: string | null, nameBrandSize?: string | null): boolean {
  const g = parseSize(genericSize);
  const b = parseSize(nameBrandSize);
  return !!(g && b && g.unit === b.unit);
}
