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
  it("leads with name brand product name in title", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.title).toContain("Advil");
    expect(meta.title).toContain("Pfizer");
  });

  it("mentions 'Generic Alternative' in title", () => {
    const meta = getComparisonMetadata(baseComparison);
    expect(meta.title).toContain("Generic Alternative");
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

  it("uses the large twitter card (comparison pages have OG images)", () => {
    const meta = getComparisonMetadata(baseComparison);
    const twitter = meta.twitter as Record<string, unknown>;
    expect(twitter?.card).toBe("summary_large_image");
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
  it("describes a WebPage about the two products", () => {
    const jsonLd = getComparisonJsonLd(baseComparison);
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("WebPage");
    expect(jsonLd.inLanguage).toBe("en-CA");
    const about = jsonLd.about as Array<Record<string, unknown>>;
    expect(about.map((p) => p.name)).toEqual(["Advil", "Ibuprofen"]);
    expect(about[0].brand).toEqual({ "@type": "Brand", name: "Pfizer" });
    expect(about[1].brand).toEqual({ "@type": "Brand", name: "Kirkland" });
  });

  it("includes the comparison URL", () => {
    const jsonLd = getComparisonJsonLd(baseComparison);
    expect(jsonLd.url).toBe("https://genericornot.com/compare/kirkland-ibuprofen-vs-advil");
  });

  it("includes the category on each product when present", () => {
    const jsonLd = getComparisonJsonLd(baseComparison);
    const about = jsonLd.about as Array<Record<string, unknown>>;
    expect(about[0].category).toBe("Health & Medicine");
  });

  it("never marks verdicts up as star ratings or prices as live offers", () => {
    const jsonLd = getComparisonJsonLd(baseComparison);
    const serialised = JSON.stringify(jsonLd);
    expect(serialised).not.toContain("AggregateRating");
    expect(serialised).not.toContain("Offer");
    expect(serialised).not.toContain("USD");
  });

  it("includes a breadcrumb trail", () => {
    const jsonLd = getComparisonJsonLd(baseComparison);
    const crumbs = (jsonLd.breadcrumb as { itemListElement: Array<{ name: string; position: number }> }).itemListElement;
    expect(crumbs.map((c) => c.name)).toEqual(["Home", "Health & Medicine", "Kirkland vs Pfizer"]);
    expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
  });

  it("includes the verdict in the description", () => {
    const jsonLd = getComparisonJsonLd(baseComparison);
    expect(jsonLd.description).toContain("Same Quality");
  });

  it("labels a research verdict as research, not community", () => {
    const jsonLd = getComparisonJsonLd({ ...baseComparison, verdict: "PENDING", totalVotes: 2, editorialVerdict: "SAME_QUALITY" });
    expect(jsonLd.description).toContain("Research verdict: Same Quality");
  });
});
