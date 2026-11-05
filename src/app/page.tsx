import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/layout/SearchBar";
import { TrendingSection } from "@/components/home/TrendingSection";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { RecentActivity } from "@/components/home/RecentActivity";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, toCardData } from "@/lib/comparisons";
import { SYSTEM_USER_EMAIL } from "@/lib/catalogue/constants";
import Link from "next/link";

export const revalidate = 120;

const POPULAR_SEARCHES = [
  { label: "Advil", query: "advil" },
  { label: "Tylenol", query: "tylenol" },
  { label: "Kraft Dinner", query: "kraft dinner" },
  { label: "Butter", query: "butter" },
  { label: "Paper towels", query: "paper towels" },
  { label: "Diapers", query: "diapers" },
];

const STORE_BRANDS = [
  "No Name",
  "President's Choice",
  "Great Value",
  "Kirkland Signature",
  "Life Brand",
  "Compliments",
  "Selection",
  "Equate",
];

async function getFeaturedComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ featured: "desc" }, { totalVotes: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: comparisonCardInclude,
    });
    return rows.map(toCardData);
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const rows = await prisma.category.findMany({ orderBy: { comparisonCount: "desc" } });
    return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, comparisonCount: r.comparisonCount }));
  } catch {
    return [];
  }
}

async function getRecentEvidence() {
  try {
    const rows = await prisma.evidence.findMany({
      // Only moderated evidence on public comparisons, and only from real
      // contributors (not the editorial account that authors the catalogue).
      where: {
        status: "APPROVED",
        comparison: { status: "APPROVED" },
        user: { email: { not: SYSTEM_USER_EMAIL } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { comparison: { select: { slug: true, genericProductName: true, nameBrandProductName: true } } },
    });
    return rows.map((r) => ({ id: r.id, title: r.title, type: r.type, createdAt: r.createdAt, comparison: r.comparison }));
  } catch {
    return [];
  }
}

async function getRecentlyReviewed() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED", lastVerifiedAt: { not: null } },
      orderBy: { lastVerifiedAt: "desc" },
      take: 4,
      include: comparisonCardInclude,
    });
    return rows.map(toCardData);
  } catch {
    return [];
  }
}

async function getRecentComparisons() {
  try {
    return await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, slug: true, genericProductName: true, nameBrandProductName: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const [featured, categories, recentEvidence, recentComparisons, recentlyReviewed] = await Promise.all([
    getFeaturedComparisons(),
    getCategories(),
    getRecentEvidence(),
    getRecentComparisons(),
    getRecentlyReviewed(),
  ]);

  const totalComparisons = categories.reduce((sum, c) => sum + c.comparisonCount, 0);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28 px-4 md:px-6 lg:px-8">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.2em] text-gray-500 mb-5">
            For Canadian shoppers
          </p>
          <h1 className="animate-fade-up text-4xl font-bold tracking-tight text-[#0d1b4a] sm:text-5xl md:text-6xl">
            Is the generic version{" "}
            <span className="font-[var(--font-instrument)] italic">worth it?</span>
          </h1>
          <p className="animate-fade-up delay-100 mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Community-powered comparisons of store-brand vs name-brand products sold in Canada. See when the
            cheaper option is just as good — and when it&apos;s worth paying for the brand.
          </p>

          <div className="animate-fade-up delay-200 mt-10 max-w-xl mx-auto">
            <SearchBar popular={POPULAR_SEARCHES} />
          </div>

          <div className="animate-fade-up delay-300 mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {totalComparisons > 0 && (
              <>
                <span>
                  <span className="text-[#0d1b4a] font-semibold">{totalComparisons}</span> comparisons
                </span>
                <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
              </>
            )}
            {categories.length > 0 && (
              <>
                <span>
                  <span className="text-[#0d1b4a] font-semibold">{categories.length}</span> categories
                </span>
                <span className="h-3 w-px bg-gray-200" aria-hidden="true" />
              </>
            )}
            <Link href="/submit" className="text-[#0d1b4a] hover:text-[#1e3a7a] font-medium transition-colors">
              Submit a comparison &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-24 space-y-20">
        {/* How it works */}
        <section aria-labelledby="how-heading" className="grid gap-4 md:grid-cols-3">
          <h2 id="how-heading" className="sr-only">How GenericOrNot works</h2>
          {[
            {
              step: "1",
              title: "Look it up",
              body: "Search the name brand you usually buy and see the store-brand alternatives at Loblaws, Walmart, Costco, Shoppers, Sobeys, Metro and more.",
            },
            {
              step: "2",
              title: "Check the verdict",
              body: "Where there's hard evidence — same medicinal ingredient, a legal standard, a disclosed manufacturer — we show a research verdict. Once five people vote, the community verdict takes over.",
            },
            {
              step: "3",
              title: "Add your voice",
              body: "Tried both? Vote in one tap and share what you noticed. Every vote is a real person — we never pad the numbers.",
            },
          ].map((item) => (
            <div key={item.step} className="glass rounded-2xl p-6">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0d1b4a] text-white text-xs font-semibold">
                {item.step}
              </span>
              <h3 className="mt-3 text-gray-900 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </section>

        <TrendingSection comparisons={featured} />

        {recentlyReviewed.length > 0 && (
          <section aria-labelledby="recently-reviewed-heading">
            <div className="accent-line">
              <h2 id="recently-reviewed-heading" className="text-2xl font-semibold text-gray-900 tracking-tight">
                Recently Reviewed
              </h2>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyReviewed.map((comparison) => (
                <ProductCard key={comparison.id} {...comparison} />
              ))}
            </div>
          </section>
        )}

        <CategoryGrid categories={categories} />

        <section aria-labelledby="store-brands-heading" className="glass rounded-2xl p-6 md:p-8">
          <h2 id="store-brands-heading" className="text-lg font-semibold text-gray-900">
            Store brands we compare
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {STORE_BRANDS.map((brand) => (
              <Link
                key={brand}
                href={`/search?q=${encodeURIComponent(brand)}`}
                className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors"
              >
                {brand}
              </Link>
            ))}
          </div>
        </section>

        <RecentActivity evidence={recentEvidence} comparisons={recentComparisons} />
      </div>
    </div>
  );
}
