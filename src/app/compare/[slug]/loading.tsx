import { Skeleton } from "@/components/ui/Skeleton";

export default function ComparisonLoading() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 md:px-6 py-12 space-y-8">
        {/* Brand hero skeleton */}
        <div className="glass rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Skeleton className="w-[120px] h-[120px] rounded-2xl shrink-0 mx-auto sm:mx-0" />
            <div className="flex-1 space-y-4 w-full">
              <Skeleton className="h-7 w-64" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-7 w-40 rounded-full" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-9 w-44 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Generic alternative skeleton */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <Skeleton className="h-3 w-36" />
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>

        {/* Vote breakdown skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-3 text-center">
              <Skeleton className="h-5 w-8 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto mt-1" />
            </div>
          ))}
        </div>

        {/* Quick facts skeleton */}
        <div className="glass rounded-2xl p-6">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Voting skeleton */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="flex-1 h-16 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
