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
    <section className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Product icon */}
        <ProductIcon icon={categoryIcon} brandName={nameBrand} size="lg" className="shrink-0 mx-auto sm:mx-0" />

        {/* Brand info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {nameBrandProductName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-gray-400 text-sm">{nameBrand}</span>
            {nameBrandPrice !== null && (
              <>
                <span className="text-gray-600">·</span>
                <span className="text-amber-400 text-sm font-medium">
                  ${Number(nameBrandPrice).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Verdict badge */}
          <div className="mt-4">
            <GenericStatusBadge verdict={verdict} savings={savings} size="md" />
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
            <span>
              <span className="text-white font-semibold">{confidenceScore}%</span> confidence
            </span>
            <span>
              <span className="text-white font-semibold">{totalVotes}</span>{" "}
              vote{totalVotes !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Freshness */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
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
