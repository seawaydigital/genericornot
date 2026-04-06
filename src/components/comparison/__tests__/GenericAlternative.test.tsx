import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GenericAlternative } from "../GenericAlternative";

const baseProps = {
  genericProductName: "Ibuprofen 200mg",
  genericBrand: "Kirkland",
  genericStore: "Costco",
  genericPrice: 8.99,
  categoryIcon: "💊",
};

describe("GenericAlternative", () => {
  it("renders the 'Generic Alternative' heading", () => {
    render(<GenericAlternative {...baseProps} />);
    expect(screen.getByText("Generic Alternative")).toBeInTheDocument();
  });

  it("renders the generic product name", () => {
    render(<GenericAlternative {...baseProps} />);
    expect(screen.getByText("Ibuprofen 200mg")).toBeInTheDocument();
  });

  it("renders the generic brand", () => {
    render(<GenericAlternative {...baseProps} />);
    expect(screen.getByText("Kirkland")).toBeInTheDocument();
  });

  it("renders the store name", () => {
    render(<GenericAlternative {...baseProps} />);
    expect(screen.getByText("Costco")).toBeInTheDocument();
  });

  it("renders the price in green when available", () => {
    render(<GenericAlternative {...baseProps} />);
    const priceEl = screen.getByText("$8.99");
    expect(priceEl).toBeInTheDocument();
    expect(priceEl.className).toContain("text-emerald-400");
  });

  it("shows 'Price not available' when genericPrice is null", () => {
    render(<GenericAlternative {...baseProps} genericPrice={null} />);
    expect(screen.getByText("Price not available")).toBeInTheDocument();
  });

  it("renders the category icon", () => {
    render(<GenericAlternative {...baseProps} />);
    expect(screen.getByText("💊")).toBeInTheDocument();
  });

  it("renders without icon (uses default 📦)", () => {
    render(<GenericAlternative {...baseProps} categoryIcon={undefined} />);
    expect(screen.getByText("📦")).toBeInTheDocument();
  });
});
