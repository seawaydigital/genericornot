import type { Metadata } from "next";
import { searchComparisons } from "@/lib/search";
import { ProductCard } from "@/components/comparison/ProductCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { decimalToNumber } from "@/lib/comparisons";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps { searchParams: Promise<{ q?: string }>; }

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();
  return {
    title: query ? `“${query.slice(0, 60)}” — Search — GenericOrNot` : "Search — GenericOrNot",
    // Result pages are thin, near-duplicate content; keep them out of the index.
    robots: { index: false, follow: true },
  };
}

const SUGGESTIONS = ["Advil", "Tylenol", "Kraft Dinner", "Butter", "Diapers", "Paper towels", "No Name", "Kirkland"];

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q?.trim().slice(0, 100) ?? "";

  if (!query) {
    return (
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-16 sm:py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Comparisons</h1>
        <p className="text-gray-500 mb-8">Search by product, name brand or store brand.</p>
        <SearchBar
          autoFocus
          popular={SUGGESTIONS.map((s) => ({ label: s, query: s.toLowerCase() }))}
        />
      </div>
    );
  }

  let results: Awaited<ReturnType<typeof searchComparisons>>["results"] = [];
  let total = 0;
  try {
    const data = await searchComparisons(query, 1, 48);
    results = data.results;
    total = data.total;
  } catch { /* DB not available */ }

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-12 space-y-8">
      <div className="space-y-5">
        <SearchBar defaultValue={query} />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Search Results</h1>
          <p className="text-gray-500 text-sm">
            {total > 0
              ? `${total} result${total !== 1 ? "s" : ""} for "${query}"`
              : `No results found for "${query}"`}
          </p>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((comparison) => (
            <ProductCard
              key={comparison.id}
              slug={comparison.slug}
              genericProductName={comparison.genericProductName}
              genericBrand={comparison.genericBrand}
              genericStore={comparison.genericStore}
              genericPrice={decimalToNumber(comparison.genericPrice)}
              genericSize={comparison.genericSize ?? null}
              nameBrandProductName={comparison.nameBrandProductName}
              nameBrand={comparison.nameBrand}
              nameBrandPrice={decimalToNumber(comparison.nameBrandPrice)}
              nameBrandSize={comparison.nameBrandSize ?? null}
              verdict={comparison.verdict}
              editorialVerdict={comparison.editorialVerdict ?? null}
              totalVotes={comparison.totalVotes}
              category={comparison.category ? { name: comparison.category.name, icon: comparison.category.icon } : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center space-y-4">
          <p className="text-gray-700 font-medium">No comparisons found for &ldquo;{query}&rdquo;</p>
          <p className="text-gray-500 text-sm">Try these suggestions:</p>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>Use simpler or shorter keywords</li>
            <li>Search by product type (e.g., &ldquo;ibuprofen&rdquo;, &ldquo;ketchup&rdquo;)</li>
            <li>Try a brand name (e.g., &ldquo;Tylenol&rdquo;, &ldquo;No Name&rdquo;, &ldquo;Kirkland&rdquo;)</li>
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
