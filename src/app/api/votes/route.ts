import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeVerdict } from "@/lib/verdict";
import { voteLimiter } from "@/lib/rate-limit";

const VALID_VOTE_VALUES = ["SAME_QUALITY", "CLOSE_ENOUGH", "NOT_WORTH_IT"] as const;
type VoteValue = (typeof VALID_VOTE_VALUES)[number];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const comparisonId = searchParams.get("comparisonId");

  if (!comparisonId) {
    return NextResponse.json({ error: "comparisonId is required" }, { status: 400 });
  }

  const vote = await prisma.vote.findUnique({
    where: { userId_comparisonId: { userId: session.user.id, comparisonId } },
  });

  return NextResponse.json({ vote });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = voteLimiter.check(session.user.id);
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

  const { comparisonId, value } = data;

  if (!comparisonId || typeof comparisonId !== "string") {
    return NextResponse.json({ error: "comparisonId is required" }, { status: 400 });
  }

  if (!value || typeof value !== "string") {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }

  if (!VALID_VOTE_VALUES.includes(value as VoteValue)) {
    return NextResponse.json(
      { error: `value must be one of: ${VALID_VOTE_VALUES.join(", ")}` },
      { status: 400 }
    );
  }

  const comparison = await prisma.productComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison || comparison.status !== "APPROVED") {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  const vote = await prisma.vote.upsert({
    where: { userId_comparisonId: { userId: session.user.id, comparisonId } },
    create: { userId: session.user.id, comparisonId, value: value as VoteValue },
    update: { value: value as VoteValue },
  });

  const voteCounts = await prisma.vote.groupBy({
    by: ["value"],
    where: { comparisonId },
    _count: true,
  });

  const counts = { sameQuality: 0, closeEnough: 0, notWorthIt: 0 };
  voteCounts.forEach((vc) => {
    if (vc.value === "SAME_QUALITY") counts.sameQuality = vc._count;
    else if (vc.value === "CLOSE_ENOUGH") counts.closeEnough = vc._count;
    else if (vc.value === "NOT_WORTH_IT") counts.notWorthIt = vc._count;
  });

  const result = computeVerdict(counts);

  await prisma.productComparison.update({
    where: { id: comparisonId },
    data: {
      verdict: result.verdict,
      confidenceScore: result.confidenceScore,
      totalVotes: result.totalVotes,
    },
  });

  return NextResponse.json({
    vote,
    verdict: result.verdict,
    confidenceScore: result.confidenceScore,
    totalVotes: result.totalVotes,
  });
}
