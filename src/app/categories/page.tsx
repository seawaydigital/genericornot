import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { CategoryGrid } from "@/components/category/CategoryGrid";

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
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Browse Categories
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            {totalComparisons} comparisons across {categories.length} categories
          </p>
        </div>

        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
