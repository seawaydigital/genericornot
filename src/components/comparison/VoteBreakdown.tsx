import { VOTE_LABELS } from "@/lib/verdict-labels";

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

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const rows = [
    { key: "SAME_QUALITY", count: sameQuality, pct: pct(sameQuality), bar: "bg-emerald-500", text: "text-emerald-700" },
    { key: "CLOSE_ENOUGH", count: closeEnough, pct: pct(closeEnough), bar: "bg-amber-500", text: "text-amber-700" },
    { key: "NOT_WORTH_IT", count: notWorthIt, pct: pct(notWorthIt), bar: "bg-red-500", text: "text-red-700" },
  ];

  return (
    <div className="space-y-3">
      {/* Stacked bar */}
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-gray-200"
        role="img"
        aria-label={
          total > 0
            ? rows.map((r) => `${VOTE_LABELS[r.key]} ${r.pct}%`).join(", ")
            : "No votes yet"
        }
      >
        {total > 0
          ? rows.map((r) =>
              r.pct > 0 ? (
                <div key={r.key} className={`${r.bar} transition-all duration-300`} style={{ width: `${r.pct}%` }} />
              ) : null
            )
          : null}
      </div>

      {/* Labels */}
      <div className="grid grid-cols-3 gap-1 text-xs text-center">
        {rows.map((r) => (
          <div key={r.key}>
            <p className={`${r.text} font-semibold`}>{r.pct}%</p>
            <p className="text-gray-500 mt-0.5">{VOTE_LABELS[r.key]}</p>
            <p className="text-gray-400">({r.count})</p>
          </div>
        ))}
      </div>
    </div>
  );
}
