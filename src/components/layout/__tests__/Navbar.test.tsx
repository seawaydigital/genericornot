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

  it("renders Best Swaps and New nav links", () => {
    render(<Navbar />);
    expect(screen.getAllByRole("link", { name: /best swaps/i })[0]).toHaveAttribute("href", "/top-rated");
    expect(screen.getAllByRole("link", { name: /^new$/i })[0]).toHaveAttribute("href", "/new");
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

  it("renders Sign In link when not authenticated", () => {
    render(<Navbar />);
    const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    expect(signInLinks[0]).toHaveAttribute("href", "/auth/signin");
  });

  it("renders the Add a comparison link", () => {
    render(<Navbar />);
    const addLinks = screen.getAllByRole("link", { name: /add a comparison/i });
    expect(addLinks.length).toBeGreaterThan(0);
    expect(addLinks[0]).toHaveAttribute("href", "/submit");
  });

  it("names the account menu after the signed-in nickname", async () => {
    const { useSession } = await import("next-auth/react");
    vi.mocked(useSession).mockReturnValueOnce({
      data: { user: { id: "u1", role: "USER", username: "thrifty-loon-1234" }, expires: "2099-01-01T00:00:00.000Z" },
      status: "authenticated",
      update: vi.fn(),
    });
    render(<Navbar />);
    expect(screen.getByRole("button", { name: /account menu for thrifty-loon-1234/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^sign in$/i })).not.toBeInTheDocument();
  });
});
