import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";
import { makeComparison, makeEvidence, makeSession } from "@/test/fixtures";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/rate-limit", () => ({
  evidenceLimiter: { check: vi.fn(() => ({ success: true, remaining: 9, resetAt: new Date() })) },
}));

import { getServerSession } from "next-auth";
import { evidenceLimiter } from "@/lib/rate-limit";
const mockGetServerSession = vi.mocked(getServerSession);

import { GET, POST } from "../route";

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/evidence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeGetRequest = (comparisonId?: string) =>
  new NextRequest(
    comparisonId ? `http://localhost/api/evidence?comparisonId=${comparisonId}` : "http://localhost/api/evidence",
    { method: "GET" }
  );

const validBody = {
  comparisonId: "comp-1",
  type: "INGREDIENT_COMPARISON",
  title: "Same medicinal ingredient",
  content: "Both list ibuprofen 200 mg on the box.",
  url: "https://health-products.canada.ca/dpd-bdpp/",
};

describe("POST /api/evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(evidenceLimiter.check).mockReturnValue({ success: true, remaining: 9, resetAt: new Date() });
  });

  it("creates evidence as PENDING for moderation and returns 201", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(makeComparison());
    prismaMock.evidence.create.mockResolvedValue(makeEvidence({ status: "PENDING" }));

    const res = await POST(makePostRequest(validBody));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toMatch(/moderator/i);
    expect(prismaMock.evidence.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          comparisonId: "comp-1",
          userId: "user-1",
          type: "INGREDIENT_COMPARISON",
          title: "Same medicinal ingredient",
          url: "https://health-products.canada.ca/dpd-bdpp/",
          status: "PENDING",
          confidence: "UNVERIFIED",
        }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limited", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    vi.mocked(evidenceLimiter.check).mockReturnValue({ success: false, remaining: 0, resetAt: new Date() });
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 for invalid evidence type", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ ...validBody, type: "RUMOUR" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when title is missing or blank", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    for (const title of [undefined, "   "]) {
      const res = await POST(makePostRequest({ ...validBody, title }));
      expect(res.status).toBe(400);
    }
  });

  it("returns 400 when content is missing", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ ...validBody, content: "" }));
    expect(res.status).toBe(400);
  });

  it("rejects overly long titles and content", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    let res = await POST(makePostRequest({ ...validBody, title: "x".repeat(121) }));
    expect(res.status).toBe(400);
    res = await POST(makePostRequest({ ...validBody, content: "x".repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it.each(["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "ftp://example.com/x", "not a url"])(
    "rejects unsafe or invalid link %s",
    async (url) => {
      mockGetServerSession.mockResolvedValue(makeSession());
      const res = await POST(makePostRequest({ ...validBody, url }));
      const body = await res.json();
      expect(res.status).toBe(400);
      expect(body.errors).toHaveProperty("url");
      expect(prismaMock.evidence.create).not.toHaveBeenCalled();
    }
  );

  it("requires a URL for video evidence", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ ...validBody, type: "VIDEO_LINK", url: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when comparisonId is missing", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ ...validBody, comparisonId: undefined }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent comparison", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 404 for comparisons that aren't approved", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(makeComparison({ status: "PENDING" }));
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(404);
    expect(prismaMock.evidence.create).not.toHaveBeenCalled();
  });
});

describe("GET /api/evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns only approved evidence on approved comparisons, newest first", async () => {
    prismaMock.evidence.findMany.mockResolvedValue([makeEvidence()] as never);

    const res = await GET(makeGetRequest("comp-1"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.evidence).toHaveLength(1);
    expect(prismaMock.evidence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { comparisonId: "comp-1", status: "APPROVED", comparison: { status: "APPROVED" } },
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("never exposes contributor names or emails", async () => {
    prismaMock.evidence.findMany.mockResolvedValue([] as never);
    await GET(makeGetRequest("comp-1"));
    const args = prismaMock.evidence.findMany.mock.calls[0][0] as { select: { user: { select: Record<string, boolean> } } };
    expect(args.select.user.select).toEqual({ username: true });
  });

  it("returns 400 when comparisonId is missing", async () => {
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(400);
  });
});
