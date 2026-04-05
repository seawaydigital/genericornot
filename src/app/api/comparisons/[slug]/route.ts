import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const comparison = await prisma.productComparison.findUnique({
    where: { slug },
    include: {
      category: true,
      evidence: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!comparison || comparison.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Comparison not found" },
      { status: 404 }
    );
  }

  const voteBreakdown = await prisma.vote.groupBy({
    by: ["value"],
    where: { comparisonId: comparison.id },
    _count: true,
  });

  return NextResponse.json({ comparison, voteBreakdown });
}
