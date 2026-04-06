import { Skeleton, SkeletonCategoryCard } from "@/components/ui/Skeleton";

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-64 mt-3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCategoryCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
