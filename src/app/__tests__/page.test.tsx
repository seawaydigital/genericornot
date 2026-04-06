import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// Mock Prisma so the server component never tries to connect to a database
vi.mock("@/lib/db", () => ({
  prisma: {
    productComparison: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    category: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    evidence: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import Home from "../page";

describe("Homepage", () => {
  it("renders the hero heading", async () => {
    // Home is an async server component — await it to get the JSX
    const jsx = await Home();
    render(jsx);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("renders the hero tagline", async () => {
    const jsx = await Home();
    render(jsx);
    expect(screen.getByText(/is the generic version/i)).toBeInTheDocument();
  });

  it("renders the search bar", async () => {
    const jsx = await Home();
    render(jsx);
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("renders trending section heading", async () => {
    const jsx = await Home();
    render(jsx);
    expect(screen.getByRole("heading", { name: /popular products/i })).toBeInTheDocument();
  });

  it("renders categories section heading", async () => {
    const jsx = await Home();
    render(jsx);
    expect(screen.getByRole("heading", { name: /browse by category/i })).toBeInTheDocument();
  });

  it("renders recent contributions heading", async () => {
    const jsx = await Home();
    render(jsx);
    expect(screen.getByRole("heading", { name: /recent contributions/i })).toBeInTheDocument();
  });
});
