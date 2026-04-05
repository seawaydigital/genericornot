interface VoteCounts {
  sameQuality: number;
  closeEnough: number;
  notWorthIt: number;
}

interface VerdictResult {
  verdict: "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";
  confidenceScore: number;
  totalVotes: number;
}

export function computeVerdict(votes: VoteCounts): VerdictResult {
  const totalVotes = votes.sameQuality + votes.closeEnough + votes.notWorthIt;

  if (totalVotes < 5) {
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

export function computeSavings(
  genericPrice: number | null,
  nameBrandPrice: number | null
): number | null {
  if (genericPrice == null || nameBrandPrice == null || nameBrandPrice === 0) {
    return null;
  }
  return Math.round(((nameBrandPrice - genericPrice) / nameBrandPrice) * 100);
}
