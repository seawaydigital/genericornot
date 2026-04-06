import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function CategoryDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-10 flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-9 w-48" />
        </div>

        {/* Filter skeleton */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-full" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
