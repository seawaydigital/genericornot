import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";
import { makeComparison, makeSession } from "@/test/fixtures";

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
  flagLimiter: { check: vi.fn(() => ({ success: true, remaining: 19, resetAt: new Date() })) },
}));

import { getServerSession } from "next-auth";
import { flagLimiter } from "@/lib/rate-limit";
const mockGetServerSession = vi.mocked(getServerSession);

import { POST } from "../[slug]/flag/route";

const params = { params: Promise.resolve({ slug: "life-brand-ibuprofen-vs-advil" }) };
const makeRequest = (body?: unknown) =>
  new NextRequest("http://localhost/api/comparisons/life-brand-ibuprofen-vs-advil/flag", {
    method: "POST",
    ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });

describe("POST /api/comparisons/[slug]/flag", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(flagLimiter.check).mockReturnValue({ success: true, remaining: 19, resetAt: new Date() });
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.productComparison.findUnique.mockResolvedValue(makeComparison());
    prismaMock.productComparison.update.mockImplementation((async (args: { data: { flagCount: number; flaggedOutdated: boolean } }) => ({
      flagCount: args.data.flagCount,
      flaggedOutdated: args.data.flaggedOutdated,
    })) as never);
  });

  it("requires sign-in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makeRequest(), params);
    expect(res.status).toBe(401);
  });

  it("is rate limited", async () => {
    vi.mocked(flagLimiter.check).mockReturnValue({ success: false, remaining: 0, resetAt: new Date() });
    const res = await POST(makeRequest(), params);
    expect(res.status).toBe(429);
  });

  it("returns 404 for unknown or non-approved comparisons", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue(makeComparison({ status: "ARCHIVED" }));
    const res = await POST(makeRequest(), params);
    expect(res.status).toBe(404);
    expect(prismaMock.comparisonFlag.create).not.toHaveBeenCalled();
  });

  it("records one flag per user with an optional reason", async () => {
    prismaMock.comparisonFlag.count.mockResolvedValue(1);
    const res = await POST(makeRequest({ reason: "  Price went up  " }), params);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(prismaMock.comparisonFlag.create).toHaveBeenCalledWith({
      data: { userId: "user-1", comparisonId: "comp-1", reason: "Price went up" },
    });
    expect(body).toEqual({ alreadyFlagged: false, flagCount: 1, flaggedOutdated: false });
  });

  it("does not count the same user twice", async () => {
    prismaMock.comparisonFlag.create.mockRejectedValue(Object.assign(new Error("Unique constraint"), { code: "P2002" }));
    prismaMock.comparisonFlag.count.mockResolvedValue(1);

    const res = await POST(makeRequest(), params);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.alreadyFlagged).toBe(true);
    expect(body.flagCount).toBe(1);
  });

  it("marks the comparison outdated once three different people flag it", async () => {
    prismaMock.comparisonFlag.count.mockResolvedValue(3);
    const res = await POST(makeRequest(), params);
    const body = await res.json();

    expect(body.flaggedOutdated).toBe(true);
    expect(prismaMock.productComparison.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { flagCount: 3, flaggedOutdated: true } })
    );
  });

  it("rethrows unexpected database errors", async () => {
    prismaMock.comparisonFlag.create.mockRejectedValue(new Error("connection lost"));
    await expect(POST(makeRequest(), params)).rejects.toThrow("connection lost");
  });
});
