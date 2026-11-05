import { formatMonthYear } from "@/lib/format";

interface FreshnessIndicatorProps {
  lastVerifiedAt: Date | string | null;
  flaggedOutdated: boolean;
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
        <span aria-hidden="true">&#9888;</span>
        <span>Several shoppers reported this may be outdated — we&apos;re checking</span>
      </div>
    );
  }

  if (!lastVerifiedAt) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 rounded-xl px-3 py-2">
        <span aria-hidden="true">&#9675;</span>
        <span>Not yet reviewed by an editor</span>
      </div>
    );
  }

  const months = monthsAgo(lastVerifiedAt);

  if (months <= 6) {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
        <span aria-hidden="true">&#10003;</span>
        <span>Reviewed {formatMonthYear(lastVerifiedAt)}</span>
      </div>
    );
  }

  if (months <= 12) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
        <span aria-hidden="true">&#9201;</span>
        <span>Last reviewed {formatMonthYear(lastVerifiedAt)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-amber-800 bg-amber-50 rounded-xl px-3 py-2">
      <span aria-hidden="true">&#9888;</span>
      <span>Last reviewed {formatMonthYear(lastVerifiedAt)} — details may have changed</span>
    </div>
  );
}
