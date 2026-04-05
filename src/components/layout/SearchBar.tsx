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
}

export function SearchBar({ popular, className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
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
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any product..."
            className="block w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-10 pr-4 text-gray-100 placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </form>

      {popular && popular.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {popular.map((chip) => (
            <button
              key={chip.query}
              onClick={() => handleChipClick(chip.query)}
              className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-300"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
