import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { evidenceLimiter } from "@/lib/rate-limit";
import { LIMITS, cleanMultiline, cleanText, isSafeHttpUrl, type FieldErrors } from "@/lib/validation";

const VALID_EVIDENCE_TYPES = [
  "MANUFACTURER_INFO",
  "INGREDIENT_COMPARISON",
  "PHOTO",
  "VIDEO_LINK",
  "OTHER",
] as const;
type EvidenceType = (typeof VALID_EVIDENCE_TYPES)[number];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to add evidence." }, { status: 401 });
  }

  const rateLimit = evidenceLimiter.check(session.user.id);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "You've added a lot of evidence recently — please try again later." },
      { status: 429 }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { comparisonId, type } = data;

  if (!comparisonId || typeof comparisonId !== "string") {
    return NextResponse.json({ error: "comparisonId is required" }, { status: 400 });
  }

  if (!type || typeof type !== "string") {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  if (!VALID_EVIDENCE_TYPES.includes(type as EvidenceType)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_EVIDENCE_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const errors: FieldErrors = {};
  const title = cleanText(data.title);
  const content = cleanMultiline(data.content);
  const rawUrl = cleanText(data.url);

  if (!title) errors.title = "title is required";
  else if (title.length > LIMITS.evidenceTitle) errors.title = `Title must be ${LIMITS.evidenceTitle} characters or fewer`;

  if (!content) errors.content = "content is required";
  else if (content.length > LIMITS.evidenceContent) errors.content = `Details must be ${LIMITS.evidenceContent} characters or fewer`;

  if (rawUrl && !isSafeHttpUrl(rawUrl)) errors.url = "Link must be a full http:// or https:// web address";
  if (type === "VIDEO_LINK" && !rawUrl) errors.url = "A video link needs a URL";

  if (Object.keys(errors).length > 0) {
    // Keep a top-level `error` for simple clients and `errors` for forms.
    return NextResponse.json({ error: Object.values(errors)[0], errors }, { status: 400 });
  }

  const comparison = await prisma.productComparison.findUnique({
    where: { id: comparisonId },
    select: { id: true, status: true },
  });

  if (!comparison || comparison.status !== "APPROVED") {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  const evidence = await prisma.evidence.create({
    data: {
      comparisonId,
      userId: session.user.id,
      type: type as EvidenceType,
      title,
      content,
      url: rawUrl || undefined,
      // Held for review: claims about brands go public only after a moderator
      // approves them (Canada has no blanket safe harbour for user content).
      status: "PENDING",
      confidence: "UNVERIFIED",
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return NextResponse.json(
    { evidence, message: "Thanks! Your evidence will appear once a moderator reviews it." },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const comparisonId = searchParams.get("comparisonId");

  if (!comparisonId) {
    return NextResponse.json({ error: "comparisonId is required" }, { status: 400 });
  }

  const evidence = await prisma.evidence.findMany({
    where: { comparisonId, status: "APPROVED", comparison: { status: "APPROVED" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      url: true,
      confidence: true,
      createdAt: true,
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  return NextResponse.json({ evidence });
}
