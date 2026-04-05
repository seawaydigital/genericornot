import { Badge } from "@/components/ui/Badge";

type Verdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING";

interface VerdictBadgeProps {
  verdict: string;
  size?: "sm" | "md";
}

const verdictConfig: Record<
  Verdict,
  { label: string; variant: "success" | "warning" | "danger" | "neutral" }
> = {
  SAME_QUALITY: { label: "Same Quality", variant: "success" },
  CLOSE_ENOUGH: { label: "Close Enough", variant: "warning" },
  NOT_WORTH_IT: { label: "Not Worth It", variant: "danger" },
  MIXED: { label: "Mixed", variant: "neutral" },
  PENDING: { label: "Pending", variant: "neutral" },
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
