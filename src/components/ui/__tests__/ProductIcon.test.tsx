import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ProductIcon } from "../ProductIcon";

describe("ProductIcon", () => {
  it("renders the default icon when no icon provided", () => {
    render(<ProductIcon />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders the provided icon", () => {
    render(<ProductIcon icon="💊" />);
    expect(screen.getByText("💊")).toBeInTheDocument();
  });

  it("falls back to 📦 when icon is undefined", () => {
    render(<ProductIcon />);
    expect(screen.getByText("📦")).toBeInTheDocument();
  });

  it("applies sm size classes", () => {
    const { container } = render(<ProductIcon icon="💊" size="sm" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("w-12");
    expect(div.className).toContain("h-12");
  });

  it("applies md size classes by default", () => {
    const { container } = render(<ProductIcon icon="💊" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("w-20");
    expect(div.className).toContain("h-20");
  });

  it("applies lg size classes", () => {
    const { container } = render(<ProductIcon icon="💊" size="lg" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("w-[120px]");
    expect(div.className).toContain("h-[120px]");
  });

  it("applies custom className", () => {
    const { container } = render(<ProductIcon icon="💊" className="custom-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("custom-class");
  });

  it("has rounded-xl bg styling", () => {
    const { container } = render(<ProductIcon icon="💊" />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("rounded-xl");
    expect(div.className).toContain("bg-gray-800/50");
  });
});
