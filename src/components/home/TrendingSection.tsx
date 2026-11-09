import Link from "next/link";
import { ProductCard } from "@/components/comparison/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface TrendingComparison {
  id: string; slug: string;
  genericProductName: string; genericBrand: string; genericStore: string; genericPrice: number | null;
  genericSize?: string | null;
  nameBrandProductName: string; nameBrand: string; nameBrandPrice: number | null;
  nameBrandSize?: string | null;
  verdict: string; editorialVerdict?: string | null; confidenceScore: number; totalVotes: number;
  category?: { name: string; icon: string; slug?: string };
}

interface TrendingSectionProps {
  comparisons: TrendingComparison[];
}

export function TrendingSection({ comparisons }: TrendingSectionProps) {
  const top6 = comparisons.slice(0, 6);

  return (
    <section aria-labelledby="trending-heading">
      <SectionHeading
        id="trending-heading"
        eyebrow="Popular swaps"
        title="What Canadians are comparing"
        description="Name brands people buy every week, next to the store brand that could replace them."
        action={{ href: "/top-rated", label: "View all" }}
      />

      {top6.length === 0 ? (
        <div className="mt-8 card p-10 text-center">
          <p className="text-muted">No comparisons yet.</p>
          <Link href="/submit" className="mt-2 inline-block font-semibold text-brand-500 hover:text-brand">
            Be the first to submit one
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {top6.map((comparison) => (
            <ProductCard key={comparison.id} {...comparison} />
          ))}
        </div>
      )}
    </section>
  );
}
