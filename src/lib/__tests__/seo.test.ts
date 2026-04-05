import { describe, it, expect } from "vitest";
import { getComparisonMetadata, getCategoryMetadata, getComparisonJsonLd } from "../seo";

const baseComparison = {
  genericProductName: "Ibuprofen",
  genericBrand: "Kirkland",
  genericStore: "Costco",
  genericPrice: 12.99,
  nameBrandProductName: "Advil",
  nameBrand: "Pfizer",
  nameBrandPrice: 24.99,
  slug: "kirkland-ibuprofen-vs-advil",
  verdict: "SAME_QUALITY",
  confidenceScore: 85,
  totalVotes: 50,
  category: { name: "Health & Medicine", slug: "health-medicine" },
};

describe("getComparisonMetadata", () => {
  it("includes both product names in title", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.title).toContain("Ibuprofen");
    expect(meta.title).toContain("Advil");
  });

  it("includes brand names in title", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.title).toContain("Kirkland");
    expect(meta.title).toContain("Pfizer");
  });

  it("includes site name in title", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.title).toContain("GenericOrNot");
  });

  it("includes description with store name", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.description).toContain("Costco");
  });

  it("includes verdict in description", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.description).toContain("Same Quality");
  });

  it("includes vote count in description", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.description).toContain("50");
  });

  it("includes singular 'vote' for exactly 1 vote", () => {
    const meta = getComparisonMetadata({ ...baseComparison, totalVotes: 1 });
    expect(meta.description).toContain("1 vote");
    expect(meta.description).not.toContain("1 votes");
  });

  it("sets correct canonical URL", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.alternates?.canonical).toBe(
      "https://genericornot.com/compare/kirkland-ibuprofen-vs-advil"
    );
  });

  it("sets openGraph url", () => {
    const meta = getComparisonMetadata(baseComparison);
    const og = meta.openGraph as Record<string, unknown>;
    expect(og?.url).toContain("kirkland-ibuprofen-vs-advil");
  });

  it("sets twitter card to summary", () => {
    const meta = getComparisonMetadata(baseComparison);
    const twitter = meta.twitter as Record<string, unknown>;
    expect(twitter?.card).toBe("summary");
  });

  it("handles CLOSE_ENOUGH verdict in description", () => {
    const meta = getComparisonMetadata({ ...baseComparison, verdict: "CLOSE_ENOUGH" });
    expect(meta.description).toContain("Close Enough");
  });

  it("handles NOT_WORTH_IT verdict in description", () => {
    const meta = getComparisonMetadata({ ...baseComparison, verdict: "NOT_WORTH_IT" });
    expect(meta.description).toContain("Not Worth It");
  });

  it("handles PENDING verdict in description", () => {
    const meta = getComparisonMetadata({ ...baseComparison, verdict: "PENDING" });
    expect(meta.description).toContain("Pending");
  });
});

describe("getCategoryMetadata", () => {
  const category = {
    name: "Grocery",
    slug: "grocery",
    icon: "🛒",
    comparisonCount: 42,
  };

  it("includes category name in title", () => {
    const meta = getCategoryMetadata(category);
    expect(meta.title).toContain("Grocery");
  });

  it("includes site name in title", () => {
    const meta = getCategoryMetadata(category);
    expect(meta.title).toContain("GenericOrNot");
  });

  it("sets canonical URL with category slug", () => {
    const meta = getCategoryMetadata(category);
    expect(meta.alternates?.canonical).toBe("https://genericornot.com/categories/grocery");
  });

  it("uses provided description when present", () => {
    const meta = getCategoryMetadata({ ...category, description: "Custom description" });
    expect(meta.description).toBe("Custom description");
  });

  it("generates default description when no description provided", () => {
    const meta = getCategoryMetadata(category);
    expect(meta.description).toContain("Grocery");
  });

  it("includes comparison count in auto-generated description", () => {
    const meta = getCategoryMetadata(category);
    expect(meta.description).toContain("42");
  });
});

describe("getComparisonJsonLd", () => {
  it("returns correct @context and @type", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("Product");
  });

  it("includes product name", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    expect(jsonLd.name).toBe("Advil");
  });

  it("includes the comparison URL", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    expect(jsonLd.url).toContain("kirkland-ibuprofen-vs-advil");
  });

  it("includes category when present", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    expect(jsonLd.category).toBe("Health & Medicine");
  });

  it("includes offers when prices are provided", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    const offers = jsonLd.offers as object[];
    expect(offers).toHaveLength(2);
  });

  it("omits offers when no prices provided", () => {
    const noPrice = { ...baseComparison, genericPrice: null, nameBrandPrice: null };
    const jsonLd = getComparisonJsonLd(noPrice) as Record<string, unknown>;
    const offers = jsonLd.offers as object[];
    expect(offers).toHaveLength(0);
  });

  it("includes aggregateRating when enough votes", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    const rating = jsonLd.aggregateRating as Record<string, unknown>;
    expect(rating).toBeDefined();
    expect(rating["@type"]).toBe("AggregateRating");
    expect(rating.ratingCount).toBe(50);
  });

  it("omits aggregateRating when fewer than 5 votes", () => {
    const fewVotes = { ...baseComparison, totalVotes: 4 };
    const jsonLd = getComparisonJsonLd(fewVotes) as Record<string, unknown>;
    expect(jsonLd.aggregateRating).toBeUndefined();
  });

  it("maps SAME_QUALITY to rating 5", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    const rating = jsonLd.aggregateRating as Record<string, unknown>;
    expect(rating.ratingValue).toBe(5);
  });

  it("maps NOT_WORTH_IT to rating 2", () => {
    const comparison = { ...baseComparison, verdict: "NOT_WORTH_IT" };
    const jsonLd = getComparisonJsonLd(comparison) as Record<string, unknown>;
    const rating = jsonLd.aggregateRating as Record<string, unknown>;
    expect(rating.ratingValue).toBe(2);
  });

  it("includes verdict in description", () => {
    const jsonLd = getComparisonJsonLd(baseComparison) as Record<string, unknown>;
    expect(jsonLd.description).toContain("Same Quality");
  });
});
