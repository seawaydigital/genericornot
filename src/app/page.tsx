import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/layout/SearchBar";
import { TrendingSection } from "@/components/home/TrendingSection";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { RecentActivity } from "@/components/home/RecentActivity";
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
      confidenceScore: r.confidenceScore,
      totalVotes: r.totalVotes,
      category: r.category
        ? { name: r.category.name, icon: r.category.icon }
        : undefined,
    }));
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const rows = await prisma.category.findMany({
      orderBy: { comparisonCount: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      icon: r.icon,
      comparisonCount: r.comparisonCount,
    }));
  } catch {
    return [];
  }
}

async function getRecentEvidence() {
  try {
    const rows = await prisma.evidence.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        comparison: {
          select: {
            slug: true,
            genericProductName: true,
            nameBrandProductName: true,
          },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      createdAt: r.createdAt,
      comparison: r.comparison,
    }));
  } catch {
    return [];
  }
}

async function getRecentComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        genericProductName: true,
        nameBrandProductName: true,
        createdAt: true,
      },
    });
    return rows;
  } catch {
    return [];
  }
}

export default async function Home() {
  const [trending, categories, recentEvidence, recentComparisons] =
    await Promise.all([
      getTrendingComparisons(),
      getCategories(),
      getRecentEvidence(),
      getRecentComparisons(),
    ]);

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-950 py-16 sm:py-20 px-4 md:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/40 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Is the generic version{" "}
            <span className="text-emerald-400">worth it?</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Community-powered comparisons of store-brand vs name-brand products.
            Find out where generics shine — and where they fall short.
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <SearchBar popular={POPULAR_SEARCHES} />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span>
              <span className="text-emerald-400 font-semibold">
                {categories.length > 0
                  ? `${categories.reduce((sum, c) => sum + c.comparisonCount, 0)}+`
                  : "50+"}
              </span>{" "}
              comparisons
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="text-emerald-400 font-semibold">
                {categories.length > 0 ? categories.length : "8"}
              </span>{" "}
              categories
            </span>
            <span aria-hidden="true">·</span>
            <Link
              href="/submit"
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
            >
              Submit a comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-20 space-y-16">
        <TrendingSection comparisons={trending} />
        <CategoryGrid categories={categories} />
        <RecentActivity evidence={recentEvidence} comparisons={recentComparisons} />
      </div>
    </main>
  );
}
