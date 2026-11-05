import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, toCardData } from "@/lib/comparisons";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "New Comparisons — GenericOrNot",
  description:
    "The latest store-brand vs name-brand comparisons added by Canadian shoppers on GenericOrNot.",
};

async function getNewComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: comparisonCardInclude,
    });
    return rows.map(toCardData);
  } catch {
    return [];
  }
}

export default async function NewPage() {
  const comparisons = await getNewComparisons();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Recently Added
          </h1>
          <p className="mt-2 text-gray-600 text-sm">
            The newest comparisons added by the community.
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
