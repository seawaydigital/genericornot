import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth";
const mockGetServerSession = vi.mocked(getServerSession);

import { GET, POST } from "../route";

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeGetRequest = (comparisonId: string) =>
  new NextRequest(`http://localhost/api/votes?comparisonId=${comparisonId}`, {
    method: "GET",
  });

const mockSession = {
  user: {
    id: "user-1",
    name: "Test User",
    email: "test@test.com",
    role: "USER",
    username: "test-123",
  },
  expires: "2099-01-01",
};

const mockApprovedComparison = {
  id: "comp-1",
  slug: "generic-cereal-vs-frosted-flakes",
  genericProductName: "Generic Cereal",
  genericBrand: "Store Brand",
  genericStore: "Walmart",
  genericPrice: 2.99,
  genericImageUrl: null,
  nameBrandProductName: "Frosted Flakes",
  nameBrand: "Kellogg's",
  nameBrandPrice: 4.99,
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

const mockVote = {
  id: "vote-1",
  userId: "user-1",
  comparisonId: "comp-1",
  value: "SAME_QUALITY" as const,
  createdAt: new Date("2026-04-05"),
  updatedAt: new Date("2026-04-05"),
};

describe("POST /api/votes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it("returns 400 for missing comparisonId", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({ value: "SAME_QUALITY" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 for missing vote value", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({ comparisonId: "comp-1" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 for invalid vote value", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = makePostRequest({ comparisonId: "comp-1", value: "INVALID_VALUE" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 404 for non-existent comparison", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(null);

    const req = makePostRequest({ comparisonId: "nonexistent", value: "SAME_QUALITY" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
  });

  it("returns 404 for non-APPROVED comparison", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.productComparison.findUnique.mockResolvedValue({
      ...mockApprovedComparison,
      status: "PENDING" as const,
    });

    const req = makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
  });

  it("casts a new vote and returns updated verdict", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(mockApprovedComparison);
    prismaMock.vote.upsert.mockResolvedValue(mockVote);
    prismaMock.vote.groupBy.mockResolvedValue([
      { value: "SAME_QUALITY", _count: 3 },
      { value: "CLOSE_ENOUGH", _count: 1 },
      { value: "NOT_WORTH_IT", _count: 1 },
    ] as never);
    prismaMock.productComparison.update.mockResolvedValue({
      ...mockApprovedComparison,
      verdict: "PENDING" as const,
      confidenceScore: 0,
      totalVotes: 5,
    });

    const req = makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.verdict).toBeDefined();
    expect(body.totalVotes).toBe(5);
    expect(body.vote).toBeDefined();
    expect(body.vote.value).toBe("SAME_QUALITY");

    expect(prismaMock.vote.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_comparisonId: { userId: "user-1", comparisonId: "comp-1" } },
        create: expect.objectContaining({ value: "SAME_QUALITY", userId: "user-1", comparisonId: "comp-1" }),
        update: expect.objectContaining({ value: "SAME_QUALITY" }),
      })
    );
  });

  it("changes existing vote (upsert) and verdict recomputes", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(mockApprovedComparison);
    prismaMock.vote.upsert.mockResolvedValue({ ...mockVote, value: "NOT_WORTH_IT" as const });
    prismaMock.vote.groupBy.mockResolvedValue([
      { value: "SAME_QUALITY", _count: 2 },
      { value: "NOT_WORTH_IT", _count: 5 },
    ] as never);
    prismaMock.productComparison.update.mockResolvedValue({
      ...mockApprovedComparison,
      verdict: "NOT_WORTH_IT" as const,
      confidenceScore: 71,
      totalVotes: 7,
    });

    const req = makePostRequest({ comparisonId: "comp-1", value: "NOT_WORTH_IT" });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.verdict).toBe("NOT_WORTH_IT");
    expect(body.vote.value).toBe("NOT_WORTH_IT");

    expect(prismaMock.productComparison.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "comp-1" },
        data: expect.objectContaining({
          verdict: "NOT_WORTH_IT",
        }),
      })
    );
  });
});

describe("GET /api/votes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makeGetRequest("comp-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when comparisonId is missing", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);

    const req = new NextRequest("http://localhost/api/votes", { method: "GET" });
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns user's existing vote for a comparison", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.vote.findUnique.mockResolvedValue(mockVote);

    const req = makeGetRequest("comp-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.vote).toBeDefined();
    expect(body.vote.value).toBe("SAME_QUALITY");
    expect(body.vote.userId).toBe("user-1");

    expect(prismaMock.vote.findUnique).toHaveBeenCalledWith({
      where: { userId_comparisonId: { userId: "user-1", comparisonId: "comp-1" } },
    });
  });

  it("returns null when user hasn't voted on a comparison", async () => {
    mockGetServerSession.mockResolvedValue(mockSession);
    prismaMock.vote.findUnique.mockResolvedValue(null);

    const req = makeGetRequest("comp-1");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.vote).toBeNull();
  });
});
