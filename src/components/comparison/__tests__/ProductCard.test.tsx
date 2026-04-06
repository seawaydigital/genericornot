import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductCard } from "../ProductCard";

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
  totalVotes: 47,
};

describe("ProductCard", () => {
  it("renders the name brand product name prominently", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("Advil")).toBeInTheDocument();
  });

  it("renders the name brand manufacturer", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("Pfizer")).toBeInTheDocument();
  });

  it("renders the name brand price", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("$14.99")).toBeInTheDocument();
  });

  it("renders generic brand and store info", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText(/Kirkland/)).toBeInTheDocument();
    expect(screen.getByText(/Costco/)).toBeInTheDocument();
  });

  it("renders 'Generic Worth It' for SAME_QUALITY", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText("Generic Worth It")).toBeInTheDocument();
  });

  it("shows savings percentage for SAME_QUALITY with both prices", () => {
    render(<ProductCard {...baseProps} />);
    // computeSavings(8.99, 14.99) = 40
    expect(screen.getByText("Save 40%")).toBeInTheDocument();
  });

  it("shows vote count", () => {
    render(<ProductCard {...baseProps} />);
    expect(screen.getByText(/47 people voted/)).toBeInTheDocument();
  });

  it("links to the correct comparison URL", () => {
    render(<ProductCard {...baseProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/compare/kirkland-ibuprofen-vs-advil");
  });

  it("renders category icon when provided", () => {
    render(<ProductCard {...baseProps} category={{ name: "Health & Medicine", icon: "💊" }} />);
    expect(screen.getByText("💊")).toBeInTheDocument();
  });

  it("does not show price when nameBrandPrice is null", () => {
    render(<ProductCard {...baseProps} nameBrandPrice={null} />);
    expect(screen.queryByText("$14.99")).not.toBeInTheDocument();
  });

  it("renders Stick with Brand for NOT_WORTH_IT", () => {
    render(<ProductCard {...baseProps} verdict="NOT_WORTH_IT" />);
    expect(screen.getByText("Stick with Brand")).toBeInTheDocument();
  });
});
