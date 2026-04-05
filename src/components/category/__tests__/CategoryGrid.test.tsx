import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CategoryGrid } from "../CategoryGrid";

const categories = [
  { id: "1", name: "Health & Medicine", slug: "health-medicine", icon: "💊", comparisonCount: 12 },
  { id: "2", name: "Food & Beverages", slug: "food-beverages", icon: "🍎", comparisonCount: 8 },
  { id: "3", name: "Cleaning Supplies", slug: "cleaning-supplies", icon: "🧹", comparisonCount: 5 },
];

describe("CategoryGrid", () => {
  it("renders the section heading", () => {
    render(<CategoryGrid categories={categories} />);
    expect(screen.getByRole("heading", { name: /browse by category/i })).toBeInTheDocument();
  });

  it("renders all categories", () => {
    render(<CategoryGrid categories={categories} />);
    expect(screen.getByText("Health & Medicine")).toBeInTheDocument();
    expect(screen.getByText("Food & Beverages")).toBeInTheDocument();
    expect(screen.getByText("Cleaning Supplies")).toBeInTheDocument();
  });

  it("renders emoji icons for each category", () => {
    render(<CategoryGrid categories={categories} />);
    expect(screen.getByText("💊")).toBeInTheDocument();
    expect(screen.getByText("🍎")).toBeInTheDocument();
    expect(screen.getByText("🧹")).toBeInTheDocument();
  });

  it("links to correct category URL", () => {
    render(<CategoryGrid categories={categories} />);
    const links = screen.getAllByRole("link");
    const slugs = links.map((l) => l.getAttribute("href"));
    expect(slugs).toContain("/categories/health-medicine");
    expect(slugs).toContain("/categories/food-beverages");
    expect(slugs).toContain("/categories/cleaning-supplies");
  });

  it("shows comparison count for each category", () => {
    render(<CategoryGrid categories={categories} />);
    expect(screen.getByText(/12 comparisons/)).toBeInTheDocument();
    expect(screen.getByText(/8 comparisons/)).toBeInTheDocument();
    expect(screen.getByText(/5 comparisons/)).toBeInTheDocument();
  });

  it("uses singular 'comparison' when count is 1", () => {
    render(
      <CategoryGrid
        categories={[{ id: "1", name: "Test", slug: "test", icon: "🧪", comparisonCount: 1 }]}
      />
    );
    expect(screen.getByText(/1 comparison$/)).toBeInTheDocument();
  });

  it("handles empty categories array", () => {
    render(<CategoryGrid categories={[]} />);
    expect(screen.getByText(/no categories available/i)).toBeInTheDocument();
  });
});
