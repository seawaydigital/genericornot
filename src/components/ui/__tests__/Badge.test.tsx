import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge variant="success">Same Quality</Badge>);
    expect(screen.getByText("Same Quality")).toBeInTheDocument();
  });

  it("applies success variant classes", () => {
    render(<Badge variant="success">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.className).toContain("text-emerald-700");
    expect(badge.className).toContain("bg-emerald-50");
  });

  it("applies warning variant classes", () => {
    render(<Badge variant="warning">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.className).toContain("text-amber-700");
  });

  it("applies danger variant classes", () => {
    render(<Badge variant="danger">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.className).toContain("text-red-700");
  });

  it("applies neutral variant classes", () => {
    render(<Badge variant="neutral">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.className).toContain("text-gray-500");
  });

  it("applies info variant classes", () => {
    render(<Badge variant="info">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.className).toContain("text-blue-700");
  });

  it("accepts additional className", () => {
    render(<Badge variant="success" className="extra-class">Test</Badge>);
    const badge = screen.getByText("Test");
    expect(badge.className).toContain("extra-class");
  });
});
