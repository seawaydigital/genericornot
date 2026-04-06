interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-100 animate-pulse rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-40 rounded-full" />
      <div className="border-t border-gray-100 pt-3 flex justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}
