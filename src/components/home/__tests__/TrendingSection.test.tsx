import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TrendingSection } from "../TrendingSection";

const makeComparison = (overrides: Partial<typeof baseComparison> = {}) => ({
  ...baseComparison,
  ...overrides,
});

const baseComparison = {
  id: "1",
  slug: "kirkland-ibuprofen-vs-advil",
  genericProductName: "Ibuprofen 200mg",
  genericBrand: "Kirkland",
  genericStore: "Costco",
  genericPrice: 8.99,
  nameBrandProductName: "Advil",
  nameBrand: "Pfizer",
  nameBrandPrice: 14.99,
  verdict: "SAME_QUALITY",
  confidenceScore: 82,
  totalVotes: 47,
  category: { name: "Health & Medicine", icon: "💊" },
};

const comparisons = [
  makeComparison({ id: "1", slug: "product-1-vs-brand-1", genericProductName: "Generic A", nameBrandProductName: "Brand A" }),
  makeComparison({ id: "2", slug: "product-2-vs-brand-2", genericProductName: "Generic B", nameBrandProductName: "Brand B" }),
  makeComparison({ id: "3", slug: "product-3-vs-brand-3", genericProductName: "Generic C", nameBrandProductName: "Brand C" }),
];

describe("TrendingSection", () => {
  it("renders the section heading as Popular Products", () => {
    render(<TrendingSection comparisons={comparisons} />);
    expect(screen.getByRole("heading", { name: /popular products/i })).toBeInTheDocument();
  });

  it("renders the View all link", () => {
    render(<TrendingSection comparisons={comparisons} />);
    const link = screen.getByRole("link", { name: /view all/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("renders ProductCards for each comparison with brand name", () => {
    render(<TrendingSection comparisons={comparisons} />);
    expect(screen.getByText("Brand A")).toBeInTheDocument();
    expect(screen.getByText("Brand B")).toBeInTheDocument();
    expect(screen.getByText("Brand C")).toBeInTheDocument();
  });

  it("shows at most 6 comparisons", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      makeComparison({
        id: String(i),
        slug: `product-${i}`,
        genericProductName: `Generic ${i}`,
        nameBrandProductName: `Brand ${i}`,
      })
    );
    render(<TrendingSection comparisons={many} />);
    // There are at most 6 comparison cards; each card links to /compare/{slug}
    const links = screen.getAllByRole("link").filter((l) =>
      l.getAttribute("href")?.startsWith("/compare/")
    );
    expect(links.length).toBe(6);
  });

  it("handles empty comparisons array", () => {
    render(<TrendingSection comparisons={[]} />);
    expect(screen.getByText(/no comparisons yet/i)).toBeInTheDocument();
  });
});
