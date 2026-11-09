import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

import { SearchBar } from "../SearchBar";

describe("SearchBar", () => {
  it("renders the search input", () => {
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();
  });

  it("has correct placeholder text", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/search a product or brand/i);
    expect(input).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<SearchBar />);
    expect(screen.getByLabelText(/search products and brands/i)).toBeInTheDocument();
  });

  it("pre-fills the current query", () => {
    render(<SearchBar defaultValue="advil" />);
    expect(screen.getByRole("searchbox")).toHaveValue("advil");
  });

  it("navigates to search page on submit", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);
    const input = screen.getByRole("searchbox");
    await user.type(input, "ibuprofen");
    await user.keyboard("{Enter}");
    expect(mockPush).toHaveBeenCalledWith("/search?q=ibuprofen");
  });

  it("renders popular chips when provided", () => {
    const popular = [
      { label: "Ibuprofen", query: "ibuprofen" },
      { label: "Cereal", query: "cereal" },
    ];
    render(<SearchBar popular={popular} />);
    expect(screen.getByRole("button", { name: "Ibuprofen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cereal" })).toBeInTheDocument();
  });

  it("navigates when a popular chip is clicked", async () => {
    const user = userEvent.setup();
    const popular = [{ label: "Aspirin", query: "aspirin" }];
    render(<SearchBar popular={popular} />);
    await user.click(screen.getByRole("button", { name: "Aspirin" }));
    expect(mockPush).toHaveBeenCalledWith("/search?q=aspirin");
  });
});
