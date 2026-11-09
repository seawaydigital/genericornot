import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next-auth/react", () => ({
  useSession: vi.fn(() => ({ data: null, status: "unauthenticated" })),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import { ComparisonHero } from "../ComparisonHero";

const base = {
  slug: "life-brand-ibuprofen-vs-advil",
  nameBrandProductName: "Advil Ibuprofen 200 mg Tablets",
  nameBrand: "Advil",
  nameBrandPrice: 16.99,
  nameBrandSize: "100 tablets",
  genericProductName: "Life Brand Ibuprofen 200 mg Tablets",
  genericBrand: "Life Brand",
  genericStore: "Shoppers Drug Mart",
  genericPrice: 9.99,
  genericSize: "100 tablets",
  verdict: "PENDING",
  editorialVerdict: null,
  editorialNote: null,
  totalVotes: 0,
  lastVerifiedAt: null,
  flaggedOutdated: false,
};

describe("ComparisonHero", () => {
  it("puts the name brand and the store brand face to face", () => {
    render(<ComparisonHero {...base} />);
    expect(screen.getByRole("heading", { level: 1, name: "Advil Ibuprofen 200 mg Tablets" })).toBeInTheDocument();
    expect(screen.getByText("Life Brand Ibuprofen 200 mg Tablets")).toBeInTheDocument();
    expect(screen.getByText("$16.99")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    expect(screen.getByText("versus")).toHaveClass("sr-only");
  });

  it("shows unit prices and the per-unit savings tag", () => {
    render(<ComparisonHero {...base} />);
    expect(screen.getByText("$0.17 each")).toBeInTheDocument();
    expect(screen.getByText("$0.10 each")).toBeInTheDocument();
    expect(screen.getByText(/save 41%/i)).toBeInTheDocument();
    expect(screen.getByText("per unit")).toBeInTheDocument();
    expect(screen.getByText("You save about 41% per unit by choosing Life Brand.")).toBeInTheDocument();
  });

  it("shows the community verdict with real votes and the winning share, not a raw confidence score", () => {
    render(
      <ComparisonHero
        {...base}
        verdict="SAME_QUALITY"
        totalVotes={12}
        voteCounts={{ sameQuality: 10, closeEnough: 2, notWorthIt: 0 }}
      />
    );
    expect(screen.getByText("Generic Worth It")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("83%")).toBeInTheDocument();
    expect(screen.getByText("voted Same Quality")).toBeInTheDocument();
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/research verdict/i)).not.toBeInTheDocument();
  });

  it("marks a verdict with few votes as an early result", () => {
    render(
      <ComparisonHero
        {...base}
        verdict="SAME_QUALITY"
        totalVotes={5}
        voteCounts={{ sameQuality: 5, closeEnough: 0, notWorthIt: 0 }}
      />
    );
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Early result")).toBeInTheDocument();
  });

  it("drops the early-result note once 20 people have voted", () => {
    render(
      <ComparisonHero
        {...base}
        verdict="CLOSE_ENOUGH"
        totalVotes={40}
        voteCounts={{ sameQuality: 10, closeEnough: 26, notWorthIt: 4 }}
      />
    );
    expect(screen.getByText("65%")).toBeInTheDocument();
    expect(screen.getByText("voted Close Enough")).toBeInTheDocument();
    expect(screen.queryByText("Early result")).not.toBeInTheDocument();
  });

  it("says when votes are split", () => {
    render(
      <ComparisonHero
        {...base}
        verdict="MIXED"
        totalVotes={30}
        voteCounts={{ sameQuality: 10, closeEnough: 10, notWorthIt: 10 }}
      />
    );
    expect(screen.getByText("Mixed Reviews")).toBeInTheDocument();
    expect(screen.getByText(/votes are split/i)).toBeInTheDocument();
  });

  it("labels a research verdict and says how many votes until the community takes over", () => {
    render(
      <ComparisonHero
        {...base}
        totalVotes={2}
        editorialVerdict="SAME_QUALITY"
        editorialNote="Same medicinal ingredient and strength."
      />
    );
    expect(screen.getByText("Research verdict.")).toBeInTheDocument();
    expect(screen.getByText("Same medicinal ingredient and strength.")).toBeInTheDocument();
    expect(screen.getByText(/2 votes so far · the community verdict takes over after 3 more/)).toBeInTheDocument();
  });

  it("asks for votes when there is no verdict yet", () => {
    render(<ComparisonHero {...base} totalVotes={4} />);
    expect(screen.getByText(/no verdict yet — 4 votes so far\. 1 more vote/i)).toBeInTheDocument();
  });

  it("hides the savings tag when shoppers say to stick with the brand", () => {
    render(<ComparisonHero {...base} verdict="NOT_WORTH_IT" totalVotes={8} />);
    expect(screen.getByText("Stick with Brand")).toBeInTheDocument();
    expect(screen.queryByText(/save 41%/i)).not.toBeInTheDocument();
  });

  it("links to the vote card", () => {
    render(<ComparisonHero {...base} />);
    expect(screen.getByRole("link", { name: /cast your vote/i })).toHaveAttribute("href", "#vote");
  });
});
