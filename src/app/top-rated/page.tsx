import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, effectiveVerdictWhere, toCardData } from "@/lib/comparisons";
import { computeSavings } from "@/lib/verdict";

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
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Best Swaps</h1>
          <p className="mt-2 text-gray-600 text-sm max-w-2xl">
            Store brands that hold up against the name brand — ranked by community confidence, then by how much you
            save. Items marked &ldquo;Research&rdquo; are backed by ingredient, regulatory or manufacturer evidence
            and are waiting for more votes.
          </p>
        </div>

        {comparisons.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-500">No comparisons yet. Be the first to submit one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison) => (
              <ProductCard key={comparison.id} {...comparison} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
