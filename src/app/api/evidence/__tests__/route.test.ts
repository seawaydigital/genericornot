import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/rate-limit", () => ({
  evidenceLimiter: { check: vi.fn(() => ({ success: true, remaining: 9, resetAt: new Date() })) },
  voteLimiter: { check: vi.fn(() => ({ success: true, remaining: 9, resetAt: new Date() })) },
  submissionLimiter: { check: vi.fn(() => ({ success: true, remaining: 4, resetAt: new Date() })) },
}));

import { getServerSession } from "next-auth";
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
    comparisonId
      ? `http://localhost/api/evidence?comparisonId=${comparisonId}`
      : "http://localhost/api/evidence",
    { method: "GET" }
  );

const mockSession = {
  user: {
    id: "user-1",
    name: "Test User",
    email: "test@test.com",
    role: "USER",
    username: "testuser-123",
  },
  expires: "2099-01-01",
};

const mockComparison = {
  id: "comp-1",
  slug: "generic-ibuprofen-vs-advil",
  genericProductName: "Generic Ibuprofen",
  genericBrand: "Store Brand",
  genericStore: "CVS",
  genericPrice: 4.99,
  genericImageUrl: null,
  nameBrandProductName: "Advil",
  nameBrand: "Pfizer",
  nameBrandPrice: 9.99,
  nameBrandImageUrl: null,
  categoryId: "cat-1",
  verdict: "PENDING" as const,
  confidenceScore: 0,
  totalVotes: 0,
  status: "APPROVED" as const,
  rejectionReason: null,
  submittedById: "user-2",
  createdAt: new Date("2026-04-01"),
  updatedAt: new Date("2026-04-01"),
};

const mockEvidence = {
  id: "evidence-1",
  comparisonId: "comp-1",
  userId: "user-1",
  type: "MANUFACTURER_INFO" as const,
  title: "Same manufacturer confirmed",
  content: "According to the label, both products are manufactured at the same facility.",
  url: "https://example.com/source",
  imageUrl: null,
  createdAt: new Date("2026-04-05T10:00:00Z"),
};

const mockEvidenceWithUser = {
  ...mockEvidence,
  user: {
    name: "Test User",
    username: "testuser-123",
    image: null,
  },
};

describe("POST /api/evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates evidence when authenticated and returns 201", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(mockComparison);
    prismaMock.evidence.create.mockResolvedValue(mockEvidenceWithUser as never);

    const req = makePostRequest({
      comparisonId: "comp-1",
      type: "MANUFACTURER_INFO",
      title: "Same manufacturer confirmed",
      content: "According to the label, both products are manufactured at the same facility.",
      url: "https://example.com/source",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.evidence).toBeDefined();
    expect(body.evidence.type).toBe("MANUFACTURER_INFO");
    expect(body.evidence.title).toBe("Same manufacturer confirmed");

    expect(prismaMock.evidence.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          comparisonId: "comp-1",
          userId: "user-1",
          type: "MANUFACTURER_INFO",
          title: "Same manufacturer confirmed",
        }),
      })
    );
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makePostRequest({
      comparisonId: "comp-1",
      type: "MANUFACTURER_INFO",
      title: "Test title",
      content: "Test content",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it("returns 400 for invalid evidence type", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({
      comparisonId: "comp-1",
      type: "INVALID_TYPE",
      title: "Test title",
      content: "Test content",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({
      comparisonId: "comp-1",
      type: "OTHER",
      content: "Test content",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when content is missing", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({
      comparisonId: "comp-1",
      type: "OTHER",
      title: "Test title",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when comparisonId is missing", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({
      type: "OTHER",
      title: "Test title",
      content: "Test content",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 404 for non-existent comparison", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(null);

    const req = makePostRequest({
      comparisonId: "nonexistent",
      type: "MANUFACTURER_INFO",
      title: "Test title",
      content: "Test content",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
  });
});

describe("GET /api/evidence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns evidence sorted by createdAt desc with user info", async () => {
    const olderEvidence = {
      ...mockEvidenceWithUser,
      id: "evidence-2",
      title: "Older evidence",
      createdAt: new Date("2026-04-04T10:00:00Z"),
    };

    prismaMock.evidence.findMany.mockResolvedValue([
      mockEvidenceWithUser as never,
      olderEvidence as never,
    ]);

    const req = makeGetRequest("comp-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.evidence).toHaveLength(2);
    expect(body.evidence[0].id).toBe("evidence-1");
    expect(body.evidence[0].user).toBeDefined();
    expect(body.evidence[0].user.name).toBe("Test User");
    expect(body.evidence[0].user.username).toBe("testuser-123");

    expect(prismaMock.evidence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { comparisonId: "comp-1" },
        orderBy: { createdAt: "desc" },
        include: expect.objectContaining({
          user: expect.objectContaining({
            select: expect.objectContaining({
              name: true,
              username: true,
              image: true,
            }),
          }),
        }),
      })
    );
  });

  it("returns 400 when comparisonId is missing", async () => {
    const req = makeGetRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });
});
