import { Users, Vote } from "lucide-react";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { SavingsTag } from "@/components/ui/SavingsTag";
import { GenericStatusBadge, VERDICT_STYLES, verdictKey } from "./GenericStatusBadge";
import { FreshnessIndicator } from "./FreshnessIndicator";
import { FlagOutdatedButton } from "./FlagOutdatedButton";
import { computeSavings, getDisplayVerdict, MIN_VOTES_FOR_VERDICT, savingsAreUnitBased } from "@/lib/verdict";
import { describeSavings } from "@/lib/price-summary";
import { formatCAD, formatCADPrecise } from "@/lib/format";
import { formatUnitPrice } from "@/lib/units";

interface ComparisonHeroProps {
  slug: string;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  nameBrandSize?: string | null;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  genericSize?: string | null;
  verdict: string;
  editorialVerdict?: string | null;
  editorialNote?: string | null;
  confidenceScore: number;
  totalVotes: number;
  lastVerifiedAt: string | null;
  flaggedOutdated: boolean;
}

// Tinted band behind the verdict, keyed by the verdict shoppers see.
const BAND: Record<string, string> = {
  SAME_QUALITY: "bg-good-bg border-good-line",
  CLOSE_ENOUGH: "bg-close-bg border-close-line",
  NOT_WORTH_IT: "bg-bad-bg border-bad-line",
  MIXED: "bg-neutral-bg border-neutral-line",
  PENDING: "bg-neutral-bg border-neutral-line",
};

/**
 * The face-off: name brand and store brand side by side, with the verdict
 * and the savings — the answer to "is it worth it?" in one block.
 */
export function ComparisonHero(props: ComparisonHeroProps) {
  const {
    slug,
    nameBrandProductName,
    nameBrand,
    nameBrandPrice,
    nameBrandSize,
    genericProductName,
    genericBrand,
    genericStore,
    genericPrice,
    genericSize,
    verdict,
    editorialVerdict,
    editorialNote,
    confidenceScore,
    totalVotes,
    lastVerifiedAt,
    flaggedOutdated,
  } = props;

  const display = getDisplayVerdict({ verdict, totalVotes, editorialVerdict });
  const key = verdictKey(display.verdict);
  const style = VERDICT_STYLES[key];
  const votesNeeded = Math.max(0, MIN_VOTES_FOR_VERDICT - totalVotes);
  const savings = computeSavings(genericPrice, nameBrandPrice, genericSize, nameBrandSize);
  const unitBased = savingsAreUnitBased(genericSize, nameBrandSize);
  const showSavings = savings !== null && savings > 0 && display.verdict !== "NOT_WORTH_IT";
  const summary = describeSavings({ genericBrand, genericPrice, genericSize, nameBrandPrice, nameBrandSize });

  return (
    <section aria-label="Comparison summary" className="overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-card">
      <div className="relative grid md:grid-cols-2">
        {/* Name brand */}
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Name brand</p>
            <ProductIcon brandName={nameBrand} size="sm" />
          </div>
          <div>
            <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-ink text-balance sm:text-3xl">
              {nameBrandProductName}
            </h1>
            <p className="mt-1.5 text-base text-muted">{nameBrand}</p>
          </div>
          <PriceBlock price={nameBrandPrice} size={nameBrandSize} />
        </div>

        {/* VS medallion */}
        <div aria-hidden="true" className="relative z-10 -my-6 flex items-center justify-center md:absolute md:inset-y-0 md:left-1/2 md:my-0 md:-translate-x-1/2">
          <div className="absolute inset-x-6 top-1/2 h-px bg-line md:inset-x-auto md:inset-y-8 md:left-1/2 md:top-auto md:h-auto md:w-px" />
          <span className="relative grid h-12 w-12 place-items-center rounded-full border border-line bg-surface font-display text-xl italic text-ink shadow-card">
            vs
          </span>
        </div>
        <span className="sr-only">versus</span>

        {/* Store brand */}
        <div className="flex flex-col gap-5 bg-good-bg/40 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-good">Store brand alternative</p>
            <ProductIcon brandName={genericBrand} size="sm" />
          </div>
          <div>
            <p className="text-xl font-semibold leading-snug text-ink text-balance sm:text-2xl">{genericProductName}</p>
            <p className="mt-1.5 text-base text-muted">
              {genericBrand} <span aria-hidden="true">·</span> <span className="sr-only">at</span> {genericStore}
            </p>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <PriceBlock price={genericPrice} size={genericSize} accent />
            {showSavings && <SavingsTag percent={savings} size="lg" suffix={unitBased ? "per unit" : undefined} />}
          </div>
        </div>
      </div>

      {/* Verdict band */}
      <div className={`border-y px-6 py-5 sm:px-8 ${BAND[key]}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
            <GenericStatusBadge verdict={display.verdict} savings={null} size="lg" source={display.source} hideSavings />
            <div className="text-[15px] leading-relaxed text-ink">
              {display.source === "community" && (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Users aria-hidden="true" className={`h-4 w-4 ${style.text}`} />
                    <span className="font-semibold tabular-nums">{totalVotes}</span>
                    <span className="text-muted">vote{totalVotes !== 1 ? "s" : ""}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-semibold tabular-nums">{confidenceScore}%</span>
                    <span className="text-muted">confidence</span>
                  </span>
                </p>
              )}
              {display.source === "research" && (
                <div>
                  <p>
                    <span className="font-semibold">Research verdict.</span>{" "}
                    <span className="text-muted">{editorialNote ?? "Based on the evidence below."}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {totalVotes} vote{totalVotes !== 1 ? "s" : ""} so far · the community verdict takes over after{" "}
                    {votesNeeded} more.
                  </p>
                </div>
              )}
              {display.source === "none" && (
                <p className="text-muted">
                  No verdict yet — {totalVotes} vote{totalVotes !== 1 ? "s" : ""} so far. {votesNeeded} more{" "}
                  {votesNeeded === 1 ? "vote" : "votes"} and the community verdict appears.
                </p>
              )}
            </div>
          </div>
          <a
            href="#vote"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 lg:self-auto"
          >
            <Vote aria-hidden="true" className="h-4 w-4" />
            Cast your vote
          </a>
        </div>
      </div>

      {/* Price note + freshness */}
      <div className="flex flex-col gap-3 px-6 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm text-muted">
          {summary ? <span className="font-medium text-ink">{summary} </span> : null}
          Approximate regular prices in Canadian dollars; they vary by province, store and sales.
        </p>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <FreshnessIndicator lastVerifiedAt={lastVerifiedAt} flaggedOutdated={flaggedOutdated} />
          <FlagOutdatedButton slug={slug} />
        </div>
      </div>
    </section>
  );
}

function PriceBlock({ price, size, accent = false }: { price: number | null; size?: string | null; accent?: boolean }) {
  if (price === null) {
    return <p className="text-sm text-muted">Price not available</p>;
  }
  const unit = formatUnitPrice(price, size, formatCADPrecise);
  return (
    <div>
      <p className={`font-display text-5xl leading-none tabular-nums tracking-tight ${accent ? "text-good" : "text-ink"}`}>
        {formatCAD(price)}
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm text-muted">
        {size && <span>{size}</span>}
        {unit && (
          <span className="rounded-md border border-line bg-surface px-1.5 py-0.5 text-xs font-medium tabular-nums text-ink">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
