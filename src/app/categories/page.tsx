import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { PageHeader } from "@/components/ui/PageHeader";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Browse Categories — GenericOrNot",
  description:
    "Browse all product categories on GenericOrNot. Find generic vs name-brand comparisons for medicine, food, cleaning supplies, and more.",
};

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

export default async function CategoriesPage() {
  const categories = await getCategories();
  const totalComparisons = categories.reduce((sum, c) => sum + c.comparisonCount, 0);

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Categories"
        title="Browse by category"
        description={
          <p>
            <span className="font-semibold tabular-nums text-ink">{totalComparisons}</span> store-brand vs name-brand
            comparisons across <span className="font-semibold tabular-nums text-ink">{categories.length}</span> aisles —
            from pantry staples to pharmacy shelves.
          </p>
        }
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <CategoryGrid categories={categories} hideHeading />
      </div>
    </div>
  );
}
