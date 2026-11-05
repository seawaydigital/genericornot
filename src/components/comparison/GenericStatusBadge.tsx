import { VERDICT_LABELS } from "@/lib/verdict-labels";
import type { VerdictSource } from "@/lib/verdict";

type Verdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";

interface GenericStatusBadgeProps {
  verdict: string;
  savings: number | null;
  size?: "sm" | "md";
  /** Where the verdict comes from; "research" adds a visible label. */
  source?: VerdictSource;
}

const verdictConfig: Record<Verdict, { icon: string; bgClass: string; textClass: string }> = {
  SAME_QUALITY: { icon: "✓", bgClass: "bg-emerald-50", textClass: "text-emerald-700" },
  CLOSE_ENOUGH: { icon: "~", bgClass: "bg-amber-50", textClass: "text-amber-700" },
  NOT_WORTH_IT: { icon: "✗", bgClass: "bg-red-50", textClass: "text-red-700" },
  MIXED: { icon: "?", bgClass: "bg-gray-100", textClass: "text-gray-600" },
  PENDING: { icon: "⏳", bgClass: "bg-gray-100", textClass: "text-gray-600" },
};

export function GenericStatusBadge({ verdict, savings, size = "md", source }: GenericStatusBadgeProps) {
  const key = (verdict in verdictConfig ? verdict : "PENDING") as Verdict;
  const config = verdictConfig[key];
  const label = VERDICT_LABELS[key];
  const showSavings = savings !== null && savings > 0 && verdict !== "NOT_WORTH_IT";

  const paddingClass = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm";
  const iconClass = size === "sm" ? "text-xs font-bold" : "text-sm font-bold";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${paddingClass} ${config.bgClass} ${config.textClass}`}
      >
        <span className={iconClass} aria-hidden="true">{config.icon}</span>
        {label}
      </span>
      {source === "research" && (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0d1b4a]/5 text-[#0d1b4a]"
          title="Based on ingredient, regulatory or manufacturer evidence. Replaced by the community verdict once 5 people vote."
        >
          Research
        </span>
      )}
      {showSavings && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
          Save {savings}%
        </span>
      )}
    </div>
  );
}
