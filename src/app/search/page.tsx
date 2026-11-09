import type { Metadata } from "next";
import { searchComparisons } from "@/lib/search";
import { ProductCard } from "@/components/comparison/ProductCard";
import { SearchBar } from "@/components/layout/SearchBar";
import { decimalToNumber } from "@/lib/comparisons";
import Link from "next/link";
import { Lightbulb, Plus, SearchX } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <div className="min-h-[70vh]">
        <PageHeader
          centered
          eyebrow="Search"
          title="Search comparisons"
          description={<p>Look up a product, a name brand or a store brand — e.g. Advil, Kraft Dinner or Kirkland.</p>}
        >
          <SearchBar autoFocus size="hero" centerChips popular={SUGGESTIONS.map((s) => ({ label: s, query: s.toLowerCase() }))} />
        </PageHeader>
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
    <div className="min-h-[70vh]">
      <PageHeader
        eyebrow="Search results"
        title={
          <>
            &ldquo;<span className="text-brand-500">{query}</span>&rdquo;
          </>
        }
        description={
          <p className="tabular-nums">
            {total > 0
              ? `${total} result${total !== 1 ? "s" : ""} for "${query}"`
              : `No results found for "${query}"`}
          </p>
        }
      >
        <div className="max-w-2xl">
          <SearchBar defaultValue={query} />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        {results.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((comparison) => (
              <li key={comparison.id}>
                <ProductCard
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
                  category={
                    comparison.category
                      ? { name: comparison.category.name, icon: comparison.category.icon, slug: comparison.category.slug }
                      : undefined
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="rounded-[1.5rem] border border-dashed border-line-strong bg-surface-2 px-6 py-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface text-brand-500 shadow-card ring-1 ring-line">
                <SearchX aria-hidden="true" className="h-6 w-6" />
              </span>
              <h2 className="mt-5 font-display text-3xl leading-tight tracking-tight text-ink">
                Nothing for &ldquo;{query}&rdquo; yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">
                If you know the store-brand version, add the comparison and let other shoppers vote.
              </p>
              <Link
                href="/submit"
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                <Plus aria-hidden="true" className="h-4 w-4" />
                Be the first to add this comparison
              </Link>
            </div>
            <aside className="card p-6">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <Lightbulb aria-hidden="true" className="h-4 w-4 text-tag-deep" />
                Search tips
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
                <li>Use simpler or shorter keywords.</li>
                <li>Search by product type (e.g., &ldquo;ibuprofen&rdquo;, &ldquo;ketchup&rdquo;).</li>
                <li>Try a brand name (e.g., &ldquo;Tylenol&rdquo;, &ldquo;No Name&rdquo;, &ldquo;Kirkland&rdquo;).</li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {SUGGESTIONS.slice(0, 5).map((s) => (
                  <Link
                    key={s}
                    href={`/search?q=${encodeURIComponent(s.toLowerCase())}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:border-line-strong"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
