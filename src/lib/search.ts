import { prisma } from "@/lib/db";

/**
 * Search comparisons using PostgreSQL full-text search (tsvector) with
 * trigram fuzzy matching fallback. Falls back to Prisma `contains` if
 * the searchVector column doesn't exist yet (migration not applied).
 */
export async function searchComparisons(query: string, page = 1, limit = 20) {
  // Parse "X vs Y" queries (also handles "X vs. Y" with period)
  const vsMatch = query.match(/(.+?)\s+vs\.?\s+(.+)/i);
  const searchTerms = vsMatch
    ? [vsMatch[1].trim(), vsMatch[2].trim()]
    : [query.trim()];

  // Try full-text search first
  try {
    return await searchWithVector(searchTerms, query, page, limit);
  } catch {
    // searchVector column doesn't exist — fall back to contains
    return await searchWithContains(searchTerms, page, limit);
  }
}

/**
 * Full-text search using tsvector + trigram similarity.
 * Combines ts_rank for relevance with similarity() for fuzzy matching.
 */
async function searchWithVector(
  searchTerms: string[],
  rawQuery: string,
  page: number,
  limit: number
) {
  // Build tsquery from search terms — join with | (OR) for broader matching
  const tsqueryTerms = searchTerms
    .flatMap((term) => term.split(/\s+/))
    .filter((w) => w.length > 1)
    .map((w) => w.replace(/[^\w]/g, ""))
    .filter((w) => w.length > 0)
    .map((w) => `${w}:*`)  // prefix matching
    .join(" | ");

  if (!tsqueryTerms) {
    return { results: [], total: 0, page, totalPages: 0 };
  }

  const offset = (page - 1) * limit;

  // Query using tsvector rank + trigram similarity for scoring
  const results = await prisma.$queryRawUnsafe<Array<{
    id: string;
    slug: string;
    genericProductName: string;
    genericBrand: string;
    genericStore: string;
    genericPrice: number | null;
    nameBrandProductName: string;
    nameBrand: string;
    nameBrandPrice: number | null;
    verdict: string;
    confidenceScore: number;
    totalVotes: number;
    categoryId: string;
    categoryName: string | null;
    categoryIcon: string | null;
    rank: number;
  }>>(
    `SELECT
      pc.id, pc.slug,
      pc."genericProductName", pc."genericBrand", pc."genericStore", pc."genericPrice",
      pc."nameBrandProductName", pc."nameBrand", pc."nameBrandPrice",
      pc.verdict, pc."confidenceScore", pc."totalVotes", pc."categoryId",
      c.name as "categoryName", c.icon as "categoryIcon",
      (
        ts_rank(pc."searchVector", to_tsquery('english', $1)) * 2 +
        GREATEST(
          similarity(pc."genericProductName", $2),
          similarity(pc."nameBrandProductName", $2),
          similarity(pc."nameBrand", $2),
          similarity(pc."genericBrand", $2)
        )
      ) as rank
    FROM "ProductComparison" pc
    LEFT JOIN "Category" c ON pc."categoryId" = c.id
    WHERE pc.status = 'APPROVED'
      AND (
        pc."searchVector" @@ to_tsquery('english', $1)
        OR similarity(pc."genericProductName", $2) > 0.15
        OR similarity(pc."nameBrandProductName", $2) > 0.15
        OR similarity(pc."nameBrand", $2) > 0.2
        OR similarity(pc."genericBrand", $2) > 0.2
      )
    ORDER BY rank DESC, pc."totalVotes" DESC
    LIMIT $3 OFFSET $4`,
    tsqueryTerms,
    searchTerms.join(" "),
    limit,
    offset
  );

  // Get total count
  const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
    `SELECT COUNT(*) as count
    FROM "ProductComparison" pc
    WHERE pc.status = 'APPROVED'
      AND (
        pc."searchVector" @@ to_tsquery('english', $1)
        OR similarity(pc."genericProductName", $2) > 0.15
        OR similarity(pc."nameBrandProductName", $2) > 0.15
        OR similarity(pc."nameBrand", $2) > 0.2
        OR similarity(pc."genericBrand", $2) > 0.2
      )`,
    tsqueryTerms,
    searchTerms.join(" ")
  );

  const total = Number(countResult[0]?.count ?? 0);

  return {
    results: results.map((r) => ({
      ...r,
      genericPrice: r.genericPrice != null ? Number(r.genericPrice) : null,
      nameBrandPrice: r.nameBrandPrice != null ? Number(r.nameBrandPrice) : null,
      category: r.categoryName
        ? { name: r.categoryName, icon: r.categoryIcon ?? "" }
        : null,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Fallback search using Prisma's contains (case-insensitive LIKE).
 * Used when the tsvector migration hasn't been applied yet.
 */
async function searchWithContains(searchTerms: string[], page: number, limit: number) {
  const where = {
    status: "APPROVED" as const,
    OR: searchTerms.flatMap((term) => [
      { genericProductName: { contains: term, mode: "insensitive" as const } },
      { genericBrand: { contains: term, mode: "insensitive" as const } },
      { genericStore: { contains: term, mode: "insensitive" as const } },
      { nameBrandProductName: { contains: term, mode: "insensitive" as const } },
      { nameBrand: { contains: term, mode: "insensitive" as const } },
    ]),
  };

  const [comparisons, total] = await Promise.all([
    prisma.productComparison.findMany({
      where,
      include: { category: true },
      orderBy: { totalVotes: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productComparison.count({ where }),
  ]);

  return {
    results: comparisons,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
