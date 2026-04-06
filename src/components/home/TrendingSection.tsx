import Link from "next/link";
import { ProductCard } from "@/components/comparison/ProductCard";

interface TrendingComparison {
  id: string;
  slug: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  verdict: string;
  confidenceScore: number;
  totalVotes: number;
  category?: {
    name: string;
    icon: string;
  };
}

interface TrendingSectionProps {
  comparisons: TrendingComparison[];
}

export function TrendingSection({ comparisons }: TrendingSectionProps) {
  const top6 = comparisons.slice(0, 6);

  return (
    <section aria-labelledby="trending-heading">
      <div className="flex items-center justify-between mb-6">
        <h2
          id="trending-heading"
          className="text-2xl font-bold text-white"
        >
          🔥 Popular Products
        </h2>
        <Link
          href="/categories"
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      {top6.length === 0 ? (
        <p className="text-gray-500 text-sm">No comparisons yet. Be the first to submit one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {top6.map((comparison) => (
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
    </section>
  );
}
