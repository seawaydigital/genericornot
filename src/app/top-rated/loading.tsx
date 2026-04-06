import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function TopRatedLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-4 w-80 mt-3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
