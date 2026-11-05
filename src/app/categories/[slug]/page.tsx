import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryFilter } from "@/components/category/CategoryFilter";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, effectiveVerdictWhere, isVerdictFilter, toCardData } from "@/lib/comparisons";
import { getCategoryMetadata } from "@/lib/seo";
import { computeSavings } from "@/lib/verdict";
import Link from "next/link";

export const revalidate = 300;

const PAGE_SIZE = 12;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ verdict?: string; sort?: string; page?: string }>;
}

async function getCategory(slug: string) {
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch {
    return null;
  }
}

async function getComparisons(categoryId: string, verdict: string | undefined, sort: string, page: number) {
  try {
    const where = {
      categoryId,
      status: "APPROVED" as const,
      ...(isVerdictFilter(verdict) ? effectiveVerdictWhere(verdict) : {}),
    };

    if (sort === "savings") {
      // Savings depend on unit prices parsed from package sizes, which the
      // database can't sort by. Categories are small, so rank in memory.
      const rows = await prisma.productComparison.findMany({
        where,
        include: comparisonCardInclude,
        take: 500,
      });
      const ranked = rows
        .map(toCardData)
        .map((c) => ({ card: c, savings: computeSavings(c.genericPrice, c.nameBrandPrice, c.genericSize, c.nameBrandSize) }))
        .sort((a, b) => (b.savings ?? -Infinity) - (a.savings ?? -Infinity));
      return {
        comparisons: ranked.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => r.card),
        total: ranked.length,
      };
    }

    const orderBy =
      sort === "newest"
        ? [{ createdAt: "desc" as const }]
        : [{ totalVotes: "desc" as const }, { featured: "desc" as const }, { createdAt: "desc" as const }];

    const [rows, total] = await Promise.all([
      prisma.productComparison.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: comparisonCardInclude,
      }),
      prisma.productComparison.count({ where }),
    ]);

    return { comparisons: rows.map(toCardData), total };
  } catch {
    return { comparisons: [], total: 0 };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) {
    return { title: "Category Not Found — GenericOrNot" };
  }
  return getCategoryMetadata({
    name: category.name,
    slug: category.slug,
    comparisonCount: category.comparisonCount,
    description: `Browse ${category.comparisonCount} store-brand vs name-brand comparisons in ${category.name}. Find out which Canadian store brands are worth buying.`,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { verdict, sort = "totalVotes", page: pageStr = "1" } = await searchParams;

  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const { comparisons, total } = await getComparisons(category.id, verdict, sort, page);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (verdict) params.set("verdict", verdict);
    if (sort && sort !== "totalVotes") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `?${qs}` : `?`;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
              <span className="text-2xl" role="img" aria-label={category.name}>
                {category.icon}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{category.name}</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {category.comparisonCount} {category.comparisonCount === 1 ? "comparison" : "comparisons"}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CategoryFilter currentVerdict={verdict ?? ""} currentSort={sort} />
        </div>

        {/* Price disclaimer */}
        <p className="text-gray-500 text-xs mb-6">
          Approximate regular prices in Canadian dollars; they vary by province, store and sales. Savings compare unit
          prices when package sizes are known.
        </p>

        {/* Comparisons grid */}
        {comparisons.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No comparisons found.</p>
            {verdict && (
              <p className="text-gray-500 text-sm mt-2">
                Try removing the verdict filter or{" "}
                <Link href={`/categories/${slug}`} className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors">
                  view all comparisons
                </Link>{" "}
                in this category.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison) => (
              <ProductCard key={comparison.id} {...comparison} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="px-4 py-2 glass rounded-xl text-gray-600 text-sm hover:text-gray-900 hover:border-gray-300 transition-all duration-200"
              >
                &larr; Previous
              </Link>
            )}

            <span className="text-gray-500 text-sm px-2">
              Page {page} of {totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="px-4 py-2 glass rounded-xl text-gray-600 text-sm hover:text-gray-900 hover:border-gray-300 transition-all duration-200"
              >
                Next &rarr;
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
