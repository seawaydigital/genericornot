import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Verdict } from "@prisma/client";

const VALID_SORTS = ["totalVotes", "createdAt", "confidenceScore"] as const;
type SortField = (typeof VALID_SORTS)[number];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20)
  );
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const verdictParam = searchParams.get("verdict");
  const sortParam = searchParams.get("sort") ?? "totalVotes";

  const sort: SortField = VALID_SORTS.includes(sortParam as SortField)
    ? (sortParam as SortField)
    : "totalVotes";

  const verdict =
    verdictParam && Object.values(Verdict).includes(verdictParam as Verdict)
      ? (verdictParam as Verdict)
      : undefined;

  const where = {
    status: "APPROVED" as const,
    ...(categoryId ? { categoryId } : {}),
    ...(verdict ? { verdict } : {}),
  };

  const [comparisons, total] = await Promise.all([
    prisma.productComparison.findMany({
      where,
      include: { category: true },
      orderBy: { [sort]: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.productComparison.count({ where }),
  ]);

  return NextResponse.json({
    comparisons,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
