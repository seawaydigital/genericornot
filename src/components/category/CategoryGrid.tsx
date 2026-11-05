import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CategoryTile } from "@/components/ui/CategoryIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface CategoryGridCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  comparisonCount: number;
}

interface CategoryGridProps {
  categories: CategoryGridCategory[];
  /** Hide the section heading (e.g. on the categories index page). */
  hideHeading?: boolean;
}

export function CategoryGrid({ categories, hideHeading = false }: CategoryGridProps) {
  return (
    <section aria-labelledby="categories-heading">
      {hideHeading ? (
        <h2 id="categories-heading" className="sr-only">
          Browse by Category
        </h2>
      ) : (
        <SectionHeading
          id="categories-heading"
          eyebrow="Categories"
          title="Browse by Category"
          action={{ href: "/categories", label: "All categories" }}
        />
      )}

      {categories.length === 0 ? (
        <p className="mt-8 text-muted">No categories available yet.</p>
      ) : (
        <div className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 ${hideHeading ? "" : "mt-8"}`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group card card-interactive relative flex flex-col gap-4 p-5"
            >
              <CategoryTile slug={category.slug} />
              <div>
                <p className="font-semibold leading-snug text-ink">{category.name}</p>
                <p className="mt-0.5 text-sm tabular-nums text-muted">
                  {category.comparisonCount} {category.comparisonCount === 1 ? "comparison" : "comparisons"}
                </p>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                className="absolute right-4 top-4 h-4 w-4 text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
