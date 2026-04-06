import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryFilter } from "@/components/category/CategoryFilter";
import { ProductCard } from "@/components/comparison/ProductCard";
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

async function getComparisons(
  categoryId: string,
  verdict: string | undefined,
  sort: string,
  page: number
) {
  try {
    // Build orderBy
    type OrderBy =
      | { totalVotes: "desc" }
      | { createdAt: "desc" }
      | { genericPrice: "asc" };

    let orderBy: OrderBy;
    if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    } else if (sort === "savings") {
      orderBy = { genericPrice: "asc" };
    } else {
      orderBy = { totalVotes: "desc" };
    }

    const where = {
      categoryId,
      status: "APPROVED" as const,
      ...(verdict ? { verdict: verdict as "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT" | "MIXED" | "PENDING" } : {}),
    };

    const [comparisons, total] = await Promise.all([
      prisma.productComparison.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: { category: true },
      }),
      prisma.productComparison.count({ where }),
    ]);

    return {
      comparisons: comparisons.map((r) => ({
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
      })),
      total,
    };
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
  return {
    title: `${category.name} — GenericOrNot`,
    description: `Browse ${category.comparisonCount} generic vs name-brand comparisons in ${category.name}. Find out which store-brand products are worth buying.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { verdict, sort = "totalVotes", page: pageStr = "1" } = await searchParams;

  const category = await getCategory(slug);
  if (!category) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageStr, 10) || 1);
  const { comparisons, total } = await getComparisons(
    category.id,
    verdict,
    sort,
    page
  );

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
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl" role="img" aria-label={category.name}>
              {category.icon}
            </span>
            <h1 className="text-3xl font-extrabold text-white">{category.name}</h1>
          </div>
          <p className="text-gray-400 text-sm">
            {category.comparisonCount}{" "}
            {category.comparisonCount === 1 ? "comparison" : "comparisons"}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <CategoryFilter currentVerdict={verdict ?? ""} currentSort={sort} />
        </div>

        {/* Price disclaimer */}
        <p className="text-gray-600 text-xs mb-6">
          Prices are community-reported and may vary by location.
        </p>

        {/* Comparisons grid */}
        {comparisons.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No comparisons found.</p>
            {verdict && (
              <p className="text-gray-600 text-sm mt-2">
                Try removing the verdict filter or{" "}
                <Link
                  href={`/categories/${slug}`}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  view all comparisons
                </Link>{" "}
                in this category.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((comparison) => (
              <ProductCard key={comparison.id} slug={comparison.slug} genericProductName={comparison.genericProductName} genericBrand={comparison.genericBrand} genericStore={comparison.genericStore} genericPrice={comparison.genericPrice} nameBrandProductName={comparison.nameBrandProductName} nameBrand={comparison.nameBrand} nameBrandPrice={comparison.nameBrandPrice} verdict={comparison.verdict} totalVotes={comparison.totalVotes} category={comparison.category} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-10 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg hover:border-gray-500 transition-colors"
              >
                ← Previous
              </Link>
            )}

            <span className="text-gray-400 text-sm px-2">
              Page {page} of {totalPages}
            </span>

            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg hover:border-gray-500 transition-colors"
              >
                Next →
              </Link>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
