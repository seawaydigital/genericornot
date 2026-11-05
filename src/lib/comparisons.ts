import type { Prisma } from "@prisma/client";

/**
 * Shared query fragments and serialisation for comparison listings, so every
 * page (home, category, top swaps, new, search) shows the same fields the
 * same way.
 */

export const VERDICT_FILTER_VALUES = ["SAME_QUALITY", "CLOSE_ENOUGH", "NOT_WORTH_IT", "MIXED", "PENDING"] as const;
export type VerdictFilter = (typeof VERDICT_FILTER_VALUES)[number];

export function isVerdictFilter(value: unknown): value is VerdictFilter {
  return typeof value === "string" && (VERDICT_FILTER_VALUES as readonly string[]).includes(value);
}

/**
 * Filter by the verdict shoppers actually see: the community verdict once it
 * exists, otherwise the research verdict.
 */
export function effectiveVerdictWhere(verdict: VerdictFilter): Prisma.ProductComparisonWhereInput {
  switch (verdict) {
    case "PENDING":
      return { verdict: "PENDING", editorialVerdict: null };
    case "MIXED":
      return { verdict: "MIXED" };
    default:
      return {
        OR: [{ verdict }, { verdict: "PENDING", editorialVerdict: verdict }],
      };
  }
}

export const comparisonCardInclude = {
  category: { select: { name: true, icon: true, slug: true } },
} satisfies Prisma.ProductComparisonInclude;

type DecimalLike = { toString(): string } | number | null;

type CardRow = {
  id: string;
  slug: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: DecimalLike;
  genericSize?: string | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: DecimalLike;
  nameBrandSize?: string | null;
  verdict: string;
  editorialVerdict?: string | null;
  confidenceScore: number;
  totalVotes: number;
  category?: { name: string; icon: string; slug?: string } | null;
};

export function decimalToNumber(value: DecimalLike | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value.toString());
  return Number.isFinite(n) ? n : null;
}

export interface ComparisonCardData {
  id: string;
  slug: string;
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  genericSize: string | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  nameBrandSize: string | null;
  verdict: string;
  editorialVerdict: string | null;
  confidenceScore: number;
  totalVotes: number;
  category?: { name: string; icon: string };
}

/** Plain, serialisable card data (Prisma Decimals become numbers). */
export function toCardData(row: CardRow): ComparisonCardData {
  return {
    id: row.id,
    slug: row.slug,
    genericProductName: row.genericProductName,
    genericBrand: row.genericBrand,
    genericStore: row.genericStore,
    genericPrice: decimalToNumber(row.genericPrice),
    genericSize: row.genericSize ?? null,
    nameBrandProductName: row.nameBrandProductName,
    nameBrand: row.nameBrand,
    nameBrandPrice: decimalToNumber(row.nameBrandPrice),
    nameBrandSize: row.nameBrandSize ?? null,
    verdict: row.verdict,
    editorialVerdict: row.editorialVerdict ?? null,
    confidenceScore: row.confidenceScore,
    totalVotes: row.totalVotes,
    category: row.category ? { name: row.category.name, icon: row.category.icon } : undefined,
  };
}
