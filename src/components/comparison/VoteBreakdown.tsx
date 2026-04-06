interface VoteBreakdownProps {
  sameQuality: number;
  closeEnough: number;
  notWorthIt: number;
  totalVotes: number;
}

export function VoteBreakdown({
  sameQuality,
  closeEnough,
  notWorthIt,
  totalVotes,
}: VoteBreakdownProps) {
  const total = totalVotes || 0;

  const sameQualityPct = total > 0 ? Math.round((sameQuality / total) * 100) : 0;
  const closeEnoughPct = total > 0 ? Math.round((closeEnough / total) * 100) : 0;
  const notWorthItPct = total > 0 ? Math.round((notWorthIt / total) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200">
        {total > 0 ? (
          <>
            {sameQualityPct > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${sameQualityPct}%` }}
              />
            )}
            {closeEnoughPct > 0 && (
              <div
                className="bg-amber-500 transition-all duration-300"
                style={{ width: `${closeEnoughPct}%` }}
              />
            )}
            {notWorthItPct > 0 && (
              <div
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${notWorthItPct}%` }}
              />
            )}
          </>
        ) : null}
      </div>

      {/* Labels */}
      <div className="grid grid-cols-3 gap-1 text-xs text-center">
        <div>
          <p className="text-emerald-700 font-semibold">{sameQualityPct}%</p>
          <p className="text-gray-400 mt-0.5">Same Quality</p>
        </div>
        <div>
          <p className="text-amber-700 font-semibold">{closeEnoughPct}%</p>
          <p className="text-gray-400 mt-0.5">Close Enough</p>
        </div>
        <div>
          <p className="text-red-700 font-semibold">{notWorthItPct}%</p>
          <p className="text-gray-400 mt-0.5">Not Worth It</p>
        </div>
      </div>
    </div>
  );
}
