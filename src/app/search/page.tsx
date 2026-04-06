import type { Metadata } from "next";
import { searchComparisons } from "@/lib/search";
import { ProductCard } from "@/components/comparison/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search Results — GenericOrNot" };

interface PageProps { searchParams: Promise<{ q?: string }>; }

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-20 text-center">
        <div className="text-5xl mb-4 opacity-20">&#128269;</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Comparisons</h1>
        <p className="text-gray-500">Enter a search term to find comparisons</p>
      </div>
    );
  }

  let results: Awaited<ReturnType<typeof searchComparisons>>["results"] = [];
  let total = 0;
  try {
    const data = await searchComparisons(query);
    results = data.results;
    total = data.total;
  } catch { /* DB not available */ }

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Search Results</h1>
        <p className="text-gray-500 text-sm">
          {total > 0
            ? `${total} result${total !== 1 ? "s" : ""} for "${query}"`
            : `No results found for "${query}"`}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {results.map((comparison) => (
            <ProductCard
              key={comparison.id} slug={comparison.slug}
              genericProductName={comparison.genericProductName} genericBrand={comparison.genericBrand}
              genericStore={comparison.genericStore}
              genericPrice={comparison.genericPrice ? Number(comparison.genericPrice) : null}
              nameBrandProductName={comparison.nameBrandProductName} nameBrand={comparison.nameBrand}
              nameBrandPrice={comparison.nameBrandPrice ? Number(comparison.nameBrandPrice) : null}
              verdict={comparison.verdict} totalVotes={comparison.totalVotes}
              category={comparison.category ? { name: comparison.category.name, icon: comparison.category.icon } : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center space-y-4">
          <p className="text-gray-700 font-medium">No comparisons found for &ldquo;{query}&rdquo;</p>
          <p className="text-gray-400 text-sm">Try these suggestions:</p>
          <ul className="text-gray-500 text-sm space-y-1">
            <li>Use simpler or shorter keywords</li>
            <li>Search by product type (e.g., &ldquo;ibuprofen&rdquo;, &ldquo;ketchup&rdquo;)</li>
            <li>Try brand names (e.g., &ldquo;Tylenol&rdquo;, &ldquo;Heinz&rdquo;)</li>
          </ul>
          <div className="pt-2">
            <Link href="/submit" className="inline-flex items-center gap-1 text-[#0d1b4a] hover:text-[#1e3a7a] text-sm font-medium transition-colors">
              Be the first to add this comparison &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
