import { Skeleton, SkeletonCard, SkeletonCategoryCard } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen" role="status">
      {/* Hero */}
      <section className="bg-hero" aria-hidden="true">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="space-y-6">
            <Skeleton className="h-7 w-64 rounded-full" />
            <Skeleton className="h-16 w-full max-w-xl" />
            <Skeleton className="h-16 w-3/4 max-w-md" />
            <Skeleton className="h-5 w-full max-w-lg" />
            <Skeleton className="mt-4 h-14 w-full max-w-xl rounded-2xl" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <Skeleton className="hidden h-[26rem] rounded-[1.75rem] lg:block" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <section aria-hidden="true">
          <Skeleton className="mb-8 h-10 w-72" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
        <section aria-hidden="true">
          <Skeleton className="mb-8 h-10 w-60" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCategoryCard key={i} />
            ))}
          </div>
        </section>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
