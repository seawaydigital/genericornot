import { SkeletonCategoryCard, SkeletonPageHeader } from "@/components/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen" role="status">
      <SkeletonPageHeader />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCategoryCard key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
