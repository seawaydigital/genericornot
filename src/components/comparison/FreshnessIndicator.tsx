import { BadgeCheck, Clock, TriangleAlert, type LucideIcon } from "lucide-react";
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

function Pill({ Icon, className, children }: { Icon: LucideIcon; className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{children}</span>
    </span>
  );
}

export function FreshnessIndicator({ lastVerifiedAt, flaggedOutdated }: FreshnessIndicatorProps) {
  if (flaggedOutdated) {
    return (
      <Pill Icon={TriangleAlert} className="bg-bad-bg text-bad ring-bad-line">
        Several shoppers reported this may be outdated — we&apos;re checking
      </Pill>
    );
  }

  if (!lastVerifiedAt) {
    return (
      <Pill Icon={Clock} className="bg-neutral-bg text-neutral ring-neutral-line">
        Not yet reviewed by an editor
      </Pill>
    );
  }

  const months = monthsAgo(lastVerifiedAt);

  if (months <= 6) {
    return (
      <Pill Icon={BadgeCheck} className="bg-good-bg text-good ring-good-line">
        Reviewed {formatMonthYear(lastVerifiedAt)}
      </Pill>
    );
  }

  if (months <= 12) {
    return (
      <Pill Icon={Clock} className="bg-close-bg text-close ring-close-line">
        Last reviewed {formatMonthYear(lastVerifiedAt)}
      </Pill>
    );
  }

  return (
    <Pill Icon={TriangleAlert} className="bg-close-bg text-close ring-close-line">
      Last reviewed {formatMonthYear(lastVerifiedAt)} — details may have changed
    </Pill>
  );
}
