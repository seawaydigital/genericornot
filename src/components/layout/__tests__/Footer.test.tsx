import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { Footer } from "../Footer";

describe("Footer", () => {
  it("renders GenericOrNot branding", () => {
    render(<Footer />);
    const links = screen.getAllByText(/generic/i);
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders the tagline", () => {
    render(<Footer />);
    expect(screen.getByText(/editorial truth in consumer advocacy/i)).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("renders About Us link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /about/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
  });

  it("renders Privacy link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /privacy/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/privacy");
  });

  it("renders Terms link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /terms/i });
    expect(link).toBeInTheDocument();
  });

  it("renders Contribute link", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /contribute/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/submit");
  });
});
