import { Card } from "@/components/ui/Card";
import { VerdictBadge } from "./VerdictBadge";
import { computeSavings } from "@/lib/verdict";

interface ComparisonCardProps {
  slug: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  verdict: string;
  confidenceScore: number;
  totalVotes: number;
  category?: {
    name: string;
    icon: string;
  };
}

export function ComparisonCard({
  slug,
  genericProductName,
  genericStore,
  genericPrice,
  nameBrandProductName,
  nameBrandPrice,
  verdict,
  confidenceScore,
  totalVotes,
  category,
}: ComparisonCardProps) {
  const savings = computeSavings(genericPrice, nameBrandPrice);

  return (
    <Card href={`/compare/${slug}`} className="p-4 flex flex-col gap-3">
      {/* Top row: verdict badge + savings */}
      <div className="flex items-center justify-between gap-2">
        <VerdictBadge verdict={verdict} />
        {savings !== null && (
          <span className="text-emerald-400 text-sm font-medium">
            Save {savings}%
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-base leading-snug">
        {genericProductName} vs {nameBrandProductName}
      </h3>

      {/* Bottom row: store • votes • confidence */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-400 text-xs">
        <span>{genericStore}</span>
        <span aria-hidden="true">•</span>
        <span>{totalVotes} votes</span>
        <span aria-hidden="true">•</span>
        <span>{confidenceScore}% confidence</span>
      </div>

      {/* Optional category */}
      {category && (
        <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
          <span>{category.icon}</span>
          <span>{category.name}</span>
        </div>
      )}
    </Card>
  );
}
