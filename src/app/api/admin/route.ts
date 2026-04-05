import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

const VALID_ACTIONS = ["approve", "reject"] as const;
type AdminAction = (typeof VALID_ACTIONS)[number];

export async function GET(_req: NextRequest) {
  const result = await requireAdmin();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const comparisons = await prisma.productComparison.findMany({
    where: { status: "PENDING" },
    include: {
      submittedBy: true,
      category: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ comparisons });
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

  const { action, comparisonId, reason } = data;

  if (!action || !VALID_ACTIONS.includes(action as AdminAction)) {
    return NextResponse.json(
      { error: `action must be one of: ${VALID_ACTIONS.join(", ")}` },
      { status: 400 }
    );
  }

  if (!comparisonId || typeof comparisonId !== "string") {
    return NextResponse.json(
      { error: "comparisonId is required" },
      { status: 400 }
    );
  }

  const existing = await prisma.productComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  if (action === "approve") {
    const comparison = await prisma.productComparison.update({
      where: { id: comparisonId },
      data: { status: "APPROVED" },
    });

    await prisma.category.update({
      where: { id: existing.categoryId },
      data: { comparisonCount: { increment: 1 } },
    });

    return NextResponse.json({ comparison });
  }

  // action === "reject"
  const comparison = await prisma.productComparison.update({
    where: { id: comparisonId },
    data: {
      status: "REJECTED",
      rejectionReason: typeof reason === "string" ? reason : null,
    },
  });

  return NextResponse.json({ comparison });
}
