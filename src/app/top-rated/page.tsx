import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, effectiveVerdictWhere, toCardData } from "@/lib/comparisons";
import { computeSavings } from "@/lib/verdict";
import Link from "next/link";
import { FlaskConical, Trophy, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Best Store-Brand Swaps in Canada — GenericOrNot",
  description:
    "Store-brand products Canadians can switch to without losing quality, ranked by community confidence and how much you save.",
  alternates: { canonical: "/top-rated" },
};

async function getBestSwaps() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED", ...effectiveVerdictWhere("SAME_QUALITY") },
      include: comparisonCardInclude,
      take: 200,
    });
    // Community confidence first (real votes), then the biggest savings.
    return rows
      .map(toCardData)
      .map((c) => ({ card: c, savings: computeSavings(c.genericPrice, c.nameBrandPrice, c.genericSize, c.nameBrandSize) }))
      .sort(
        (a, b) =>
          b.card.confidenceScore - a.card.confidenceScore ||
          (b.savings ?? -Infinity) - (a.savings ?? -Infinity)
      )
      .slice(0, 24)
      .map((r) => r.card);
  } catch {
    return [];
  }
}

export default async function TopRatedPage() {
  const comparisons = await getBestSwaps();

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Best swaps"
        title={
          <>
            Store brands that <em className="italic text-brand-500">hold their own</em>
          </>
        }
        description={
          <p>
            The swaps where shoppers say the store brand matches the name brand — ranked by community confidence, then by
            how much you save.
          </p>
        }
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <li className="inline-flex items-center gap-2">
            <Users aria-hidden="true" className="h-4 w-4 text-good" />
            Community verdicts come from real votes
          </li>
          <li className="inline-flex items-center gap-2">
            <FlaskConical aria-hidden="true" className="h-4 w-4 text-brand-500" />
            &ldquo;Research&rdquo; items are backed by ingredient, regulatory or manufacturer evidence and need more votes
          </li>
        </ul>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        {comparisons.length === 0 ? (
          <EmptyState
            Icon={Trophy}
            title="No winners yet"
            actions={
              <Link
                href="/submit"
                className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Add a comparison
              </Link>
            }
          >
            Swaps appear here once shoppers vote that the store brand is worth it.
          </EmptyState>
        ) : (
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison, i) => (
              <li key={comparison.id}>
                <ProductCard {...comparison} rank={i + 1} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
