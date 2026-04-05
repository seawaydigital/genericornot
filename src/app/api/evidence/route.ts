import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { comparisonId, type, title, content, url, imageUrl } = data;

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

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const comparison = await prisma.productComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) {
    return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
  }

  const evidence = await prisma.evidence.create({
    data: {
      comparisonId,
      userId: session.user.id,
      type: type as EvidenceType,
      title,
      content,
      url: typeof url === "string" ? url : undefined,
      imageUrl: typeof imageUrl === "string" ? imageUrl : undefined,
    },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({ evidence }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const comparisonId = searchParams.get("comparisonId");

  if (!comparisonId) {
    return NextResponse.json({ error: "comparisonId is required" }, { status: 400 });
  }

  const evidence = await prisma.evidence.findMany({
    where: { comparisonId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  return NextResponse.json({ evidence });
}
