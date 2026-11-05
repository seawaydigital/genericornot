import { render, screen } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { ProductIcon, brandInitials } from "../ProductIcon";

describe("ProductIcon", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders a generic package icon when there is no brand", () => {
    const { container } = render(<ProductIcon />);
    expect(screen.getByRole("img", { name: "Product" })).toBeInTheDocument();
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("never renders the legacy emoji icon", () => {
    render(<ProductIcon icon="💊" brandName="Advil" />);
    expect(screen.queryByText("💊")).not.toBeInTheDocument();
  });

  it("falls back to a monogram labelled with the brand name", () => {
    vi.stubEnv("NEXT_PUBLIC_LOGO_DEV_TOKEN", "");
    render(<ProductIcon brandName="President's Choice" />);
    const mark = screen.getByRole("img", { name: "President's Choice logo" });
    expect(mark).toHaveTextContent("PC");
  });

  it("gives the same brand the same tint every time", () => {
    vi.stubEnv("NEXT_PUBLIC_LOGO_DEV_TOKEN", "");
    const a = render(<ProductIcon brandName="No Name" />).container.firstChild as HTMLElement;
    const b = render(<ProductIcon brandName="No Name" />).container.firstChild as HTMLElement;
    expect(a.className).toBe(b.className);
  });

  it.each([
    ["xs", "h-8", "w-8"],
    ["sm", "h-11", "w-11"],
    ["md", "h-16", "w-16"],
    ["lg", "h-20", "w-20"],
  ] as const)("applies %s size classes", (size, h, w) => {
    const { container } = render(<ProductIcon size={size} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain(h);
    expect(el.className).toContain(w);
  });

  it("defaults to the md size", () => {
    const { container } = render(<ProductIcon />);
    expect((container.firstChild as HTMLElement).className).toContain("h-16");
  });

  it("applies custom className", () => {
    const { container } = render(<ProductIcon className="custom-class" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("custom-class");
  });
});

describe("brandInitials", () => {
  it.each([
    ["Advil", "A"],
    ["No Name", "NN"],
    ["Life Brand", "LB"],
    ["Kirkland Signature", "KS"],
    ["President's Choice", "PC"],
    ["", "?"],
  ])("%s → %s", (brand, initials) => {
    expect(brandInitials(brand)).toBe(initials);
  });
});
