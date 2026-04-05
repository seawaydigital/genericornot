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

const makeGetRequest = () =>
  new NextRequest("http://localhost/api/admin", { method: "GET" });

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const mockAdminSession = {
  user: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@test.com",
    role: "ADMIN",
    username: "admin-123",
  },
  expires: "2099-01-01",
};

const mockUserSession = {
  user: {
    id: "user-1",
    name: "Regular User",
    email: "user@test.com",
    role: "USER",
    username: "user-456",
  },
  expires: "2099-01-01",
};

const mockCategory = {
  id: "cat-1",
  name: "Grocery",
  slug: "grocery",
  icon: "🛒",
  comparisonCount: 5,
};

const mockSubmittedBy = {
  id: "user-2",
  name: "Contributor",
  email: "contributor@test.com",
  emailVerified: null,
  image: null,
  username: "contributor-789",
  role: "USER" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockPendingComparison = {
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
  status: "PENDING" as const,
  rejectionReason: null,
  submittedById: "user-2",
  createdAt: new Date("2026-04-01"),
  updatedAt: new Date("2026-04-01"),
  submittedBy: mockSubmittedBy,
  category: mockCategory,
};

describe("GET /api/admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pending submissions for admin user", async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);
    prismaMock.productComparison.findMany.mockResolvedValue([
      mockPendingComparison,
    ]);

    const req = makeGetRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comparisons).toHaveLength(1);
    expect(body.comparisons[0].id).toBe("comp-1");
    expect(body.comparisons[0].status).toBe("PENDING");

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        include: expect.objectContaining({
          submittedBy: true,
          category: true,
        }),
      })
    );
  });

  it("returns 403 for non-admin user", async () => {
    mockGetServerSession.mockResolvedValue(mockUserSession);

    const req = makeGetRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBeDefined();
    expect(prismaMock.productComparison.findMany).not.toHaveBeenCalled();
  });

  it("returns 401 for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makeGetRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
    expect(prismaMock.productComparison.findMany).not.toHaveBeenCalled();
  });
});

describe("POST /api/admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approves a submission and increments category comparison count", async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(
      mockPendingComparison
    );
    const approvedComparison = {
      ...mockPendingComparison,
      status: "APPROVED" as const,
    };
    prismaMock.productComparison.update.mockResolvedValue(approvedComparison);
    prismaMock.category.update.mockResolvedValue({
      ...mockCategory,
      comparisonCount: 6,
    });

    const req = makePostRequest({
      action: "approve",
      comparisonId: "comp-1",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comparison.status).toBe("APPROVED");

    expect(prismaMock.productComparison.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "comp-1" },
        data: expect.objectContaining({ status: "APPROVED" }),
      })
    );

    expect(prismaMock.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cat-1" },
        data: { comparisonCount: { increment: 1 } },
      })
    );
  });

  it("rejects a submission with a reason", async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(
      mockPendingComparison
    );
    const rejectedComparison = {
      ...mockPendingComparison,
      status: "REJECTED" as const,
      rejectionReason: "Duplicate submission",
    };
    prismaMock.productComparison.update.mockResolvedValue(rejectedComparison);

    const req = makePostRequest({
      action: "reject",
      comparisonId: "comp-1",
      reason: "Duplicate submission",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comparison.status).toBe("REJECTED");
    expect(body.comparison.rejectionReason).toBe("Duplicate submission");

    expect(prismaMock.productComparison.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "comp-1" },
        data: expect.objectContaining({
          status: "REJECTED",
          rejectionReason: "Duplicate submission",
        }),
      })
    );

    expect(prismaMock.category.update).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid action", async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);

    const req = makePostRequest({
      action: "delete",
      comparisonId: "comp-1",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
    expect(prismaMock.productComparison.update).not.toHaveBeenCalled();
  });

  it("returns 404 for non-existent comparison", async () => {
    mockGetServerSession.mockResolvedValue(mockAdminSession);
    prismaMock.productComparison.findUnique.mockResolvedValue(null);

    const req = makePostRequest({
      action: "approve",
      comparisonId: "nonexistent",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
    expect(prismaMock.productComparison.update).not.toHaveBeenCalled();
  });

  it("returns 401 for unauthenticated request", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makePostRequest({
      action: "approve",
      comparisonId: "comp-1",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it("returns 403 for non-admin user", async () => {
    mockGetServerSession.mockResolvedValue(mockUserSession);

    const req = makePostRequest({
      action: "approve",
      comparisonId: "comp-1",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBeDefined();
  });
});
