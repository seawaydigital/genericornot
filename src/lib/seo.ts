import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "./site";
import { getDisplayVerdict } from "./verdict";

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
  editorialVerdict?: string | null;
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

const BASE_URL = SITE_URL;

function verdictSentence(comparison: ComparisonForSeo): string {
  const display = getDisplayVerdict(comparison);
  const votes = `${comparison.totalVotes} vote${comparison.totalVotes !== 1 ? "s" : ""}`;
  if (display.source === "community") {
    return `Community verdict: ${formatVerdict(display.verdict)} with ${votes}.`;
  }
  if (display.source === "research") {
    return `Research verdict: ${formatVerdict(display.verdict)} (${votes} so far).`;
  }
  return `Community verdict: ${formatVerdict("PENDING")} with ${votes}.`;
}

export function getComparisonMetadata(comparison: ComparisonForSeo): Metadata {
  const title = `${comparison.nameBrand} ${comparison.nameBrandProductName} — Generic Alternative | ${SITE_NAME}`;
  const description = `Is ${comparison.genericBrand} ${comparison.genericProductName} (${comparison.genericStore}) the same quality as ${comparison.nameBrand} ${comparison.nameBrandProductName}? ${verdictSentence(comparison)} Canadian prices and evidence.`;
  const url = `${BASE_URL}/compare/${comparison.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: SITE_NAME,
      locale: "en_CA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function getCategoryMetadata(category: CategoryForSeo): Metadata {
  const title = `${category.name} — Generic vs Name Brand Comparisons — ${SITE_NAME}`;
  const description =
    category.description ??
    `Browse ${category.comparisonCount ?? "community"} comparisons for ${category.name} products. Find out which Canadian store brands are the same quality as name brands.`;
  const url = `${BASE_URL}/categories/${category.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_CA",
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

/**
 * Structured data for a comparison page.
 *
 * Deliberately a WebPage *about* two products rather than a Product with an
 * AggregateRating: our verdicts are not star ratings, and marking them up as
 * ratings would misrepresent them to search engines. Prices are approximate
 * shelf prices, not live offers, so no Offer markup either.
 */
export function getComparisonJsonLd(comparison: ComparisonForSeo): Record<string, unknown> {
  const url = `${BASE_URL}/compare/${comparison.slug}`;
  const crumbs = [
    { name: "Home", item: BASE_URL },
    ...(comparison.category
      ? [{ name: comparison.category.name, item: `${BASE_URL}/categories/${comparison.category.slug}` }]
      : []),
    { name: `${comparison.genericBrand} vs ${comparison.nameBrand}`, item: url },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${comparison.genericBrand} ${comparison.genericProductName} vs ${comparison.nameBrand} ${comparison.nameBrandProductName}`,
    description: `Community comparison: ${comparison.genericBrand} ${comparison.genericProductName} vs ${comparison.nameBrand} ${comparison.nameBrandProductName}. ${verdictSentence(comparison)}`,
    url,
    inLanguage: "en-CA",
    about: [
      {
        "@type": "Product",
        name: comparison.nameBrandProductName,
        brand: { "@type": "Brand", name: comparison.nameBrand },
        ...(comparison.category ? { category: comparison.category.name } : {}),
      },
      {
        "@type": "Product",
        name: comparison.genericProductName,
        brand: { "@type": "Brand", name: comparison.genericBrand },
        ...(comparison.category ? { category: comparison.category.name } : {}),
      },
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.item,
      })),
    },
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
