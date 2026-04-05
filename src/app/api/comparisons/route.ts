import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Verdict } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import { submissionLimiter } from "@/lib/rate-limit";

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

const REQUIRED_FIELDS = [
  "genericProductName",
  "genericBrand",
  "genericStore",
  "nameBrandProductName",
  "nameBrand",
  "categoryId",
] as const;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = submissionLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests, please try again later" },
      { status: 429 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors: Record<string, string> = {};
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || typeof data[field] !== "string" || !(data[field] as string).trim()) {
      errors[field] = `${field} is required`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const slug = await generateUniqueSlug(
    data.genericProductName as string,
    data.nameBrandProductName as string
  );

  const comparison = await prisma.productComparison.create({
    data: {
      slug,
      genericProductName: (data.genericProductName as string).trim(),
      genericBrand: (data.genericBrand as string).trim(),
      genericStore: (data.genericStore as string).trim(),
      genericPrice: typeof data.genericPrice === "number" ? data.genericPrice : null,
      genericImageUrl: typeof data.genericImageUrl === "string" ? data.genericImageUrl : null,
      nameBrandProductName: (data.nameBrandProductName as string).trim(),
      nameBrand: (data.nameBrand as string).trim(),
      nameBrandPrice: typeof data.nameBrandPrice === "number" ? data.nameBrandPrice : null,
      nameBrandImageUrl: typeof data.nameBrandImageUrl === "string" ? data.nameBrandImageUrl : null,
      categoryId: (data.categoryId as string).trim(),
      status: "PENDING",
      verdict: "PENDING",
      confidenceScore: 0,
      totalVotes: 0,
      submittedById: session.user.id,
    },
  });

  return NextResponse.json({ comparison }, { status: 201 });
}
