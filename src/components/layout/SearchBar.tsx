"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface PopularChip {
  label: string;
  query: string;
}

interface SearchBarProps {
  popular?: PopularChip[];
  className?: string;
  /** Pre-fill the box, e.g. with the current query on the results page. */
  defaultValue?: string;
  autoFocus?: boolean;
}

export function SearchBar({ popular, className = "", defaultValue = "", autoFocus = false }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  }

  function handleChipClick(chipQuery: string) {
    router.push(`/search?q=${encodeURIComponent(chipQuery)}`);
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <label htmlFor="site-search" className="sr-only">
            Search products and brands
          </label>
          <input
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={autoFocus}
            maxLength={100}
            placeholder="Search a product or brand — e.g. Advil, Kraft Dinner, butter"
            className="block w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-[#0d1b4a]/30 focus:outline-none focus:ring-2 focus:ring-[#0d1b4a]/10 transition-all duration-200"
          />
        </div>
      </form>

      {popular && popular.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {popular.map((chip) => (
            <button
              key={chip.query}
              onClick={() => handleChipClick(chip.query)}
              type="button"
              className="rounded-full bg-gray-100 px-3.5 py-1 text-sm text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-gray-800"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
