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
  confidenceScore: 0,
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

  it("shows the community verdict with real vote counts", () => {
    render(<ComparisonHero {...base} verdict="SAME_QUALITY" totalVotes={12} confidenceScore={20} />);
    expect(screen.getByText("Generic Worth It")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.queryByText(/research verdict/i)).not.toBeInTheDocument();
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
    render(<ComparisonHero {...base} verdict="NOT_WORTH_IT" totalVotes={8} confidenceScore={10} />);
    expect(screen.getByText("Stick with Brand")).toBeInTheDocument();
    expect(screen.queryByText(/save 41%/i)).not.toBeInTheDocument();
  });

  it("links to the vote card", () => {
    render(<ComparisonHero {...base} />);
    expect(screen.getByRole("link", { name: /cast your vote/i })).toHaveAttribute("href", "#vote");
  });
});
