import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { asMock, prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";
import { makeComparison, makeSession, makeUser, makeVote } from "@/test/fixtures";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  voteLimiter: { check: vi.fn(() => ({ success: true, remaining: 9, resetAt: new Date() })) },
}));

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { voteLimiter } from "@/lib/rate-limit";
const mockGetServerSession = vi.mocked(getServerSession);

import { GET, POST } from "../route";

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/votes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeGetRequest = (comparisonId: string) =>
  new NextRequest(`http://localhost/api/votes?comparisonId=${comparisonId}`, { method: "GET" });

const approved = makeComparison({ id: "comp-1", slug: "life-brand-ibuprofen-vs-advil", status: "APPROVED" });

describe("POST /api/votes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.VOTE_MIN_ACCOUNT_AGE_MINUTES;
    vi.mocked(voteLimiter.check).mockReturnValue({ success: true, remaining: 9, resetAt: new Date() });
  });

  afterEach(() => {
    delete process.env.VOTE_MIN_ACCOUNT_AGE_MINUTES;
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBeDefined();
  });

  it("returns 429 with a readable message when rate limited", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    vi.mocked(voteLimiter.check).mockReturnValue({ success: false, remaining: 0, resetAt: new Date() });
    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/wait a minute/i);
  });

  it("returns 400 for missing comparisonId", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ value: "SAME_QUALITY" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for missing vote value", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ comparisonId: "comp-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid vote value", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "INVALID_VALUE" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent comparison", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest({ comparisonId: "nonexistent", value: "SAME_QUALITY" }));
    expect(res.status).toBe(404);
  });

  it("returns 404 for a comparison that isn't approved", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(makeComparison({ status: "ARCHIVED" }));
    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    expect(res.status).toBe(404);
    expect(prismaMock.vote.upsert).not.toHaveBeenCalled();
  });

  it("does not check account age by default (new accounts can vote right away)", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(approved);
    prismaMock.vote.upsert.mockResolvedValue(makeVote());
    asMock(prismaMock.vote.groupBy).mockResolvedValue([{ value: "SAME_QUALITY", _count: 1 }] as never);
    prismaMock.productComparison.update.mockResolvedValue(approved);

    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    expect(res.status).toBe(200);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("enforces VOTE_MIN_ACCOUNT_AGE_MINUTES with a clear message", async () => {
    process.env.VOTE_MIN_ACCOUNT_AGE_MINUTES = "60";
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ createdAt: new Date(Date.now() - 10 * 60 * 1000) }));

    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toMatch(/after 60 minutes/);
    expect(body.error).toMatch(/50 minutes/);
    expect(prismaMock.vote.upsert).not.toHaveBeenCalled();
  });

  it("lets accounts older than the configured age vote", async () => {
    process.env.VOTE_MIN_ACCOUNT_AGE_MINUTES = "60";
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.user.findUnique.mockResolvedValue(makeUser({ createdAt: new Date("2025-01-01") }));
    prismaMock.productComparison.findUnique.mockResolvedValue(approved);
    prismaMock.vote.upsert.mockResolvedValue(makeVote());
    asMock(prismaMock.vote.groupBy).mockResolvedValue([{ value: "SAME_QUALITY", _count: 1 }] as never);
    prismaMock.productComparison.update.mockResolvedValue(approved);

    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    expect(res.status).toBe(200);
  });

  it("casts a vote, recounts from real votes and returns live counts", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(approved);
    prismaMock.vote.upsert.mockResolvedValue(makeVote());
    asMock(prismaMock.vote.groupBy).mockResolvedValue([
      { value: "SAME_QUALITY", _count: 3 },
      { value: "CLOSE_ENOUGH", _count: 1 },
      { value: "NOT_WORTH_IT", _count: 1 },
    ] as never);
    prismaMock.productComparison.update.mockResolvedValue(approved);

    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "SAME_QUALITY" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.vote.value).toBe("SAME_QUALITY");
    expect(body.totalVotes).toBe(5);
    expect(body.verdict).toBe("SAME_QUALITY");
    expect(body.counts).toEqual({ sameQuality: 3, closeEnough: 1, notWorthIt: 1 });

    expect(prismaMock.vote.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_comparisonId: { userId: "user-1", comparisonId: "comp-1" } },
        create: expect.objectContaining({ value: "SAME_QUALITY", userId: "user-1", comparisonId: "comp-1" }),
        update: expect.objectContaining({ value: "SAME_QUALITY" }),
      })
    );
    expect(prismaMock.productComparison.update).toHaveBeenCalledWith({
      where: { id: "comp-1" },
      data: { verdict: "SAME_QUALITY", confidenceScore: 6, totalVotes: 5 },
    });
  });

  it("revalidates the cached comparison page", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(approved);
    prismaMock.vote.upsert.mockResolvedValue(makeVote());
    asMock(prismaMock.vote.groupBy).mockResolvedValue([] as never);
    prismaMock.productComparison.update.mockResolvedValue(approved);

    await POST(makePostRequest({ comparisonId: "comp-1", value: "CLOSE_ENOUGH" }));
    expect(revalidatePath).toHaveBeenCalledWith("/compare/life-brand-ibuprofen-vs-advil");
  });

  it("changes an existing vote (upsert) and recomputes the verdict", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(approved);
    prismaMock.vote.upsert.mockResolvedValue(makeVote({ value: "NOT_WORTH_IT" }));
    asMock(prismaMock.vote.groupBy).mockResolvedValue([
      { value: "SAME_QUALITY", _count: 2 },
      { value: "NOT_WORTH_IT", _count: 5 },
    ] as never);
    prismaMock.productComparison.update.mockResolvedValue(approved);

    const res = await POST(makePostRequest({ comparisonId: "comp-1", value: "NOT_WORTH_IT" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.verdict).toBe("NOT_WORTH_IT");
    expect(body.vote.value).toBe("NOT_WORTH_IT");
  });
});

describe("GET /api/votes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET(makeGetRequest("comp-1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when comparisonId is missing", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await GET(new NextRequest("http://localhost/api/votes", { method: "GET" }));
    expect(res.status).toBe(400);
  });

  it("returns user's existing vote for a comparison", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.vote.findUnique.mockResolvedValue(makeVote());
    const res = await GET(makeGetRequest("comp-1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.vote.value).toBe("SAME_QUALITY");
  });

  it("returns null vote when user has not voted", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.vote.findUnique.mockResolvedValue(null);
    const res = await GET(makeGetRequest("comp-1"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.vote).toBeNull();
  });
});
