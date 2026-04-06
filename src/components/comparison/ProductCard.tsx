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
    <Card href={`/compare/${slug}`} className="p-5 flex flex-col gap-4">
      {/* Top row: icon + brand name */}
      <div className="flex items-start gap-3">
        <ProductIcon icon={category?.icon} brandName={nameBrand} size="sm" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
            {nameBrandProductName}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{nameBrand}</p>
          {nameBrandPrice !== null && (
            <span className="inline-block mt-1 text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              ${Number(nameBrandPrice).toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* Verdict badge */}
      <GenericStatusBadge verdict={verdict} savings={savings} size="sm" />

      {/* Divider + bottom info */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {genericBrand} ({genericStore})
        </p>
        <p className="text-xs text-gray-300">{totalVotes} votes</p>
      </div>
    </Card>
  );
}
