import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies primary variant classes by default", () => {
    render(<Button>Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-gradient-to-b");
  });

  it("applies secondary variant classes", () => {
    render(<Button variant="secondary">Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("glass");
  });

  it("applies ghost variant classes", () => {
    render(<Button variant="ghost">Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("hover:bg-gray-100");
  });

  it("applies sm size classes", () => {
    render(<Button size="sm">Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-3");
  });

  it("applies lg size classes", () => {
    render(<Button size="lg">Test</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-6");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Test</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading text when loading prop is true", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders with correct type attribute", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
