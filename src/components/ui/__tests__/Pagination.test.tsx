import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { Pagination } from "../Pagination";

const hrefFor = (p: number) => `?page=${p}`;

describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} hrefFor={hrefFor} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("links to the next page only on the first page", () => {
    render(<Pagination page={1} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute("href", "?page=2");
    expect(screen.getByText(/page/i)).toHaveTextContent("Page 1 of 3");
  });

  it("links both ways in the middle", () => {
    render(<Pagination page={2} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute("href", "?page=1");
    expect(screen.getByRole("link", { name: /next/i })).toHaveAttribute("href", "?page=3");
  });

  it("links back only on the last page", () => {
    render(<Pagination page={3} totalPages={3} hrefFor={hrefFor} />);
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute("href", "?page=2");
    expect(screen.queryByRole("link", { name: /next/i })).not.toBeInTheDocument();
  });
});
