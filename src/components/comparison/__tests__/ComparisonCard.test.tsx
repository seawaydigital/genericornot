import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ComparisonCard } from "../ComparisonCard";

const baseProps = {
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
};

describe("ComparisonCard", () => {
  it("renders generic product name", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.getByText(/Ibuprofen 200mg/)).toBeInTheDocument();
  });

  it("renders name brand product name", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.getByText(/Advil/)).toBeInTheDocument();
  });

  it("renders both product names together in title", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.getByText(/Ibuprofen 200mg vs Advil/)).toBeInTheDocument();
  });

  it("shows savings percentage when both prices exist", () => {
    render(<ComparisonCard {...baseProps} />);
    // computeSavings(8.99, 14.99) = round((14.99 - 8.99) / 14.99 * 100) = round(40.03) = 40
    expect(screen.getByText(/40%/)).toBeInTheDocument();
  });

  it("hides savings when genericPrice is null", () => {
    render(<ComparisonCard {...baseProps} genericPrice={null} />);
    expect(screen.queryByText(/%\s*savings/i)).not.toBeInTheDocument();
    // Also confirm no savings number is shown at all in a savings context
    expect(screen.queryByText(/save/i)).not.toBeInTheDocument();
  });

  it("hides savings when nameBrandPrice is null", () => {
    render(<ComparisonCard {...baseProps} nameBrandPrice={null} />);
    expect(screen.queryByText(/save/i)).not.toBeInTheDocument();
  });

  it("links to the correct comparison URL", () => {
    render(<ComparisonCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/compare/kirkland-ibuprofen-vs-advil");
  });

  it("shows vote count", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.getByText(/47/)).toBeInTheDocument();
  });

  it("shows confidence score", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.getByText(/82/)).toBeInTheDocument();
  });

  it("shows generic store name", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.getByText(/Costco/)).toBeInTheDocument();
  });

  it("renders VerdictBadge with correct verdict", () => {
    render(<ComparisonCard {...baseProps} verdict="SAME_QUALITY" />);
    expect(screen.getByText("Same Quality")).toBeInTheDocument();
  });

  it("renders category icon and name when provided", () => {
    render(
      <ComparisonCard
        {...baseProps}
        category={{ name: "Health & Medicine", icon: "💊" }}
      />
    );
    expect(screen.getByText(/Health & Medicine/)).toBeInTheDocument();
    expect(screen.getByText(/💊/)).toBeInTheDocument();
  });

  it("does not render category section when category is not provided", () => {
    render(<ComparisonCard {...baseProps} />);
    expect(screen.queryByText(/Health & Medicine/)).not.toBeInTheDocument();
  });
});
