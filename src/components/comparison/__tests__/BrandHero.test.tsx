import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrandHero } from "../BrandHero";

// Mock child components that have complex dependencies
vi.mock("../FreshnessIndicator", () => ({
  FreshnessIndicator: ({ lastVerifiedAt, flaggedOutdated }: { lastVerifiedAt: string | null; flaggedOutdated: boolean }) => (
    <div data-testid="freshness-indicator" data-last-verified={lastVerifiedAt} data-flagged={String(flaggedOutdated)} />
  ),
}));

vi.mock("../FlagOutdatedButton", () => ({
  FlagOutdatedButton: ({ slug }: { slug: string }) => (
    <button data-testid="flag-button" data-slug={slug}>Flag as outdated</button>
  ),
}));

const baseProps = {
  nameBrandProductName: "Advil",
  nameBrand: "Pfizer",
  nameBrandPrice: 14.99,
  verdict: "SAME_QUALITY",
  confidenceScore: 82,
  totalVotes: 47,
  savings: 40,
  categoryIcon: "💊",
  lastVerifiedAt: null,
  flaggedOutdated: false,
  slug: "kirkland-ibuprofen-vs-advil",
};

describe("BrandHero", () => {
  it("renders the name brand product name as h1", () => {
    render(<BrandHero {...baseProps} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Advil");
  });

  it("renders the manufacturer name", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("Pfizer")).toBeInTheDocument();
  });

  it("renders the name brand price", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("$14.99")).toBeInTheDocument();
  });

  it("renders 'Generic Worth It' badge", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("Generic Worth It")).toBeInTheDocument();
  });

  it("shows savings in the badge", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("Save 40%")).toBeInTheDocument();
  });

  it("shows confidence score", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("82%")).toBeInTheDocument();
  });

  it("shows total votes", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("47")).toBeInTheDocument();
  });

  it("renders the category icon", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByText("💊")).toBeInTheDocument();
  });

  it("does not render price when nameBrandPrice is null", () => {
    render(<BrandHero {...baseProps} nameBrandPrice={null} />);
    expect(screen.queryByText("$14.99")).not.toBeInTheDocument();
  });

  it("renders FreshnessIndicator", () => {
    render(<BrandHero {...baseProps} />);
    expect(screen.getByTestId("freshness-indicator")).toBeInTheDocument();
  });

  it("renders FlagOutdatedButton with correct slug", () => {
    render(<BrandHero {...baseProps} />);
    const btn = screen.getByTestId("flag-button");
    expect(btn).toHaveAttribute("data-slug", "kirkland-ibuprofen-vs-advil");
  });

  it("shows singular 'vote' for 1 vote", () => {
    render(<BrandHero {...baseProps} totalVotes={1} />);
    expect(screen.getByText("vote")).toBeInTheDocument();
  });

  it("shows plural 'votes' for multiple votes", () => {
    render(<BrandHero {...baseProps} totalVotes={47} />);
    expect(screen.getByText("votes")).toBeInTheDocument();
  });
});
