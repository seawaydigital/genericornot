import { VOTE_LABELS } from "@/lib/verdict-labels";

interface VoteBreakdownProps {
  sameQuality: number;
  closeEnough: number;
  notWorthIt: number;
  totalVotes: number;
}

/** One labelled bar per option: easier to read than a single stacked bar. */
export function VoteBreakdown({ sameQuality, closeEnough, notWorthIt, totalVotes }: VoteBreakdownProps) {
  const total = totalVotes || 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const rows = [
    { key: "SAME_QUALITY", count: sameQuality, bar: "bg-good" },
    { key: "CLOSE_ENOUGH", count: closeEnough, bar: "bg-close" },
    { key: "NOT_WORTH_IT", count: notWorthIt, bar: "bg-bad" },
  ].map((r) => ({ ...r, pct: pct(r.count) }));

  return (
    <ul className="space-y-3" aria-label="Vote breakdown">
      {rows.map((r) => (
        <li key={r.key} data-testid={`breakdown-${r.key}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-ink">{VOTE_LABELS[r.key]}</span>
            <span className="tabular-nums text-muted">
              <span className="font-semibold text-ink">{r.pct}%</span>
              <span className="ml-1.5">({r.count})</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep">
            {r.pct > 0 && (
              <div className={`animate-bar h-full rounded-full ${r.bar}`} style={{ width: `${r.pct}%` }} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
