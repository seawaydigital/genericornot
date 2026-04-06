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
      <h2
        id="categories-heading"
        className="text-2xl font-bold text-white mb-6"
      >
        Browse by Category
      </h2>

      {categories.length === 0 ? (
        <p className="text-gray-500 text-sm">No categories available yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col items-center gap-3 hover:border-gray-700 hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              <span className="text-5xl" role="img" aria-label={category.name}>
                {category.icon}
              </span>
              <span className="text-white font-medium text-sm text-center leading-snug">
                {category.name}
              </span>
              <span className="text-gray-500 text-xs">
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
