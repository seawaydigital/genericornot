import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { SavingsTag } from "@/components/ui/SavingsTag";
import { GenericStatusBadge } from "@/components/comparison/GenericStatusBadge";
import { computeSavings, getDisplayVerdict } from "@/lib/verdict";
import { formatCAD } from "@/lib/format";
import type { ComparisonCardData } from "@/lib/comparisons";

/**
 * The homepage's centrepiece: a real comparison from the catalogue shown as
 * a face-off, so the value of the site is visible before anyone scrolls.
 */
export function HeroFaceOff({ comparison }: { comparison: ComparisonCardData }) {
  const savings = computeSavings(
    comparison.genericPrice,
    comparison.nameBrandPrice,
    comparison.genericSize,
    comparison.nameBrandSize
  );
  const display = getDisplayVerdict(comparison);
  const showSavings = savings !== null && savings > 0 && display.verdict !== "NOT_WORTH_IT";

  const sides = [
    {
      label: "Name brand",
      brand: comparison.nameBrand,
      product: comparison.nameBrandProductName,
      store: null as string | null,
      meta: comparison.nameBrandSize,
      price: comparison.nameBrandPrice,
      highlight: false,
    },
    {
      label: "Store brand",
      brand: comparison.genericBrand,
      product: comparison.genericProductName,
      store: comparison.genericStore,
      meta: comparison.genericSize,
      price: comparison.genericPrice,
      highlight: true,
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Stacked-card depth */}
      <div aria-hidden="true" className="absolute -bottom-4 -right-3 left-8 top-8 rotate-[3deg] rounded-[1.75rem] bg-tag" />
      <div aria-hidden="true" className="absolute -bottom-2 -left-2 right-6 top-4 -rotate-[2deg] rounded-[1.75rem] border border-line bg-surface/80" />

      <Link
        href={`/compare/${comparison.slug}`}
        className="group relative block overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-pop transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-3.5">
          <p className="eyebrow">Featured swap</p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-500">
            See the evidence
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        <div className="relative grid grid-cols-2">
          {sides.map((side) => (
            <div
              key={side.label}
              className={`flex flex-col gap-3 p-5 sm:p-6 ${side.highlight ? "bg-good-bg/50" : ""}`}
            >
              <p className={`text-[11px] font-bold uppercase tracking-[0.14em] ${side.highlight ? "text-good" : "text-subtle"}`}>
                {side.label}
              </p>
              <ProductIcon brandName={side.brand} size="md" />
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-tight text-ink">{side.brand}</p>
                <p className="mt-1 text-sm leading-snug text-muted line-clamp-2">{side.product}</p>
                {side.store && <p className="mt-1 text-xs font-medium text-subtle">at {side.store}</p>}
              </div>
              <div className="mt-auto">
                {side.price !== null && (
                  <p className={`font-display text-4xl leading-none tabular-nums ${side.highlight ? "text-good" : "text-ink"}`}>
                    {formatCAD(side.price)}
                  </p>
                )}
                {side.meta && <p className="mt-1.5 text-xs text-subtle">{side.meta}</p>}
              </div>
            </div>
          ))}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface font-display text-lg italic text-ink shadow-card"
          >
            vs
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-2 px-6 py-4">
          <GenericStatusBadge verdict={display.verdict} savings={savings} source={display.source} hideSavings />
          {showSavings && <SavingsTag percent={savings} size="md" />}
        </div>
      </Link>
    </div>
  );
}
