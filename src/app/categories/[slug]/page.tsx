import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryFilter } from "@/components/category/CategoryFilter";
import { ProductCard } from "@/components/comparison/ProductCard";
import { comparisonCardInclude, effectiveVerdictWhere, isVerdictFilter, toCardData } from "@/lib/comparisons";
import { getCategoryMetadata } from "@/lib/seo";
import { computeSavings } from "@/lib/verdict";
import { categoryBlurb } from "@/lib/category-copy";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CategoryTile } from "@/components/ui/CategoryIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

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

  const blurb = categoryBlurb(category.slug);

  return (
    <div className="min-h-screen">
      <PageHeader
        icon={<CategoryTile slug={category.slug} size="lg" className="shadow-card ring-1 ring-black/5" />}
        eyebrow={
          <Link href="/categories" className="transition-colors hover:text-ink">
            Categories
          </Link>
        }
        title={category.name}
        description={
          <p>
            {blurb ? `${blurb} ` : ""}
            <span className="font-semibold tabular-nums text-ink">{category.comparisonCount}</span>{" "}
            {category.comparisonCount === 1 ? "comparison" : "comparisons"} so far.
          </p>
        }
      >
        <CategoryFilter currentVerdict={verdict ?? ""} currentSort={sort} />
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <p className="mb-6 text-sm text-muted">
          Approximate regular prices in Canadian dollars; they vary by province, store and sales. Savings compare unit
          prices when package sizes are known.
        </p>

        {comparisons.length === 0 ? (
          <EmptyState
            Icon={SearchX}
            title="No comparisons here yet"
            actions={
              <>
                {verdict && (
                  <Link
                    href={`/categories/${slug}`}
                    className="inline-flex min-h-11 items-center rounded-xl border border-line bg-surface px-5 text-sm font-semibold text-ink shadow-sm hover:border-line-strong"
                  >
                    Clear the filter
                  </Link>
                )}
                <Link
                  href="/submit"
                  className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Add a comparison
                </Link>
              </>
            }
          >
            {verdict
              ? "Nothing in this aisle has that verdict right now. Try another filter, or view everything in this category."
              : "Know a store brand that belongs here? Add it and let other shoppers weigh in."}
          </EmptyState>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((comparison) => (
              <li key={comparison.id}>
                <ProductCard {...comparison} />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} totalPages={totalPages} hrefFor={buildPageUrl} />
      </div>
    </div>
  );
}
