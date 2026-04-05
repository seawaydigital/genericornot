import { prisma } from "@/lib/db";

export async function searchComparisons(query: string, page = 1, limit = 20) {
  // Parse "X vs Y" queries (also handles "X vs. Y" with period)
  const vsMatch = query.match(/(.+?)\s+vs\.?\s+(.+)/i);
  const searchTerms = vsMatch
    ? [vsMatch[1].trim(), vsMatch[2].trim()]
    : [query.trim()];

  // Build Prisma where clause using OR across product name fields
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
