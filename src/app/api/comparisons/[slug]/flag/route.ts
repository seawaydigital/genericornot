import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const FLAG_THRESHOLD = 3;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;

  const comparison = await prisma.productComparison.findUnique({
    where: { slug },
    select: { id: true, flagCount: true, flaggedOutdated: true },
  });

  if (!comparison) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  const newFlagCount = comparison.flagCount + 1;
  const shouldFlag = newFlagCount >= FLAG_THRESHOLD;

  const updated = await prisma.productComparison.update({
    where: { id: comparison.id },
    data: {
      flagCount: newFlagCount,
      flaggedOutdated: shouldFlag || comparison.flaggedOutdated,
    },
    select: { flagCount: true, flaggedOutdated: true },
  });

  return NextResponse.json({
    flagCount: updated.flagCount,
    flaggedOutdated: updated.flaggedOutdated,
  });
}
