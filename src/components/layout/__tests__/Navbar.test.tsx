import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { Navbar } from "../Navbar";

describe("Navbar", () => {
  it("renders the logo with correct text", () => {
    render(<Navbar />);
    // The logo link's accessible name is "Generic Or Not" (split text nodes + span)
    const logo = screen.getByRole("link", { name: /generic\s*or\s*not/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders Categories nav link", () => {
    render(<Navbar />);
    const link = screen.getAllByRole("link", { name: /categories/i })[0];
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("renders Top Rated nav link", () => {
    render(<Navbar />);
    const link = screen.getAllByRole("link", { name: /top rated/i })[0];
    expect(link).toBeInTheDocument();
  });

  it("renders New nav link", () => {
    render(<Navbar />);
    const link = screen.getAllByRole("link", { name: /^new$/i })[0];
    expect(link).toBeInTheDocument();
  });

  it("renders Sign In button when not authenticated", () => {
    render(<Navbar />);
    const signInButtons = screen.getAllByRole("button", { name: /sign in/i });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it("renders Submit link", () => {
    render(<Navbar />);
    const submitLinks = screen.getAllByRole("link", { name: /submit/i });
    expect(submitLinks.length).toBeGreaterThan(0);
    expect(submitLinks[0]).toHaveAttribute("href", "/submit");
  });
});
