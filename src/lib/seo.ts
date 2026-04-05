import type { Metadata } from "next";

interface ComparisonForSeo {
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice?: number | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice?: number | null;
  slug: string;
  verdict: string;
  confidenceScore: number;
  totalVotes: number;
  category?: { name: string; slug: string } | null;
}

interface CategoryForSeo {
  name: string;
  slug: string;
  icon?: string;
  description?: string | null;
  comparisonCount?: number;
}

const BASE_URL = "https://genericornot.com";

export function getComparisonMetadata(comparison: ComparisonForSeo): Metadata {
  const title = `${comparison.genericBrand} ${comparison.genericProductName} vs ${comparison.nameBrand} ${comparison.nameBrandProductName} — GenericOrNot`;
  const description = `Is ${comparison.genericBrand} ${comparison.genericProductName} (${comparison.genericStore}) the same quality as ${comparison.nameBrand} ${comparison.nameBrandProductName}? Community verdict: ${formatVerdict(comparison.verdict)} with ${comparison.totalVotes} vote${comparison.totalVotes !== 1 ? "s" : ""}.`;
  const url = `${BASE_URL}/compare/${comparison.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "GenericOrNot",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function getCategoryMetadata(category: CategoryForSeo): Metadata {
  const title = `${category.name} — Generic vs Name Brand Comparisons — GenericOrNot`;
  const description =
    category.description ??
    `Browse ${category.comparisonCount ?? "community"} comparisons for ${category.name} products. Find out which generic store brands are the same quality as name brands.`;
  const url = `${BASE_URL}/categories/${category.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "GenericOrNot",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function getComparisonJsonLd(comparison: ComparisonForSeo): object {
  const offers: object[] = [];

  if (comparison.genericPrice != null) {
    offers.push({
      "@type": "Offer",
      name: `${comparison.genericBrand} (Generic)`,
      price: comparison.genericPrice.toFixed(2),
      priceCurrency: "USD",
      seller: {
        "@type": "Organization",
        name: comparison.genericStore,
      },
    });
  }

  if (comparison.nameBrandPrice != null) {
    offers.push({
      "@type": "Offer",
      name: `${comparison.nameBrand} (Name Brand)`,
      price: comparison.nameBrandPrice.toFixed(2),
      priceCurrency: "USD",
      seller: {
        "@type": "Organization",
        name: comparison.nameBrand,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: comparison.nameBrandProductName,
    description: `Community comparison: ${comparison.genericBrand} ${comparison.genericProductName} vs ${comparison.nameBrand} ${comparison.nameBrandProductName}. Verdict: ${formatVerdict(comparison.verdict)}.`,
    url: `${BASE_URL}/compare/${comparison.slug}`,
    ...(comparison.category ? { category: comparison.category.name } : {}),
    offers,
    aggregateRating:
      comparison.totalVotes >= 5
        ? {
            "@type": "AggregateRating",
            ratingCount: comparison.totalVotes,
            ratingValue: verdictToRating(comparison.verdict),
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };
}

function formatVerdict(verdict: string): string {
  switch (verdict) {
    case "SAME_QUALITY":
      return "Same Quality";
    case "CLOSE_ENOUGH":
      return "Close Enough";
    case "NOT_WORTH_IT":
      return "Not Worth It";
    case "MIXED":
      return "Mixed";
    default:
      return "Pending";
  }
}

function verdictToRating(verdict: string): number {
  switch (verdict) {
    case "SAME_QUALITY":
      return 5;
    case "CLOSE_ENOUGH":
      return 4;
    case "MIXED":
      return 3;
    case "NOT_WORTH_IT":
      return 2;
    default:
      return 3;
  }
}
