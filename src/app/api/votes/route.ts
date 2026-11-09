import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeVerdict, tallyVotes } from "@/lib/verdict";
import { voteLimiter } from "@/lib/rate-limit";

const VALID_VOTE_VALUES = ["SAME_QUALITY", "CLOSE_ENOUGH", "NOT_WORTH_IT"] as const;
type VoteValue = (typeof VALID_VOTE_VALUES)[number];

/**
 * Optional anti-brigading delay: new accounts must exist this many minutes
 * before their votes count. Defaults to 0 (off) because at launch every
 * visitor is a brand-new account and a delay at the moment of first intent
 * loses them. Raise it (e.g. 60) via env var if coordinated voting appears.
 */
function minAccountAgeMinutes(): number {
  const raw = Number(process.env.VOTE_MIN_ACCOUNT_AGE_MINUTES ?? "0");
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

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
    return NextResponse.json({ error: "Sign in to vote." }, { status: 401 });
  }

  const rateLimit = voteLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "You're voting very quickly — please wait a minute and try again." },
      { status: 429 }
    );
  }

  const minAge = minAccountAgeMinutes();
  if (minAge > 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const ageMs = Date.now() - new Date(user.createdAt).getTime();
    if (ageMs < minAge * 60 * 1000) {
      const waitMinutes = Math.ceil(minAge - ageMs / 60000);
      return NextResponse.json(
        {
          error: `New accounts can vote after ${minAge} minutes. Please try again in about ${waitMinutes} minute${waitMinutes === 1 ? "" : "s"}.`,
        },
        { status: 403 }
      );
    }
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
    select: { id: true, slug: true, status: true },
  });

  if (!comparison || comparison.status !== "APPROVED") {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  const vote = await prisma.vote.upsert({
    where: { userId_comparisonId: { userId: session.user.id, comparisonId } },
    create: { userId: session.user.id, comparisonId, value: value as VoteValue },
    update: { value: value as VoteValue },
  });

  // Recount from the Vote table every time: the stored tally is a cache of
  // real votes and can never drift from them.
  const voteCounts = await prisma.vote.groupBy({
    by: ["value"],
    where: { comparisonId },
    _count: true,
  });

  const counts = tallyVotes(voteCounts.map((vc) => ({ value: vc.value, count: vc._count })));
  const result = computeVerdict(counts);

  await prisma.productComparison.update({
    where: { id: comparisonId },
    data: {
      verdict: result.verdict,
      confidenceScore: result.confidenceScore,
      totalVotes: result.totalVotes,
    },
  });

  // Comparison pages are cached (ISR); refresh this one so the next visitor
  // sees the new tally immediately.
  revalidatePath(`/compare/${comparison.slug}`);

  return NextResponse.json({
    vote,
    verdict: result.verdict,
    confidenceScore: result.confidenceScore,
    totalVotes: result.totalVotes,
    counts,
  });
}
