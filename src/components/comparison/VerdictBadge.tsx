import { Badge } from "@/components/ui/Badge";
import { VERDICT_LABELS } from "@/lib/verdict-labels";

type Verdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";

interface VerdictBadgeProps {
  verdict: string;
  size?: "sm" | "md";
}

// Same wording as the badges on product cards.
const verdictConfig: Record<
  Verdict,
  { label: string; variant: "success" | "warning" | "danger" | "neutral" }
> = {
  SAME_QUALITY: { label: VERDICT_LABELS.SAME_QUALITY, variant: "success" },
  CLOSE_ENOUGH: { label: VERDICT_LABELS.CLOSE_ENOUGH, variant: "warning" },
  NOT_WORTH_IT: { label: VERDICT_LABELS.NOT_WORTH_IT, variant: "danger" },
  MIXED: { label: VERDICT_LABELS.MIXED, variant: "neutral" },
  PENDING: { label: VERDICT_LABELS.PENDING, variant: "neutral" },
};

const fallbackConfig = { label: "Unknown", variant: "neutral" as const };

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
  const { label, variant } = verdictConfig[verdict as Verdict] ?? fallbackConfig;
  const sizeClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <Badge variant={variant} className={sizeClass}>
      {label}
    </Badge>
  );
}
