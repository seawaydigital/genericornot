import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";
import { makeCategory, makeComparison, makeEvidence, makeSession } from "@/test/fixtures";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
const mockGetServerSession = vi.mocked(getServerSession);

import { GET, POST } from "../route";

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const adminSession = makeSession({ id: "admin-1", role: "ADMIN" });
const userSession = makeSession({ id: "user-1", role: "USER" });

const pending = {
  ...makeComparison({ id: "comp-1", status: "PENDING", submittedById: "user-2" }),
  category: { slug: "grocery" },
};

describe("GET /api/admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the three moderation queues for an admin", async () => {
    mockGetServerSession.mockResolvedValue(adminSession);
    prismaMock.productComparison.findMany
      .mockResolvedValueOnce([makeComparison({ status: "PENDING" })] as never)
      .mockResolvedValueOnce([makeComparison({ id: "flagged", flagCount: 2 })] as never);
    prismaMock.evidence.findMany.mockResolvedValue([makeEvidence({ status: "PENDING" })] as never);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comparisons).toHaveLength(1);
    expect(body.evidence).toHaveLength(1);
    expect(body.flagged).toHaveLength(1);
    expect(prismaMock.evidence.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PENDING", comparison: { status: "APPROVED" } } })
    );
  });

  it("returns 403 for non-admin user", async () => {
    mockGetServerSession.mockResolvedValue(userSession);
    const res = await GET();
    expect(res.status).toBe(403);
    expect(prismaMock.productComparison.findMany).not.toHaveBeenCalled();
  });

  it("returns 401 for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/admin — comparisons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(adminSession);
    prismaMock.productComparison.count.mockResolvedValue(7);
    prismaMock.category.update.mockResolvedValue(makeCategory());
  });

  it("approves a submission, marks it reviewed and recounts the category", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue(pending as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison({ status: "APPROVED" }));

    const res = await POST(makePostRequest({ action: "approve", comparisonId: "comp-1" }));
    expect(res.status).toBe(200);

    expect(prismaMock.productComparison.update).toHaveBeenCalledWith({
      where: { id: "comp-1" },
      data: expect.objectContaining({ status: "APPROVED", rejectionReason: null, lastVerifiedAt: expect.any(Date) }),
    });
    // Recount (not increment), so repeated approvals can't inflate the number.
    expect(prismaMock.productComparison.count).toHaveBeenCalledWith({ where: { categoryId: "cat-1", status: "APPROVED" } });
    expect(prismaMock.category.update).toHaveBeenCalledWith({ where: { id: "cat-1" }, data: { comparisonCount: 7 } });
    expect(revalidatePath).toHaveBeenCalledWith("/compare/generic-cereal-vs-frosted-flakes");
  });

  it("approves the submitter's attached evidence along with the comparison", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue(pending as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison({ status: "APPROVED" }));

    await POST(makePostRequest({ action: "approve", comparisonId: "comp-1" }));

    expect(prismaMock.evidence.updateMany).toHaveBeenCalledWith({
      where: { comparisonId: "comp-1", userId: "user-2", status: "PENDING" },
      data: { status: "APPROVED" },
    });
  });

  it("does not touch category counts when approving something already approved", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue({ ...pending, status: "APPROVED" } as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison({ status: "APPROVED" }));

    await POST(makePostRequest({ action: "approve", comparisonId: "comp-1" }));
    expect(prismaMock.category.update).not.toHaveBeenCalled();
  });

  it("rejects a submission with a trimmed reason", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue(pending as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison({ status: "REJECTED" }));

    const res = await POST(makePostRequest({ action: "reject", comparisonId: "comp-1", reason: "  Duplicate  " }));
    expect(res.status).toBe(200);
    expect(prismaMock.productComparison.update).toHaveBeenCalledWith({
      where: { id: "comp-1" },
      data: { status: "REJECTED", rejectionReason: "Duplicate" },
    });
  });

  it("archives an approved comparison and recounts the category", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue({ ...pending, status: "APPROVED" } as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison({ status: "ARCHIVED" }));

    const res = await POST(makePostRequest({ action: "archive", comparisonId: "comp-1" }));
    expect(res.status).toBe(200);
    expect(prismaMock.category.update).toHaveBeenCalled();
  });

  it("restores only archived comparisons", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue({ ...pending, status: "APPROVED" } as never);
    let res = await POST(makePostRequest({ action: "restore", comparisonId: "comp-1" }));
    expect(res.status).toBe(400);

    prismaMock.productComparison.findUnique.mockResolvedValue({ ...pending, status: "ARCHIVED" } as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison({ status: "APPROVED" }));
    res = await POST(makePostRequest({ action: "restore", comparisonId: "comp-1" }));
    expect(res.status).toBe(200);
  });

  it("marks a comparison reviewed: clears reports and stamps the date", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue({ ...pending, status: "APPROVED", flagCount: 3, flaggedOutdated: true } as never);
    prismaMock.productComparison.update.mockResolvedValue(makeComparison());

    const res = await POST(makePostRequest({ action: "markReviewed", comparisonId: "comp-1" }));
    expect(res.status).toBe(200);
    expect(prismaMock.comparisonFlag.deleteMany).toHaveBeenCalledWith({ where: { comparisonId: "comp-1" } });
    expect(prismaMock.productComparison.update).toHaveBeenCalledWith({
      where: { id: "comp-1" },
      data: { flagCount: 0, flaggedOutdated: false, lastVerifiedAt: expect.any(Date) },
    });
  });

  it("returns 400 for invalid action", async () => {
    const res = await POST(makePostRequest({ action: "delete", comparisonId: "comp-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for non-existent comparison", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest({ action: "approve", comparisonId: "missing" }));
    expect(res.status).toBe(404);
  });

  it("returns 401 for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makePostRequest({ action: "approve", comparisonId: "comp-1" }));
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin user", async () => {
    mockGetServerSession.mockResolvedValue(userSession);
    const res = await POST(makePostRequest({ action: "approve", comparisonId: "comp-1" }));
    expect(res.status).toBe(403);
    expect(prismaMock.productComparison.update).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin — evidence moderation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue(adminSession);
  });

  it("approves evidence with the chosen confidence tier", async () => {
    prismaMock.evidence.findUnique.mockResolvedValue({ ...makeEvidence({ status: "PENDING" }), comparison: { slug: "x" } } as never);
    prismaMock.evidence.update.mockResolvedValue(makeEvidence());

    const res = await POST(makePostRequest({ action: "approveEvidence", evidenceId: "ev-1", confidence: "COMMUNITY" }));
    expect(res.status).toBe(200);
    expect(prismaMock.evidence.update).toHaveBeenCalledWith({
      where: { id: "ev-1" },
      data: { status: "APPROVED", confidence: "COMMUNITY" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/compare/x");
  });

  it("ignores an invalid confidence value and keeps the existing one", async () => {
    prismaMock.evidence.findUnique.mockResolvedValue({ ...makeEvidence({ confidence: "UNVERIFIED" }), comparison: { slug: "x" } } as never);
    prismaMock.evidence.update.mockResolvedValue(makeEvidence());

    await POST(makePostRequest({ action: "approveEvidence", evidenceId: "ev-1", confidence: "TOTALLY_TRUE" }));
    expect(prismaMock.evidence.update).toHaveBeenCalledWith({
      where: { id: "ev-1" },
      data: { status: "APPROVED", confidence: "UNVERIFIED" },
    });
  });

  it("rejects evidence", async () => {
    prismaMock.evidence.findUnique.mockResolvedValue({ ...makeEvidence({ status: "PENDING" }), comparison: { slug: "x" } } as never);
    prismaMock.evidence.update.mockResolvedValue(makeEvidence({ status: "REJECTED" }));

    const res = await POST(makePostRequest({ action: "rejectEvidence", evidenceId: "ev-1" }));
    expect(res.status).toBe(200);
    expect(prismaMock.evidence.update).toHaveBeenCalledWith({ where: { id: "ev-1" }, data: { status: "REJECTED" } });
  });

  it("returns 400 without an evidenceId and 404 for unknown evidence", async () => {
    let res = await POST(makePostRequest({ action: "approveEvidence" }));
    expect(res.status).toBe(400);

    prismaMock.evidence.findUnique.mockResolvedValue(null);
    res = await POST(makePostRequest({ action: "approveEvidence", evidenceId: "nope" }));
    expect(res.status).toBe(404);
  });
});
