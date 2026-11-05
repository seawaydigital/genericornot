import { Card } from "@/components/ui/Card";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { GenericStatusBadge } from "./GenericStatusBadge";
import { computeSavings, getDisplayVerdict } from "@/lib/verdict";
import { formatCAD } from "@/lib/format";

interface ProductCardProps {
  slug: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  genericSize?: string | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  nameBrandSize?: string | null;
  verdict: string;
  editorialVerdict?: string | null;
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
  genericSize,
  nameBrandProductName,
  nameBrand,
  nameBrandPrice,
  nameBrandSize,
  verdict,
  editorialVerdict,
  totalVotes,
  category,
}: ProductCardProps) {
  const savings = computeSavings(genericPrice, nameBrandPrice, genericSize, nameBrandSize);
  const display = getDisplayVerdict({ verdict, totalVotes, editorialVerdict });

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
            <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
              {formatCAD(nameBrandPrice)}
              {nameBrandSize ? <span className="text-gray-400"> · {nameBrandSize}</span> : null}
            </span>
          )}
        </div>
      </div>

      {/* Verdict badge */}
      <GenericStatusBadge verdict={display.verdict} savings={savings} size="sm" source={display.source} />

      {/* Divider + bottom info */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 min-w-0 truncate" title={genericProductName}>
          vs {genericBrand} ({genericStore})
          {genericPrice !== null ? <span className="text-emerald-700 font-medium"> {formatCAD(genericPrice)}</span> : null}
        </p>
        <p className="text-xs text-gray-400 shrink-0">
          {totalVotes} vote{totalVotes === 1 ? "" : "s"}
        </p>
      </div>
    </Card>
  );
}
