"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface CategoryFilterProps {
  currentVerdict?: string;
  currentSort?: string;
}

const VERDICT_FILTERS = [
  { label: "All", value: "" },
  { label: "Same Quality", value: "SAME_QUALITY" },
  { label: "Close Enough", value: "CLOSE_ENOUGH" },
  { label: "Not Worth It", value: "NOT_WORTH_IT" },
] as const;

const SORT_OPTIONS = [
  { label: "Most Voted", value: "totalVotes" },
  { label: "Newest", value: "newest" },
  { label: "Highest Savings", value: "savings" },
] as const;

const verdictBorderColor: Record<string, string> = {
  SAME_QUALITY: "border-emerald-500 text-emerald-400",
  CLOSE_ENOUGH: "border-amber-500 text-amber-400",
  NOT_WORTH_IT: "border-red-500 text-red-400",
};

export function CategoryFilter({
  currentVerdict = "",
  currentSort = "totalVotes",
}: CategoryFilterProps) {
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
      // Reset to page 1 on filter/sort change
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Verdict filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by verdict">
        {VERDICT_FILTERS.map(({ label, value }) => {
          const isActive = currentVerdict === value;
          const activeColorClass =
            value === ""
              ? "border-gray-400 text-white"
              : (verdictBorderColor[value] ?? "border-gray-400 text-white");

          return (
            <button
              key={value || "all"}
              onClick={() => updateParams("verdict", value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                isActive
                  ? `bg-gray-800 ${activeColorClass}`
                  : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1 hidden sm:block" />

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-select"
          className="text-gray-400 text-sm whitespace-nowrap"
        >
          Sort by:
        </label>
        <select
          id="sort-select"
          value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
