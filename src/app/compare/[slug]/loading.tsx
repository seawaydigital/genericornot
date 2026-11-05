import { Skeleton } from "@/components/ui/Skeleton";

function SideSkeleton({ tinted = false }: { tinted?: boolean }) {
  return (
    <div className={`space-y-5 p-6 sm:p-8 ${tinted ? "bg-good-bg/40" : ""}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

export default function ComparisonLoading() {
  return (
    <div className="min-h-screen" role="status">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 md:px-6 md:pt-8">
        <Skeleton className="mb-5 h-4 w-56" />

        {/* Face-off */}
        <div className="overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-card">
          <div className="grid md:grid-cols-2">
            <SideSkeleton />
            <SideSkeleton tinted />
          </div>
          <div className="flex flex-col gap-4 border-y border-line bg-neutral-bg px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <Skeleton className="h-9 w-56 rounded-full" />
            <Skeleton className="h-11 w-36" />
          </div>
          <div className="px-6 py-4 sm:px-8">
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-x-10">
          <div className="card space-y-5 p-6 lg:col-start-2 lg:row-start-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[5.5rem] rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-28 rounded-2xl" />
          </div>

          <div className="card space-y-5 p-6 sm:p-8 lg:col-start-1 lg:row-start-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-48" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2 border-t border-line pt-5">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
            ))}
          </div>
        </div>
        <span className="sr-only">Loading comparison…</span>
      </div>
    </div>
  );
}
