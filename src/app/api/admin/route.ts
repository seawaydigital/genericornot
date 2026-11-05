import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { LIMITS, cleanText } from "@/lib/validation";

const COMPARISON_ACTIONS = ["approve", "reject", "archive", "restore", "markReviewed"] as const;
const EVIDENCE_ACTIONS = ["approveEvidence", "rejectEvidence"] as const;
const VALID_ACTIONS = [...COMPARISON_ACTIONS, ...EVIDENCE_ACTIONS] as const;
type AdminAction = (typeof VALID_ACTIONS)[number];

const EVIDENCE_CONFIDENCE = ["UNVERIFIED", "COMMUNITY", "CONFIRMED"] as const;
type EvidenceConfidence = (typeof EVIDENCE_CONFIDENCE)[number];

/** Recount instead of increment/decrement so the cached count can't drift. */
async function refreshCategoryCount(categoryId: string) {
  const count = await prisma.productComparison.count({
    where: { categoryId, status: "APPROVED" },
  });
  await prisma.category.update({
    where: { id: categoryId },
    data: { comparisonCount: count },
  });
}

function revalidateComparison(slug: string, categorySlug?: string | null) {
  revalidatePath(`/compare/${slug}`);
  revalidatePath("/");
  revalidatePath("/categories");
  if (categorySlug) revalidatePath(`/categories/${categorySlug}`);
}

export async function GET() {
  const result = await requireAdmin();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const [comparisons, evidence, flagged] = await Promise.all([
    prisma.productComparison.findMany({
      where: { status: "PENDING" },
      include: {
        submittedBy: { select: { username: true } },
        category: true,
        evidence: { where: { status: "PENDING" } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.evidence.findMany({
      where: { status: "PENDING", comparison: { status: "APPROVED" } },
      include: {
        user: { select: { username: true } },
        comparison: { select: { slug: true, genericProductName: true, nameBrandProductName: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.productComparison.findMany({
      where: { status: "APPROVED", flagCount: { gt: 0 } },
      include: { flags: { orderBy: { createdAt: "desc" }, take: 10 } },
      orderBy: { flagCount: "desc" },
    }),
  ]);

  return NextResponse.json({ comparisons, evidence, flagged });
}

export async function POST(req: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const action = data.action as AdminAction;
  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: `action must be one of: ${VALID_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  if ((EVIDENCE_ACTIONS as readonly string[]).includes(action)) {
    return handleEvidenceAction(action, data);
  }

  const { comparisonId } = data;
  if (!comparisonId || typeof comparisonId !== "string") {
    return NextResponse.json({ error: "comparisonId is required" }, { status: 400 });
  }

  const existing = await prisma.productComparison.findUnique({
    where: { id: comparisonId },
    include: { category: { select: { slug: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  let comparison;
  switch (action) {
    case "approve": {
      comparison = await prisma.productComparison.update({
        where: { id: comparisonId },
        data: { status: "APPROVED", rejectionReason: null, lastVerifiedAt: new Date() },
      });
      // Evidence submitted alongside the comparison was reviewed in the same card.
      if (existing.submittedById) {
        await prisma.evidence.updateMany({
          where: { comparisonId, userId: existing.submittedById, status: "PENDING" },
          data: { status: "APPROVED" },
        });
      }
      break;
    }
    case "reject": {
      const reason = cleanText(data.reason).slice(0, LIMITS.reason) || null;
      comparison = await prisma.productComparison.update({
        where: { id: comparisonId },
        data: { status: "REJECTED", rejectionReason: reason },
      });
      break;
    }
    case "archive": {
      comparison = await prisma.productComparison.update({
        where: { id: comparisonId },
        data: { status: "ARCHIVED" },
      });
      break;
    }
    case "restore": {
      if (existing.status !== "ARCHIVED") {
        return NextResponse.json({ error: "Only archived comparisons can be restored" }, { status: 400 });
      }
      comparison = await prisma.productComparison.update({
        where: { id: comparisonId },
        data: { status: "APPROVED" },
      });
      break;
    }
    case "markReviewed": {
      await prisma.comparisonFlag.deleteMany({ where: { comparisonId } });
      comparison = await prisma.productComparison.update({
        where: { id: comparisonId },
        data: { flagCount: 0, flaggedOutdated: false, lastVerifiedAt: new Date() },
      });
      break;
    }
    default:
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  if (existing.status !== comparison.status) {
    await refreshCategoryCount(existing.categoryId);
  }
  revalidateComparison(existing.slug, existing.category?.slug);

  return NextResponse.json({ comparison });
}

async function handleEvidenceAction(action: AdminAction, data: Record<string, unknown>) {
  const { evidenceId } = data;
  if (!evidenceId || typeof evidenceId !== "string") {
    return NextResponse.json({ error: "evidenceId is required" }, { status: 400 });
  }

  const existing = await prisma.evidence.findUnique({
    where: { id: evidenceId },
    include: { comparison: { select: { slug: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Evidence not found" }, { status: 404 });
  }

  const confidence: EvidenceConfidence = EVIDENCE_CONFIDENCE.includes(data.confidence as EvidenceConfidence)
    ? (data.confidence as EvidenceConfidence)
    : existing.confidence;

  const evidence = await prisma.evidence.update({
    where: { id: evidenceId },
    data:
      action === "approveEvidence"
        ? { status: "APPROVED", confidence }
        : { status: "REJECTED" },
  });

  revalidatePath(`/compare/${existing.comparison.slug}`);
  return NextResponse.json({ evidence });
}
