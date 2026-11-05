import { CircleCheck, CircleHelp, CircleX, FlaskConical, Hourglass, Scale, type LucideIcon } from "lucide-react";
import { VERDICT_LABELS } from "@/lib/verdict-labels";
import type { VerdictSource } from "@/lib/verdict";
import { SavingsTag } from "@/components/ui/SavingsTag";

type Verdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";

interface GenericStatusBadgeProps {
  verdict: string;
  savings: number | null;
  size?: "sm" | "md" | "lg";
  /** Where the verdict comes from; "research" adds a visible label. */
  source?: VerdictSource;
  /** Hide the savings tag (e.g. when the caller shows it elsewhere). */
  hideSavings?: boolean;
}

export const VERDICT_STYLES: Record<Verdict, { Icon: LucideIcon; chip: string; solid: string; text: string }> = {
  SAME_QUALITY: {
    Icon: CircleCheck,
    chip: "bg-good-bg text-good ring-good-line",
    solid: "bg-good text-white",
    text: "text-good",
  },
  CLOSE_ENOUGH: {
    Icon: Scale,
    chip: "bg-close-bg text-close ring-close-line",
    solid: "bg-close text-white",
    text: "text-close",
  },
  NOT_WORTH_IT: {
    Icon: CircleX,
    chip: "bg-bad-bg text-bad ring-bad-line",
    solid: "bg-bad text-white",
    text: "text-bad",
  },
  MIXED: {
    Icon: CircleHelp,
    chip: "bg-neutral-bg text-neutral ring-neutral-line",
    solid: "bg-neutral text-white",
    text: "text-neutral",
  },
  PENDING: {
    Icon: Hourglass,
    chip: "bg-neutral-bg text-neutral ring-neutral-line",
    solid: "bg-neutral text-white",
    text: "text-neutral",
  },
};

export function verdictKey(verdict: string): Verdict {
  return (verdict in VERDICT_STYLES ? verdict : "PENDING") as Verdict;
}

const sizeClasses = {
  sm: { chip: "gap-1 px-2 py-0.5 text-xs", icon: 14 },
  md: { chip: "gap-1.5 px-2.5 py-1 text-sm", icon: 16 },
  lg: { chip: "gap-2 px-3.5 py-1.5 text-base", icon: 19 },
};

/**
 * Verdict chip (icon + words, never colour alone), an optional "Research"
 * marker and the savings tag.
 */
export function GenericStatusBadge({ verdict, savings, size = "md", source, hideSavings = false }: GenericStatusBadgeProps) {
  const key = verdictKey(verdict);
  const style = VERDICT_STYLES[key];
  const s = sizeClasses[size];
  const showSavings = !hideSavings && savings !== null && savings > 0 && verdict !== "NOT_WORTH_IT";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={`inline-flex items-center rounded-full font-semibold ring-1 ring-inset ${style.chip} ${s.chip}`}>
        <style.Icon aria-hidden="true" width={s.icon} height={s.icon} strokeWidth={2.25} />
        {VERDICT_LABELS[key]}
      </span>
      {source === "research" && (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand ring-1 ring-inset ring-brand-100"
          title="Based on ingredient, regulatory or manufacturer evidence. Replaced by the community verdict once 5 people vote."
        >
          <FlaskConical aria-hidden="true" width={12} height={12} strokeWidth={2.25} />
          Research
        </span>
      )}
      {showSavings && <SavingsTag percent={savings} size={size === "lg" ? "md" : "sm"} />}
    </div>
  );
}
