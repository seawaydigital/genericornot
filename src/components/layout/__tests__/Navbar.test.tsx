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
    const logo = screen.getByRole("link", { name: /generic\s*or\s*not/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders Explore nav link", () => {
    render(<Navbar />);
    const link = screen.getAllByRole("link", { name: /explore/i })[0];
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/categories");
  });

  it("renders Categories nav link", () => {
    render(<Navbar />);
    const links = screen.getAllByRole("link", { name: /categories/i });
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders About nav link", () => {
    render(<Navbar />);
    const link = screen.getAllByRole("link", { name: /about/i })[0];
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/about");
  });

  it("renders Sign In button when not authenticated", () => {
    render(<Navbar />);
    const signInButtons = screen.getAllByRole("button", { name: /sign in/i });
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  it("renders Contribute link", () => {
    render(<Navbar />);
    const contributeLinks = screen.getAllByRole("link", { name: /contribute/i });
    expect(contributeLinks.length).toBeGreaterThan(0);
    expect(contributeLinks[0]).toHaveAttribute("href", "/submit");
  });
});
