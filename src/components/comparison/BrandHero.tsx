import { ProductIcon } from "@/components/ui/ProductIcon";
import { GenericStatusBadge } from "./GenericStatusBadge";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { FlagOutdatedButton } from "./FlagOutdatedButton";

interface BrandHeroProps {
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  verdict: string;
  confidenceScore: number;
  totalVotes: number;
  savings: number | null;
  categoryIcon?: string;
  lastVerifiedAt: string | null;
  flaggedOutdated: boolean;
  slug: string;
}

export function BrandHero({
  nameBrandProductName,
  nameBrand,
  nameBrandPrice,
  verdict,
  confidenceScore,
  totalVotes,
  savings,
  categoryIcon,
  lastVerifiedAt,
  flaggedOutdated,
  slug,
}: BrandHeroProps) {
  return (
    <section className="glass rounded-2xl p-8 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Product icon */}
        <ProductIcon icon={categoryIcon} brandName={nameBrand} size="lg" className="shrink-0 mx-auto sm:mx-0" />

        {/* Brand info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
            {nameBrandProductName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-gray-500 text-sm">{nameBrand}</span>
            {nameBrandPrice !== null && (
              <>
                <span className="h-3 w-px bg-gray-200" />
                <span className="text-gray-700 text-sm font-medium">
                  ${Number(nameBrandPrice).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Verdict badge */}
          <div className="mt-5">
            <GenericStatusBadge verdict={verdict} savings={savings} size="md" />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-900 font-semibold">{confidenceScore}%</span>
              <span className="text-gray-400">confidence</span>
            </div>
            <span className="h-3 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-gray-900 font-semibold">{totalVotes}</span>
              <span className="text-gray-400">vote{totalVotes !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Freshness */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <FreshnessIndicator
              lastVerifiedAt={lastVerifiedAt}
              flaggedOutdated={flaggedOutdated}
            />
            <FlagOutdatedButton slug={slug} />
          </div>
        </div>
      </div>
    </section>
  );
}
