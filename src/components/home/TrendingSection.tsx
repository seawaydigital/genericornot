import Link from "next/link";
import { ProductCard } from "@/components/comparison/ProductCard";

interface TrendingComparison {
  id: string; slug: string;
  genericProductName: string; genericBrand: string; genericStore: string; genericPrice: number | null;
  genericSize?: string | null;
  nameBrandProductName: string; nameBrand: string; nameBrandPrice: number | null;
  nameBrandSize?: string | null;
  verdict: string; editorialVerdict?: string | null; confidenceScore: number; totalVotes: number;
  category?: { name: string; icon: string };
}

interface TrendingSectionProps {
  comparisons: TrendingComparison[];
}

export function TrendingSection({ comparisons }: TrendingSectionProps) {
  const top6 = comparisons.slice(0, 6);

  return (
    <section aria-labelledby="trending-heading">
      <div className="flex items-end justify-between mb-8">
        <div className="accent-line">
          <h2 id="trending-heading" className="text-2xl font-semibold text-gray-900 tracking-tight">
            Popular Swaps
          </h2>
        </div>
        <Link
          href="/top-rated"
          className="text-sm text-gray-500 font-medium transition-colors hover:text-gray-800 group"
        >
          View all <span className="inline-block transition-transform group-hover:translate-x-0.5">&rarr;</span>
        </Link>
      </div>

      {top6.length === 0 ? (
        <p className="text-gray-500 text-sm">No comparisons yet. Be the first to submit one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {top6.map((comparison) => (
            <ProductCard key={comparison.id} {...comparison} />
          ))}
        </div>
      )}
    </section>
  );
}
