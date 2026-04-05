import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RecentActivity } from "../RecentActivity";

const baseEvidence = [
  {
    id: "ev1",
    title: "Identical manufacturer",
    type: "MANUFACTURER_INFO",
    createdAt: new Date("2026-04-04T10:00:00Z"),
    comparison: {
      slug: "kirkland-ibuprofen-vs-advil",
      genericProductName: "Ibuprofen 200mg",
      nameBrandProductName: "Advil",
    },
  },
];

const baseComparisons = [
  {
    id: "cmp1",
    slug: "store-brand-cola-vs-coca-cola",
    genericProductName: "Store Brand Cola",
    nameBrandProductName: "Coca-Cola",
    createdAt: new Date("2026-04-03T15:00:00Z"),
  },
];

describe("RecentActivity", () => {
  it("renders the section heading", () => {
    render(<RecentActivity evidence={baseEvidence} comparisons={baseComparisons} />);
    expect(screen.getByRole("heading", { name: /recent contributions/i })).toBeInTheDocument();
  });

  it("renders evidence items with description", () => {
    render(<RecentActivity evidence={baseEvidence} comparisons={[]} />);
    expect(screen.getByText(/Identical manufacturer/)).toBeInTheDocument();
    expect(screen.getByText(/Ibuprofen 200mg vs Advil/)).toBeInTheDocument();
  });

  it("renders comparison items with description", () => {
    render(<RecentActivity evidence={[]} comparisons={baseComparisons} />);
    expect(screen.getByText(/Store Brand Cola vs Coca-Cola/)).toBeInTheDocument();
  });

  it("renders both evidence and comparisons", () => {
    render(<RecentActivity evidence={baseEvidence} comparisons={baseComparisons} />);
    expect(screen.getByText(/Evidence/)).toBeInTheDocument();
    expect(screen.getByText(/Comparison/)).toBeInTheDocument();
  });

  it("links evidence to the comparison page", () => {
    render(<RecentActivity evidence={baseEvidence} comparisons={[]} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/compare/kirkland-ibuprofen-vs-advil");
  });

  it("links comparison to the comparison page", () => {
    render(<RecentActivity evidence={[]} comparisons={baseComparisons} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/compare/store-brand-cola-vs-coca-cola");
  });

  it("shows empty state when no activity", () => {
    render(<RecentActivity evidence={[]} comparisons={[]} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });
});
