import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slug";
import { submissionLimiter } from "@/lib/rate-limit";
import { effectiveVerdictWhere, isVerdictFilter } from "@/lib/comparisons";
import {
  LIMITS,
  cleanMultiline,
  cleanText,
  optionalText,
  parsePrice,
  requireText,
  type FieldErrors,
} from "@/lib/validation";

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

  const where = {
    status: "APPROVED" as const,
    ...(categoryId ? { categoryId } : {}),
    ...(isVerdictFilter(verdictParam) ? effectiveVerdictWhere(verdictParam) : {}),
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to submit a comparison." }, { status: 401 });
  }

  const rateLimit = submissionLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "You've submitted several comparisons recently — please try again in an hour." },
      { status: 429 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors: FieldErrors = {};
  const genericProductName = requireText(data, "genericProductName", "Store-brand product name", LIMITS.productName, errors);
  const genericBrand = requireText(data, "genericBrand", "Store brand", LIMITS.brand, errors);
  const genericStore = requireText(data, "genericStore", "Store", LIMITS.store, errors);
  const nameBrandProductName = requireText(data, "nameBrandProductName", "Name-brand product name", LIMITS.productName, errors);
  const nameBrand = requireText(data, "nameBrand", "Name brand", LIMITS.brand, errors);
  const categoryId = requireText(data, "categoryId", "Category", 64, errors);
  const genericSize = optionalText(data, "genericSize", "Size", LIMITS.size, errors);
  const nameBrandSize = optionalText(data, "nameBrandSize", "Size", LIMITS.size, errors);

  const genericPrice = parsePrice(data.genericPrice);
  const nameBrandPrice = parsePrice(data.nameBrandPrice);
  if (Number.isNaN(genericPrice)) errors.genericPrice = `Enter a price between $0 and $${LIMITS.maxPrice}`;
  if (Number.isNaN(nameBrandPrice)) errors.nameBrandPrice = `Enter a price between $0 and $${LIMITS.maxPrice}`;

  // Optional first piece of evidence, submitted with the comparison so it can
  // be reviewed together (the evidence API only accepts approved comparisons).
  const evidenceTitle = cleanText(data.evidenceTitle);
  const evidenceContent = cleanMultiline(data.evidenceContent);
  if (evidenceTitle.length > LIMITS.evidenceTitle) {
    errors.evidenceTitle = `Title must be ${LIMITS.evidenceTitle} characters or fewer`;
  }
  if (evidenceContent.length > LIMITS.evidenceContent) {
    errors.evidenceContent = `Details must be ${LIMITS.evidenceContent} characters or fewer`;
  }
  if ((evidenceTitle && !evidenceContent) || (!evidenceTitle && evidenceContent)) {
    errors.evidenceContent = "Add both a title and details, or leave both empty";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) {
    return NextResponse.json({ errors: { categoryId: "Choose a category from the list" } }, { status: 400 });
  }

  const duplicate = await prisma.productComparison.findFirst({
    where: {
      genericProductName: { equals: genericProductName, mode: "insensitive" },
      nameBrandProductName: { equals: nameBrandProductName, mode: "insensitive" },
      status: { in: ["PENDING", "APPROVED"] },
    },
    select: { slug: true, status: true },
  });
  if (duplicate) {
    return NextResponse.json(
      {
        duplicate: true,
        error: "This comparison already exists.",
        existingSlug: duplicate.status === "APPROVED" ? duplicate.slug : null,
      },
      { status: 409 }
    );
  }

  const slug = await generateUniqueSlug(genericProductName, nameBrandProductName);

  const comparison = await prisma.productComparison.create({
    data: {
      slug,
      genericProductName,
      genericBrand,
      genericStore,
      genericPrice,
      genericSize,
      nameBrandProductName,
      nameBrand,
      nameBrandPrice,
      nameBrandSize,
      categoryId,
      status: "PENDING",
      verdict: "PENDING",
      confidenceScore: 0,
      totalVotes: 0,
      submittedById: session.user.id,
      ...(evidenceTitle && evidenceContent
        ? {
            evidence: {
              create: {
                userId: session.user.id,
                type: "OTHER",
                title: evidenceTitle,
                content: evidenceContent,
                status: "PENDING",
                confidence: "UNVERIFIED",
              },
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ comparison }, { status: 201 });
}
