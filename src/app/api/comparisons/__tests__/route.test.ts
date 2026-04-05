import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";

// Import route handlers after mock is set up
import { GET as getList } from "../route";
import { GET as getSingle } from "../[slug]/route";
import { NextRequest } from "next/server";

const makeRequest = (url: string) => new NextRequest(`http://localhost${url}`);

const mockCategory = {
  id: "cat-1",
  name: "Grocery",
  slug: "grocery",
  icon: "🛒",
  comparisonCount: 5,
};

const mockComparison = {
  id: "comp-1",
  slug: "generic-cereal-vs-kelloggs",
  genericProductName: "Store Cereal",
  genericBrand: "Great Value",
  genericStore: "Walmart",
  genericPrice: null,
  genericImageUrl: null,
  nameBrandProductName: "Frosted Flakes",
  nameBrand: "Kellogg's",
  nameBrandPrice: null,
  nameBrandImageUrl: null,
  categoryId: "cat-1",
  verdict: "SAME_QUALITY" as const,
  confidenceScore: 80,
  totalVotes: 40,
  status: "APPROVED" as const,
  rejectionReason: null,
  submittedById: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  category: mockCategory,
};

describe("GET /api/comparisons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated APPROVED comparisons with defaults", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/comparisons");
    const res = await getList(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comparisons).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(1);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "APPROVED" }),
        skip: 0,
        take: 20,
        orderBy: { totalVotes: "desc" },
      })
    );
  });

  it("filters by categoryId", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/comparisons?categoryId=cat-1");
    await getList(req);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "APPROVED",
          categoryId: "cat-1",
        }),
      })
    );
  });

  it("filters by verdict", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/comparisons?verdict=SAME_QUALITY");
    await getList(req);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "APPROVED",
          verdict: "SAME_QUALITY",
        }),
      })
    );
  });

  it("sorts by createdAt when specified", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/comparisons?sort=createdAt");
    await getList(req);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: "desc" },
      })
    );
  });

  it("sorts by confidenceScore when specified", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/comparisons?sort=confidenceScore");
    await getList(req);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { confidenceScore: "desc" },
      })
    );
  });

  it("respects page and limit params", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([]);
    prismaMock.productComparison.count.mockResolvedValue(50);

    const req = makeRequest("/api/comparisons?page=3&limit=10");
    const res = await getList(req);
    const body = await res.json();

    expect(body.page).toBe(3);
    expect(body.totalPages).toBe(5);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 20,
        take: 10,
      })
    );
  });
});

describe("GET /api/comparisons/[slug]", () => {
  const mockEvidence = [
    {
      id: "ev-1",
      comparisonId: "comp-1",
      userId: "user-1",
      type: "PHOTO" as const,
      title: "Side by side comparison",
      content: "They look identical",
      url: null,
      imageUrl: null,
      createdAt: new Date("2026-01-02"),
    },
  ];

  const mockVoteBreakdown = [
    { value: "SAME_QUALITY" as const, _count: { value: 30 } },
    { value: "CLOSE_ENOUGH" as const, _count: { value: 8 } },
    { value: "NOT_WORTH_IT" as const, _count: { value: 2 } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns comparison with category, evidence, and vote breakdown", async () => {
    const fullComparison = { ...mockComparison, evidence: mockEvidence };
    prismaMock.productComparison.findUnique.mockResolvedValue(fullComparison);
    prismaMock.vote.groupBy.mockResolvedValue(mockVoteBreakdown as any);

    const req = makeRequest("/api/comparisons/generic-cereal-vs-kelloggs");
    const res = await getSingle(req, {
      params: Promise.resolve({ slug: "generic-cereal-vs-kelloggs" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.comparison.slug).toBe("generic-cereal-vs-kelloggs");
    expect(body.comparison.category).toEqual(mockCategory);
    expect(body.comparison.evidence).toHaveLength(1);
    expect(body.voteBreakdown).toEqual(mockVoteBreakdown);
  });

  it("returns 404 for non-existent slug", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue(null);

    const req = makeRequest("/api/comparisons/does-not-exist");
    const res = await getSingle(req, {
      params: Promise.resolve({ slug: "does-not-exist" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
  });

  it("returns 404 for non-APPROVED comparison", async () => {
    const pendingComparison = {
      ...mockComparison,
      status: "PENDING" as const,
      evidence: [],
    };
    prismaMock.productComparison.findUnique.mockResolvedValue(
      pendingComparison
    );

    const req = makeRequest("/api/comparisons/generic-cereal-vs-kelloggs");
    const res = await getSingle(req, {
      params: Promise.resolve({ slug: "generic-cereal-vs-kelloggs" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBeDefined();
  });
});
