interface FreshnessIndicatorProps {
  lastVerifiedAt: Date | string | null;
  flaggedOutdated: boolean;
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function monthsAgo(date: Date | string): number {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

export function FreshnessIndicator({ lastVerifiedAt, flaggedOutdated }: FreshnessIndicatorProps) {
  if (flaggedOutdated) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
        <span>&#9888;</span>
        <span>Users have flagged this as potentially outdated</span>
      </div>
    );
  }

  if (!lastVerifiedAt) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
        <span>&#9888;</span>
        <span>May be outdated — not yet verified</span>
      </div>
    );
  }

  const months = monthsAgo(lastVerifiedAt);

  if (months <= 6) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
        <span>&#10003;</span>
        <span>Verified {formatDate(lastVerifiedAt)}</span>
      </div>
    );
  }

  if (months <= 12) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
        <span>&#9201;</span>
        <span>Last verified {formatDate(lastVerifiedAt)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 rounded-xl px-3 py-2">
      <span>&#9888;</span>
      <span>May be outdated — last verified {formatDate(lastVerifiedAt)}</span>
    </div>
  );
}
