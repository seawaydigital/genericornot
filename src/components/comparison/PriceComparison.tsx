import { computeSavings, savingsAreUnitBased } from "@/lib/verdict";
import { formatCAD, formatCADPrecise } from "@/lib/format";
import { formatUnitPrice } from "@/lib/units";

interface PriceComparisonProps {
  genericBrand: string;
  genericPrice: number | null;
  genericSize?: string | null;
  nameBrand: string;
  nameBrandPrice: number | null;
  nameBrandSize?: string | null;
}

/**
 * Side-by-side price check. Prices are typical regular shelf prices; they
 * vary by province, banner and sale, so we say so right next to them.
 */
export function PriceComparison({
  genericBrand,
  genericPrice,
  genericSize,
  nameBrand,
  nameBrandPrice,
  nameBrandSize,
}: PriceComparisonProps) {
  if (genericPrice == null && nameBrandPrice == null) return null;

  const savings = computeSavings(genericPrice, nameBrandPrice, genericSize, nameBrandSize);
  const unitBased = savingsAreUnitBased(genericSize, nameBrandSize);
  const rows = [
    { label: genericBrand, kind: "Store brand", price: genericPrice, size: genericSize, accent: "text-emerald-700" },
    { label: nameBrand, kind: "Name brand", price: nameBrandPrice, size: nameBrandSize, accent: "text-gray-900" },
  ];

  let summary: string | null = null;
  if (savings !== null) {
    const basis = unitBased ? " per unit" : "";
    if (savings >= 3) summary = `You save about ${savings}%${basis} by choosing ${genericBrand}.`;
    else if (savings <= -3) summary = `${genericBrand} costs about ${Math.abs(savings)}% more${basis} at these prices.`;
    else summary = `About the same price${basis}.`;
    if (!unitBased && genericSize && nameBrandSize && genericSize !== nameBrandSize) {
      summary += " Package sizes differ, so check the unit price on the shelf tag.";
    }
  }

  return (
    <section className="glass rounded-2xl p-6" aria-labelledby="price-check-heading">
      <h2 id="price-check-heading" className="text-gray-900 font-semibold text-base">
        Price check
      </h2>
      <div className="mt-4 divide-y divide-gray-100">
        {rows.map((row) => {
          const unit = formatUnitPrice(row.price, row.size, formatCADPrecise);
          return (
            <div key={row.kind} className="flex items-baseline justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{row.label}</p>
                <p className="text-xs text-gray-500">
                  {row.kind}
                  {row.size ? ` · ${row.size}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${row.accent}`}>
                  {row.price != null ? formatCAD(row.price) : "—"}
                </p>
                {unit && <p className="text-xs text-gray-500">{unit}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {summary && <p className="mt-3 text-sm text-gray-700">{summary}</p>}
      <p className="mt-2 text-xs text-gray-500">
        Approximate regular prices in Canadian dollars. Prices vary by province, store and sales.
      </p>
    </section>
  );
}
