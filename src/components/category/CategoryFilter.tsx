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

const verdictActiveColor: Record<string, string> = {
  SAME_QUALITY: "border-emerald-300 text-emerald-700 bg-emerald-50",
  CLOSE_ENOUGH: "border-amber-300 text-amber-700 bg-amber-50",
  NOT_WORTH_IT: "border-red-300 text-red-700 bg-red-50",
};

export function CategoryFilter({ currentVerdict = "", currentSort = "totalVotes" }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) { params.set(key, value); } else { params.delete(key); }
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by verdict">
        {VERDICT_FILTERS.map(({ label, value }) => {
          const isActive = currentVerdict === value;
          const activeColorClass = value === ""
            ? "border-gray-400 text-gray-900 bg-gray-50"
            : (verdictActiveColor[value] ?? "border-gray-400 text-gray-900 bg-gray-50");
          return (
            <button
              key={value || "all"}
              onClick={() => updateParams("verdict", value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                isActive ? activeColorClass : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 hidden sm:block" />
      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-gray-400 text-sm whitespace-nowrap">Sort by:</label>
        <select
          id="sort-select" value={currentSort}
          onChange={(e) => updateParams("sort", e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0d1b4a]/20 cursor-pointer transition-all duration-200"
        >
          {SORT_OPTIONS.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
