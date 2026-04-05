import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductSideBySide } from "../ProductSideBySide";

const baseProps = {
  genericProductName: "Ibuprofen 200mg",
  genericBrand: "Kirkland",
  genericStore: "Costco",
  genericPrice: 8.99,
  nameBrandProductName: "Advil",
  nameBrand: "Pfizer",
  nameBrandPrice: 14.99,
};

describe("ProductSideBySide", () => {
  it("renders generic product name", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("Ibuprofen 200mg")).toBeInTheDocument();
  });

  it("renders name brand product name", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("Advil")).toBeInTheDocument();
  });

  it("shows generic price when available", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("$8.99")).toBeInTheDocument();
  });

  it("shows name brand price when available", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("$14.99")).toBeInTheDocument();
  });

  it("shows 'Price not available' when generic price is null", () => {
    render(<ProductSideBySide {...baseProps} genericPrice={null} />);
    const messages = screen.getAllByText("Price not available");
    expect(messages.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Price not available' when name brand price is null", () => {
    render(<ProductSideBySide {...baseProps} nameBrandPrice={null} />);
    const messages = screen.getAllByText("Price not available");
    expect(messages.length).toBeGreaterThanOrEqual(1);
  });

  it("shows 'Price not available' for both when both prices are null", () => {
    render(<ProductSideBySide {...baseProps} genericPrice={null} nameBrandPrice={null} />);
    const messages = screen.getAllByText("Price not available");
    expect(messages).toHaveLength(2);
  });

  it("shows store name for generic product", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("Costco")).toBeInTheDocument();
  });

  it("shows generic brand name", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("Kirkland")).toBeInTheDocument();
  });

  it("shows name brand brand name", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("Pfizer")).toBeInTheDocument();
  });

  it("renders Generic and Name Brand labels", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("Generic")).toBeInTheDocument();
    expect(screen.getByText("Name Brand")).toBeInTheDocument();
  });

  it("renders VS divider", () => {
    render(<ProductSideBySide {...baseProps} />);
    expect(screen.getByText("VS")).toBeInTheDocument();
  });
});
