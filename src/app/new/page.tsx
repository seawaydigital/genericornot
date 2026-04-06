import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/comparison/ProductCard";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "New Comparisons — GenericOrNot",
  description:
    "The latest generic vs name-brand comparisons added by the GenericOrNot community.",
};

async function getNewComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: { category: true },
    });
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      genericProductName: r.genericProductName,
      genericBrand: r.genericBrand,
      genericStore: r.genericStore,
      genericPrice: r.genericPrice ? Number(r.genericPrice) : null,
      nameBrandProductName: r.nameBrandProductName,
      nameBrand: r.nameBrand,
      nameBrandPrice: r.nameBrandPrice ? Number(r.nameBrandPrice) : null,
      verdict: r.verdict,
      totalVotes: r.totalVotes,
      category: r.category
        ? { name: r.category.name, icon: r.category.icon }
        : undefined,
    }));
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
          <p className="mt-2 text-gray-500 text-sm">
            The newest comparisons added by the community.
          </p>
        </div>

        {comparisons.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-gray-400">No comparisons yet. Be the first to submit one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison) => (
              <ProductCard
                key={comparison.id}
                slug={comparison.slug}
                genericProductName={comparison.genericProductName}
                genericBrand={comparison.genericBrand}
                genericStore={comparison.genericStore}
                genericPrice={comparison.genericPrice}
                nameBrandProductName={comparison.nameBrandProductName}
                nameBrand={comparison.nameBrand}
                nameBrandPrice={comparison.nameBrandPrice}
                verdict={comparison.verdict}
                totalVotes={comparison.totalVotes}
                category={comparison.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
