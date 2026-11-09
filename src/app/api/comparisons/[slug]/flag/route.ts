import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { flagLimiter } from "@/lib/rate-limit";
import { LIMITS, cleanText } from "@/lib/validation";

/** Distinct users who must flag a comparison before it shows as outdated. */
export const FLAG_THRESHOLD = 3;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to report an outdated comparison." }, { status: 401 });
  }

  const rateLimit = flagLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many reports — please try again later." }, { status: 429 });
  }

  // Body is optional; an empty POST is a flag without a reason.
  let reason: string | null = null;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    reason = cleanText(body?.reason).slice(0, LIMITS.reason) || null;
  } catch {
    reason = null;
  }

  const { slug } = await params;

  const comparison = await prisma.productComparison.findUnique({
    where: { slug },
    select: { id: true, status: true, flaggedOutdated: true },
  });

  if (!comparison || comparison.status !== "APPROVED") {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  let alreadyFlagged = false;
  try {
    await prisma.comparisonFlag.create({
      data: { userId: session.user.id, comparisonId: comparison.id, reason },
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      alreadyFlagged = true;
    } else {
      throw error;
    }
  }

  const flagCount = await prisma.comparisonFlag.count({
    where: { comparisonId: comparison.id },
  });
  const flaggedOutdated = flagCount >= FLAG_THRESHOLD;

  const updated = await prisma.productComparison.update({
    where: { id: comparison.id },
    data: { flagCount, flaggedOutdated },
    select: { flagCount: true, flaggedOutdated: true },
  });

  if (updated.flaggedOutdated !== comparison.flaggedOutdated) {
    revalidatePath(`/compare/${slug}`);
  }

  return NextResponse.json({
    alreadyFlagged,
    flagCount: updated.flagCount,
    flaggedOutdated: updated.flaggedOutdated,
  });
}
