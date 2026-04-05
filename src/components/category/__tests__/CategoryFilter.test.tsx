import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CategoryFilter } from "../CategoryFilter";

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  mockPush.mockClear();
});

describe("CategoryFilter", () => {
  it("renders all verdict filter buttons", () => {
    render(<CategoryFilter />);
    expect(screen.getByRole("button", { name: /^All$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /same quality/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close enough/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /not worth it/i })).toBeInTheDocument();
  });

  it("renders the sort dropdown", () => {
    render(<CategoryFilter />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Most Voted")).toBeInTheDocument();
    expect(screen.getByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Highest Savings")).toBeInTheDocument();
  });

  it('"All" button is active (aria-pressed=true) by default when no verdict provided', () => {
    render(<CategoryFilter />);
    const allButton = screen.getByRole("button", { name: /^All$/i });
    expect(allButton).toHaveAttribute("aria-pressed", "true");
  });

  it('"All" button is active when currentVerdict is empty string', () => {
    render(<CategoryFilter currentVerdict="" />);
    const allButton = screen.getByRole("button", { name: /^All$/i });
    expect(allButton).toHaveAttribute("aria-pressed", "true");
  });

  it("other verdict buttons are not active when no verdict is selected", () => {
    render(<CategoryFilter />);
    expect(
      screen.getByRole("button", { name: /same quality/i })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /close enough/i })
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /not worth it/i })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("marks the correct verdict button as active when currentVerdict is set", () => {
    render(<CategoryFilter currentVerdict="SAME_QUALITY" />);
    expect(
      screen.getByRole("button", { name: /same quality/i })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /^All$/i })
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the correct sort option selected", () => {
    render(<CategoryFilter currentSort="newest" />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("newest");
  });

  it("defaults sort to totalVotes when no currentSort provided", () => {
    render(<CategoryFilter />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("totalVotes");
  });
});
