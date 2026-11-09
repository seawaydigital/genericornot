"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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
  /** "hero" is the big homepage/search-page box; "default" is compact. */
  size?: "default" | "hero";
  /** Centre the suggestion chips (used when the bar is centred). */
  centerChips?: boolean;
}

export function SearchBar({
  popular,
  className = "",
  defaultValue = "",
  autoFocus = false,
  size = "default",
  centerChips = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const hero = size === "hero";

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
        <div
          className={`relative flex items-center border bg-surface transition-[border-color,box-shadow] focus-within:border-brand-500 ${
            hero
              ? "rounded-2xl border-line-strong shadow-lift focus-within:shadow-[0_0_0_4px_rgb(40_69_150/0.12),var(--shadow-lift)]"
              : "rounded-xl border-line shadow-sm focus-within:shadow-[0_0_0_3px_rgb(40_69_150/0.12)]"
          }`}
        >
          <Search
            aria-hidden="true"
            className={`pointer-events-none absolute text-subtle ${hero ? "left-4 h-5 w-5" : "left-3.5 h-4 w-4"}`}
          />
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
            placeholder="Search a product or brand"
            className={`block w-full min-w-0 bg-transparent text-ink placeholder:text-subtle focus:outline-none ${
              hero ? "h-[3.75rem] pl-12 pr-[7.5rem] text-base sm:text-lg" : "h-11 pl-10 pr-24 text-[15px]"
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 inline-flex items-center justify-center rounded-xl bg-brand font-semibold text-white transition-colors hover:bg-brand-600 ${
              hero ? "h-11 px-5 text-sm" : "h-8 px-3.5 text-sm"
            }`}
          >
            Search
          </button>
        </div>
      </form>

      {popular && popular.length > 0 && (
        <div className={`mt-4 flex flex-wrap items-center gap-2 ${centerChips ? "justify-center" : ""}`}>
          <span className="mr-1 text-sm text-subtle">Popular:</span>
          {popular.map((chip) => (
            <button
              key={chip.query}
              onClick={() => handleChipClick(chip.query)}
              type="button"
              className="min-h-9 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
