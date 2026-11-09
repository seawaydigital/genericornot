interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-paper-deep ${className}`} aria-hidden="true" />;
}

/** Placeholder shaped like a swap card (ProductCard). */
export function SkeletonCard() {
  return (
    <div className="card flex flex-col overflow-hidden" aria-hidden="true">
      <div className="flex items-center justify-between px-5 pt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-14" />
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}

/** Placeholder shaped like a category tile. */
export function SkeletonCategoryCard() {
  return (
    <div className="card flex items-center gap-4 p-5" aria-hidden="true">
      <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/** Placeholder for the PageHeader band at the top of inner pages. */
export function SkeletonPageHeader({ withIcon = false, withFilters = false }: { withIcon?: boolean; withFilters?: boolean }) {
  return (
    <div className="border-b border-line bg-hero" aria-hidden="true">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 md:pb-12 md:pt-14 lg:px-8">
        <div className="flex items-start gap-5">
          {withIcon && <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />}
          <div className="w-full max-w-2xl space-y-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-5 w-full max-w-lg" />
          </div>
        </div>
        {withFilters && (
          <div className="mt-8 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-11 w-32 rounded-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** A page header plus a grid of swap-card placeholders. */
export function SkeletonCardGridPage({ count = 9, withIcon = false, withFilters = false }: { count?: number; withIcon?: boolean; withFilters?: boolean }) {
  return (
    <div className="min-h-screen" role="status">
      <SkeletonPageHeader withIcon={withIcon} withFilters={withFilters} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
