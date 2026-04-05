import type { Metadata } from "next";
import { searchComparisons } from "@/lib/search";
import { ComparisonCard } from "@/components/comparison/ComparisonCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search Results — GenericOrNot",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-white mb-2">Search Comparisons</h1>
        <p className="text-gray-400">Enter a search term to find comparisons</p>
      </div>
    );
  }

  let results: Awaited<ReturnType<typeof searchComparisons>>["results"] = [];
  let total = 0;

  try {
    const data = await searchComparisons(query);
    results = data.results;
    total = data.total;
  } catch {
    // DB not available in test/build — return empty
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Search Results
        </h1>
        <p className="text-gray-400 text-sm">
          {total > 0
            ? `${total} result${total !== 1 ? "s" : ""} for "${query}"`
            : `No results found for "${query}"`}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((comparison) => (
            <ComparisonCard
              key={comparison.id}
              slug={comparison.slug}
              genericProductName={comparison.genericProductName}
              genericBrand={comparison.genericBrand}
              genericStore={comparison.genericStore}
              genericPrice={
                comparison.genericPrice ? Number(comparison.genericPrice) : null
              }
              nameBrandProductName={comparison.nameBrandProductName}
              nameBrand={comparison.nameBrand}
              nameBrandPrice={
                comparison.nameBrandPrice
                  ? Number(comparison.nameBrandPrice)
                  : null
              }
              verdict={comparison.verdict}
              confidenceScore={comparison.confidenceScore}
              totalVotes={comparison.totalVotes}
              category={
                comparison.category
                  ? {
                      name: comparison.category.name,
                      icon: comparison.category.icon,
                    }
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center space-y-4">
          <p className="text-gray-300 font-medium">
            No comparisons found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-gray-500 text-sm">Try these suggestions:</p>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>Use simpler or shorter keywords</li>
            <li>Search by product type (e.g., &ldquo;ibuprofen&rdquo;, &ldquo;ketchup&rdquo;)</li>
            <li>Try brand names (e.g., &ldquo;Tylenol&rdquo;, &ldquo;Heinz&rdquo;)</li>
          </ul>
          <div className="pt-2">
            <Link
              href="/submit"
              className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              Be the first to add this comparison →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
