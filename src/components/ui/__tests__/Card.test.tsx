import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { Card } from "../Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies base dark theme classes", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("bg-gray-900");
    expect(card.className).toContain("border-gray-800");
    expect(card.className).toContain("rounded-xl");
  });

  it("renders as a link when href is provided", () => {
    render(<Card href="/some-path">Link card</Card>);
    const link = screen.getByRole("link", { name: "Link card" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/some-path");
  });

  it("adds hover styles when href is provided", () => {
    render(<Card href="/path">Content</Card>);
    const link = screen.getByRole("link");
    expect(link.className).toContain("hover:border-gray-700");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Card onClick={onClick}>Clickable</Card>);
    await user.click(screen.getByText("Clickable"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("adds hover styles when onClick is provided", () => {
    const { container } = render(<Card onClick={vi.fn()}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("hover:border-gray-700");
  });

  it("accepts additional className", () => {
    const { container } = render(<Card className="p-4">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("p-4");
  });
});
