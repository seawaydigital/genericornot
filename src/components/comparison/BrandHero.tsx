import { ProductIcon } from "@/components/ui/ProductIcon";
import { GenericStatusBadge } from "./GenericStatusBadge";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { FlagOutdatedButton } from "./FlagOutdatedButton";
import { getDisplayVerdict, MIN_VOTES_FOR_VERDICT } from "@/lib/verdict";
import { formatCAD } from "@/lib/format";

interface BrandHeroProps {
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  nameBrandSize?: string | null;
  verdict: string;
  editorialVerdict?: string | null;
  editorialNote?: string | null;
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
  nameBrandSize,
  verdict,
  editorialVerdict,
  editorialNote,
  confidenceScore,
  totalVotes,
  savings,
  categoryIcon,
  lastVerifiedAt,
  flaggedOutdated,
  slug,
}: BrandHeroProps) {
  const display = getDisplayVerdict({ verdict, totalVotes, editorialVerdict });
  const votesNeeded = Math.max(0, MIN_VOTES_FOR_VERDICT - totalVotes);

  return (
    <section className="glass rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Product icon */}
        <ProductIcon icon={categoryIcon} brandName={nameBrand} size="lg" className="shrink-0 mx-auto sm:mx-0" />

        {/* Brand info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1">Name brand</p>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
            {nameBrandProductName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-gray-500 text-sm">{nameBrand}</span>
            {nameBrandPrice !== null && (
              <>
                <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
                <span className="text-gray-700 text-sm font-medium">
                  {formatCAD(nameBrandPrice)}
                  {nameBrandSize ? <span className="text-gray-500 font-normal"> · {nameBrandSize}</span> : null}
                </span>
              </>
            )}
          </div>

          {/* Verdict badge */}
          <div className="mt-5">
            <GenericStatusBadge verdict={display.verdict} savings={savings} size="md" source={display.source} />
          </div>

          {/* Where the verdict comes from — never blur research and votes */}
          <div className="mt-4 text-sm leading-relaxed">
            {display.source === "community" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-900 font-semibold">{totalVotes}</span>
                  <span className="text-gray-500">vote{totalVotes !== 1 ? "s" : ""}</span>
                </div>
                <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-900 font-semibold">{confidenceScore}%</span>
                  <span className="text-gray-500">confidence</span>
                </div>
              </div>
            )}
            {display.source === "research" && (
              <div className="rounded-xl bg-[#0d1b4a]/[0.04] px-4 py-3 text-gray-600">
                <p>
                  <span className="font-semibold text-gray-900">Research verdict.</span>{" "}
                  {editorialNote ?? "Based on the evidence below."}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {totalVotes} vote{totalVotes !== 1 ? "s" : ""} so far · the community verdict takes over after{" "}
                  {votesNeeded} more.
                </p>
              </div>
            )}
            {display.source === "none" && (
              <p className="text-gray-600">
                No verdict yet — {totalVotes} vote{totalVotes !== 1 ? "s" : ""} so far. {votesNeeded} more{" "}
                {votesNeeded === 1 ? "vote" : "votes"} and the community verdict appears.
              </p>
            )}
          </div>

          {/* Freshness */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <FreshnessIndicator lastVerifiedAt={lastVerifiedAt} flaggedOutdated={flaggedOutdated} />
            <FlagOutdatedButton slug={slug} />
          </div>
        </div>
      </div>
    </section>
  );
}
