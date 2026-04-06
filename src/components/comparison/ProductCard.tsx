import { Card } from "@/components/ui/Card";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { GenericStatusBadge } from "./GenericStatusBadge";
import { computeSavings } from "@/lib/verdict";

interface ProductCardProps {
  slug: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  verdict: string;
  totalVotes: number;
  category?: {
    name: string;
    icon: string;
  };
}

export function ProductCard({
  slug,
  genericProductName,
  genericBrand,
  genericStore,
  genericPrice,
  nameBrandProductName,
  nameBrand,
  nameBrandPrice,
  verdict,
  totalVotes,
  category,
}: ProductCardProps) {
  const savings = computeSavings(genericPrice, nameBrandPrice);

  return (
    <Card href={`/compare/${slug}`} className="p-4 flex flex-col gap-3">
      {/* Top row: icon + brand name */}
      <div className="flex items-start gap-3">
        <ProductIcon icon={category?.icon} size="sm" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2">
            {nameBrandProductName}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">{nameBrand}</p>
          {nameBrandPrice !== null && (
            <p className="text-sm text-gray-500">${Number(nameBrandPrice).toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Middle: GenericStatusBadge */}
      <GenericStatusBadge verdict={verdict} savings={savings} size="sm" />

      {/* Bottom: generic info */}
      <p className="text-xs text-gray-500">
        Generic: {genericBrand} ({genericStore})
        {genericProductName !== nameBrandProductName ? ` — ${genericProductName}` : ""}
      </p>

      {/* Footer: votes */}
      <p className="text-xs text-gray-600">{totalVotes} people voted</p>
    </Card>
  );
}
