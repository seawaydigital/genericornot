import { Skeleton, SkeletonCard, SkeletonCategoryCard } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <section className="py-24 sm:py-32 px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <Skeleton className="h-12 w-96 mx-auto max-w-full" />
          <Skeleton className="h-5 w-80 mx-auto max-w-full" />
          <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-2xl mt-10" />
          <div className="flex justify-center gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 pb-24 space-y-24">
        {/* Trending section */}
        <section>
          <Skeleton className="h-7 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <Skeleton className="h-7 w-52 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCategoryCard key={i} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
