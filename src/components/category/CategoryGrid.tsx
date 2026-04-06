import Link from "next/link";

interface CategoryGridCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  comparisonCount: number;
}

interface CategoryGridProps {
  categories: CategoryGridCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section aria-labelledby="categories-heading">
      <div className="accent-line">
        <h2 id="categories-heading" className="text-2xl font-semibold text-gray-900 tracking-tight">
          Browse by Category
        </h2>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-gray-400 text-sm">No categories available yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="glass glass-hover rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
                <span className="text-3xl" role="img" aria-label={category.name}>
                  {category.icon}
                </span>
              </div>
              <span className="text-gray-700 font-medium text-sm text-center leading-snug">
                {category.name}
              </span>
              <span className="text-gray-400 text-xs">
                {category.comparisonCount}{" "}
                {category.comparisonCount === 1 ? "comparison" : "comparisons"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
