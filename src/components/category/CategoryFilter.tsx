"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ArrowDownUp, LayoutGrid } from "lucide-react";
import { VERDICT_LABELS } from "@/lib/verdict-labels";
import { VERDICT_STYLES } from "@/components/comparison/GenericStatusBadge";

interface CategoryFilterProps {
  currentVerdict?: string;
  currentSort?: string;
}

// Filters use the same wording and icons as the verdict badges on the cards.
const VERDICT_FILTERS = [
  { label: "All", value: "" },
  { label: VERDICT_LABELS.SAME_QUALITY, value: "SAME_QUALITY" },
  { label: VERDICT_LABELS.CLOSE_ENOUGH, value: "CLOSE_ENOUGH" },
  { label: VERDICT_LABELS.NOT_WORTH_IT, value: "NOT_WORTH_IT" },
] as const;

const SORT_OPTIONS = [
  { label: "Most Voted", value: "totalVotes" },
  { label: "Newest", value: "newest" },
  { label: "Highest Savings", value: "savings" },
] as const;

export function CategoryFilter({ currentVerdict = "", currentSort = "totalVotes" }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by verdict">
        {VERDICT_FILTERS.map(({ label, value }) => {
          const isActive = currentVerdict === value;
          const style = value ? VERDICT_STYLES[value] : null;
          const Icon = style ? style.Icon : LayoutGrid;
          const activeClass = style ? `${style.chip} ring-2` : "bg-ink text-white ring-ink";
          return (
            <button
              key={value || "all"}
              type="button"
              onClick={() => updateParams("verdict", value)}
              aria-pressed={isActive}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ring-1 ring-inset transition-colors ${
                isActive ? activeClass : "bg-surface text-muted ring-line hover:text-ink hover:ring-line-strong"
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2.25} />
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-muted">
          <ArrowDownUp aria-hidden="true" className="h-4 w-4" />
          Sort by
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="min-h-11 cursor-pointer rounded-xl border border-line bg-surface px-3 pr-8 text-sm font-semibold text-ink shadow-sm transition-[border-color,box-shadow] hover:border-line-strong focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
