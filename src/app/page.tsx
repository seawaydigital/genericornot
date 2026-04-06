import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/layout/SearchBar";
import { TrendingSection } from "@/components/home/TrendingSection";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { RecentActivity } from "@/components/home/RecentActivity";
import { ProductCard } from "@/components/comparison/ProductCard";
import Link from "next/link";

export const revalidate = 120;

const POPULAR_SEARCHES = [
  { label: "Ibuprofen", query: "ibuprofen" },
  { label: "Acetaminophen", query: "acetaminophen" },
  { label: "Paper towels", query: "paper towels" },
  { label: "Cereal", query: "cereal" },
  { label: "Olive oil", query: "olive oil" },
  { label: "Vitamins", query: "vitamins" },
];

async function getTrendingComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { totalVotes: "desc" },
      take: 6,
      include: { category: true },
    });
    return rows.map((r) => ({
      id: r.id, slug: r.slug,
      genericProductName: r.genericProductName, genericBrand: r.genericBrand,
      genericStore: r.genericStore, genericPrice: r.genericPrice ? Number(r.genericPrice) : null,
      nameBrandProductName: r.nameBrandProductName, nameBrand: r.nameBrand,
      nameBrandPrice: r.nameBrandPrice ? Number(r.nameBrandPrice) : null,
      verdict: r.verdict, confidenceScore: r.confidenceScore, totalVotes: r.totalVotes,
      category: r.category ? { name: r.category.name, icon: r.category.icon } : undefined,
    }));
  } catch { return []; }
}

async function getCategories() {
  try {
    const rows = await prisma.category.findMany({ orderBy: { comparisonCount: "desc" } });
    return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, comparisonCount: r.comparisonCount }));
  } catch { return []; }
}

async function getRecentEvidence() {
  try {
    const rows = await prisma.evidence.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      include: { comparison: { select: { slug: true, genericProductName: true, nameBrandProductName: true } } },
    });
    return rows.map((r) => ({ id: r.id, title: r.title, type: r.type, createdAt: r.createdAt, comparison: r.comparison }));
  } catch { return []; }
}

async function getRecentlyVerified() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED", lastVerifiedAt: { not: null } },
      orderBy: { lastVerifiedAt: "desc" }, take: 4, include: { category: true },
    });
    return rows.map((r) => ({
      id: r.id, slug: r.slug,
      genericProductName: r.genericProductName, genericBrand: r.genericBrand,
      genericStore: r.genericStore, genericPrice: r.genericPrice ? Number(r.genericPrice) : null,
      nameBrandProductName: r.nameBrandProductName, nameBrand: r.nameBrand,
      nameBrandPrice: r.nameBrandPrice ? Number(r.nameBrandPrice) : null,
      verdict: r.verdict, totalVotes: r.totalVotes,
      category: r.category ? { name: r.category.name, icon: r.category.icon } : undefined,
    }));
  } catch { return []; }
}

async function getRecentComparisons() {
  try {
    return await prisma.productComparison.findMany({
      where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, slug: true, genericProductName: true, nameBrandProductName: true, createdAt: true },
    });
  } catch { return []; }
}

export default async function Home() {
  const [trending, categories, recentEvidence, recentComparisons, recentlyVerified] =
    await Promise.all([
      getTrendingComparisons(), getCategories(), getRecentEvidence(),
      getRecentComparisons(), getRecentlyVerified(),
    ]);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 md:px-6 lg:px-8">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-[#0d1b4a] sm:text-5xl md:text-6xl">
            Is the generic version{" "}
            <span className="font-[var(--font-instrument)] italic">worth it?</span>
          </h1>
          <p className="animate-fade-up delay-100 mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Community-powered comparisons of store-brand vs name-brand products.
            Find out where generics shine — and where they fall short.
          </p>

          <div className="animate-fade-up delay-200 mt-10 max-w-xl mx-auto">
            <SearchBar popular={POPULAR_SEARCHES} />
          </div>

          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <span>
              <span className="text-[#0d1b4a] font-semibold">
                {categories.length > 0
                  ? `${categories.reduce((sum, c) => sum + c.comparisonCount, 0)}+`
                  : "50+"}
              </span>{" "}
              comparisons
            </span>
            <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
            <span>
              <span className="text-[#0d1b4a] font-semibold">
                {categories.length > 0 ? categories.length : "8"}
              </span>{" "}
              categories
            </span>
            <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
            <Link
              href="/submit"
              className="text-[#0d1b4a] hover:text-[#1e3a7a] font-medium transition-colors"
            >
              Submit a comparison &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-24 space-y-24">
        <TrendingSection comparisons={trending} />

        {recentlyVerified.length > 0 && (
          <section aria-labelledby="recently-verified-heading">
            <div className="accent-line">
              <h2
                id="recently-verified-heading"
                className="text-2xl font-semibold text-gray-900 tracking-tight"
              >
                Recently Verified
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyVerified.map((comparison) => (
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
          </section>
        )}

        <CategoryGrid categories={categories} />
        <RecentActivity evidence={recentEvidence} comparisons={recentComparisons} />
      </div>
    </main>
  );
}
