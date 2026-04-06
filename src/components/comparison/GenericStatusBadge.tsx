type Verdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";

interface GenericStatusBadgeProps {
  verdict: string;
  savings: number | null;
  size?: "sm" | "md";
}

const verdictConfig: Record<
  Verdict,
  { icon: string; label: string; bgClass: string; textClass: string }
> = {
  SAME_QUALITY: {
    icon: "\u2713",
    label: "Generic Worth It",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
  },
  CLOSE_ENOUGH: {
    icon: "~",
    label: "Close Enough",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
  },
  NOT_WORTH_IT: {
    icon: "\u2717",
    label: "Stick with Brand",
    bgClass: "bg-red-50",
    textClass: "text-red-700",
  },
  MIXED: {
    icon: "?",
    label: "Mixed Reviews",
    bgClass: "bg-gray-100",
    textClass: "text-gray-500",
  },
  PENDING: {
    icon: "\u23f3",
    label: "Awaiting Votes",
    bgClass: "bg-gray-100",
    textClass: "text-gray-500",
  },
};

const fallbackConfig = verdictConfig.PENDING;

export function GenericStatusBadge({ verdict, savings, size = "md" }: GenericStatusBadgeProps) {
  const config = verdictConfig[verdict as Verdict] ?? fallbackConfig;
  const showSavings =
    savings !== null &&
    savings > 0 &&
    verdict !== "NOT_WORTH_IT";

  const paddingClass = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const iconClass = size === "sm" ? "text-xs font-bold" : "text-sm font-bold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${paddingClass} ${config.bgClass} ${config.textClass}`}
      >
        <span className={iconClass}>{config.icon}</span>
        {config.label}
      </span>
      {showSavings && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          Save {savings}%
        </span>
      )}
    </div>
  );
}
