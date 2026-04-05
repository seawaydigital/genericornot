import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock search utility so no DB connection is needed
vi.mock("@/lib/search", () => ({
  searchComparisons: vi.fn().mockResolvedValue({ results: [], total: 0, page: 1, totalPages: 0 }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import SearchPage from "../page";

describe("SearchPage", () => {
  it("shows prompt when no query is provided", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/enter a search term to find comparisons/i)).toBeInTheDocument();
  });

  it("shows search heading when no query", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByRole("heading", { name: /search comparisons/i })).toBeInTheDocument();
  });

  it("shows 'no results' message when query returns empty results", async () => {
    const jsx = await SearchPage({ searchParams: Promise.resolve({ q: "unicorn soap" }) });
    render(jsx);
    expect(screen.getByText(/no results found for/i)).toBeInTheDocument();
    expect(screen.getByText(/"unicorn soap"/i)).toBeInTheDocument();
  });

  it("shows result count when results are found", async () => {
    const { searchComparisons } = await import("@/lib/search");
    vi.mocked(searchComparisons).mockResolvedValueOnce({
      results: [
        {
          id: "1",
          slug: "ibuprofen-vs-advil",
          genericProductName: "Ibuprofen",
          genericBrand: "CVS",
          genericStore: "CVS",
          genericPrice: null,
          genericImageUrl: null,
          nameBrandProductName: "Advil",
          nameBrand: "Advil",
          nameBrandPrice: null,
          nameBrandImageUrl: null,
          verdict: "SAME_QUALITY",
          confidenceScore: 80,
          totalVotes: 20,
          categoryId: "cat-1",
          status: "APPROVED",
          rejectionReason: null,
          submittedById: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: { id: "cat-1", name: "Medicine", slug: "medicine", icon: "💊", comparisonCount: 5 },
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    });

    const jsx = await SearchPage({ searchParams: Promise.resolve({ q: "ibuprofen" }) });
    render(jsx);
    expect(screen.getByText(/1 result for/i)).toBeInTheDocument();
  });
});
