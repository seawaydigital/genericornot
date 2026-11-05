import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { makeComparison } from "@/test/fixtures";

// Mock search utility so no DB connection is needed
vi.mock("@/lib/search", () => ({
  searchComparisons: vi.fn().mockResolvedValue({ results: [], total: 0, page: 1, totalPages: 0 }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import SearchPage from "../page";

describe("SearchPage", () => {
  it("shows a search box and suggestions when no query is provided", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByRole("heading", { name: /search comparisons/i })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kraft Dinner" })).toBeInTheDocument();
  });

  it("shows 'no results' message when query returns empty results", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ q: "unicorn soap" }) });
    render(jsx);
    expect(screen.getByText(/no results found for/i)).toBeInTheDocument();
    expect(screen.getByText(/"unicorn soap"/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /be the first to add this comparison/i })).toHaveAttribute("href", "/submit");
  });

  it("keeps the query in the search box on the results page", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ q: "advil" }) });
    render(jsx);
    expect(screen.getByRole("searchbox")).toHaveValue("advil");
  });

  it("shows result count and cards when results are found", async () => {
    const { searchComparisons } = await import("@/lib/search");
    vi.mocked(searchComparisons).mockResolvedValueOnce({
      results: [
        {
          ...makeComparison({
            id: "1",
            slug: "life-brand-ibuprofen-vs-advil",
            genericProductName: "Life Brand Ibuprofen",
            genericBrand: "Life Brand",
            genericStore: "Shoppers Drug Mart",
            nameBrandProductName: "Advil Ibuprofen 200 mg",
            nameBrand: "Advil",
            editorialVerdict: "SAME_QUALITY",
          }),
          category: { id: "cat-1", name: "Health & Pharmacy", slug: "health-otc", icon: "💊", comparisonCount: 1 },
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    const jsx = await SearchPage({ searchParams: Promise.resolve({ q: "advil" }) });
    render(jsx);

    expect(screen.getByText(/1 result for "advil"/i)).toBeInTheDocument();
    expect(screen.getByText("Advil Ibuprofen 200 mg")).toBeInTheDocument();
    // Research verdict is labelled as such on the card.
    expect(screen.getByText("Research")).toBeInTheDocument();
  });
});
