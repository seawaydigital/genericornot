type Verdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";

interface GenericStatusBadgeProps {
  verdict: string;
  savings: number | null;
  size?: "sm" | "md";
}

const verdictConfig: Record<
  Verdict,
  { icon: string; label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  SAME_QUALITY: {
    icon: "✓",
    label: "Generic Worth It",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/20",
  },
  CLOSE_ENOUGH: {
    icon: "~",
    label: "Close Enough",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-400",
    borderClass: "border-amber-500/20",
  },
  NOT_WORTH_IT: {
    icon: "✗",
    label: "Stick with Brand",
    bgClass: "bg-red-500/10",
    textClass: "text-red-400",
    borderClass: "border-red-500/20",
  },
  MIXED: {
    icon: "?",
    label: "Mixed Reviews",
    bgClass: "bg-gray-500/10",
    textClass: "text-gray-400",
    borderClass: "border-gray-500/20",
  },
  PENDING: {
    icon: "⏳",
    label: "Awaiting Votes",
    bgClass: "bg-gray-500/10",
    textClass: "text-gray-400",
    borderClass: "border-gray-500/20",
  },
};

const fallbackConfig = verdictConfig.PENDING;

export function GenericStatusBadge({ verdict, savings, size = "md" }: GenericStatusBadgeProps) {
  const config = verdictConfig[verdict as Verdict] ?? fallbackConfig;
  const showSavings =
    savings !== null &&
    savings > 0 &&
    verdict !== "NOT_WORTH_IT";

  const paddingClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const iconClass = size === "sm" ? "text-xs font-bold" : "text-sm font-bold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${paddingClass} ${config.bgClass} ${config.textClass} ${config.borderClass}`}
      >
        <span className={iconClass}>{config.icon}</span>
        {config.label}
      </span>
      {showSavings && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          Save {savings}%
        </span>
      )}
    </div>
  );
}
