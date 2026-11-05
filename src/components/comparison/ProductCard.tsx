import { FlaskConical } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { SavingsTag } from "@/components/ui/SavingsTag";
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
    slug?: string;
  };
  /** Position in a ranked list (Best Swaps). */
  rank?: number;
}

/**
 * "Swap card": a compact face-off of the name brand and its store-brand
 * alternative, with the verdict and the savings.
 */
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
  rank,
}: ProductCardProps) {
  const savings = computeSavings(genericPrice, nameBrandPrice, genericSize, nameBrandSize);
  const display = getDisplayVerdict({ verdict, totalVotes, editorialVerdict });
  const showSavings = savings !== null && savings > 0 && display.verdict !== "NOT_WORTH_IT";

  return (
    <Card href={`/compare/${slug}`} className="group relative flex h-full flex-col overflow-hidden p-0">
      {/* Header: rank, category, votes */}
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <span className="inline-flex min-w-0 items-center gap-2">
          {rank !== undefined && (
            <span
              className={`grid h-6 min-w-6 shrink-0 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums ${
                rank <= 3 ? "bg-tag text-brand" : "bg-ink text-white"
              }`}
            >
              <span className="sr-only">Rank </span>
              {rank}
            </span>
          )}
          {category && (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-muted">
              <CategoryIcon slug={category.slug} size={14} />
              <span className="truncate">{category.name}</span>
            </span>
          )}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-subtle">
          {display.source === "research" && (
            <>
              <span
                className="inline-flex items-center gap-1 font-semibold text-brand-500"
                title="Research verdict: based on ingredient, regulatory or manufacturer evidence. The community verdict replaces it once 5 people vote."
              >
                <FlaskConical aria-hidden="true" className="h-3.5 w-3.5" />
                Research
              </span>
              <span aria-hidden="true">·</span>
            </>
          )}
          {totalVotes} vote{totalVotes === 1 ? "" : "s"}
        </span>
      </div>

      {/* Name brand */}
      <div className="flex items-start gap-3 px-5 pt-3">
        <ProductIcon brandName={nameBrand} size="sm" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-ink line-clamp-2 group-hover:text-brand-500">
            {nameBrandProductName}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted">
            <span>{nameBrand}</span>
            {nameBrandPrice !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-medium text-ink">{formatCAD(nameBrandPrice)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* VS divider */}
      <div className="relative my-3 px-5" aria-hidden="true">
        <div className="h-px bg-line" />
        <span className="absolute left-[2.375rem] top-1/2 -translate-y-1/2 rounded-full border border-line bg-surface px-1.5 text-[10px] font-bold uppercase tracking-wider text-subtle">
          vs
        </span>
      </div>

      {/* Store brand */}
      <div className="flex items-start gap-3 px-5 pb-4">
        <ProductIcon brandName={genericBrand} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-ink line-clamp-1" title={genericProductName}>
            {genericBrand}
          </p>
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-sm text-muted">
            <span>{genericStore}</span>
            {genericPrice !== null && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-semibold text-good">{formatCAD(genericPrice)}</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Verdict + savings */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-5 py-3.5">
        <GenericStatusBadge verdict={display.verdict} savings={savings} size="sm" hideSavings />
        {showSavings && <SavingsTag percent={savings} size="sm" className="shrink-0" />}
      </div>
    </Card>
  );
}
