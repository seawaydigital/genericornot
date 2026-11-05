import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

const pill =
  "inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-line-strong hover:bg-surface-2";

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-12 flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={pill} rel="prev">
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </Link>
      ) : (
        <span aria-hidden="true" className={`${pill} pointer-events-none opacity-40`}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </span>
      )}

      <span className="px-2 text-sm tabular-nums text-muted" aria-current="page">
        Page <span className="font-semibold text-ink">{page}</span> of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={pill} rel="next">
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${pill} pointer-events-none opacity-40`}>
          Next
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
