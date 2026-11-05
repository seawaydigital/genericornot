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
    render(<BrandHero {...baseProps} verdict="PENDING" totalVotes={1} />);
    expect(screen.getByText(/1 vote so far/)).toBeInTheDocument();
  });

  it("labels a research verdict and says how many votes until the community takes over", () => {
    render(
      <BrandHero
        {...baseProps}
        verdict="PENDING"
        totalVotes={2}
        editorialVerdict="SAME_QUALITY"
        editorialNote="Same medicinal ingredient and strength."
      />
    );
    expect(screen.getByText("Research verdict.")).toBeInTheDocument();
    expect(screen.getByText(/Same medicinal ingredient and strength\./)).toBeInTheDocument();
    expect(screen.getByText(/takes over after 3 more/)).toBeInTheDocument();
    expect(screen.getByText("Research")).toBeInTheDocument();
    expect(screen.queryByText("confidence")).not.toBeInTheDocument();
  });

  it("shows the community verdict once there are enough votes, even with a research verdict", () => {
    render(<BrandHero {...baseProps} editorialVerdict="NOT_WORTH_IT" />);
    expect(screen.getByText("Generic Worth It")).toBeInTheDocument();
    expect(screen.queryByText("Research verdict.")).not.toBeInTheDocument();
  });

  it("prices in Canadian dollars with the package size", () => {
    render(<BrandHero {...baseProps} nameBrandSize="100 tablets" />);
    expect(screen.getByText(/\$14\.99/)).toBeInTheDocument();
    expect(screen.getByText(/100 tablets/)).toBeInTheDocument();
  });

  it("shows plural 'votes' for multiple votes", () => {
    render(<BrandHero {...baseProps} totalVotes={47} />);
    expect(screen.getByText("votes")).toBeInTheDocument();
  });
});
