import { describe, it, expect, beforeEach, vi } from "vitest";
import { asMock, prismaMock } from "@/test/mock-prisma";

// Import route handlers after mock is set up
import { GET as getList } from "../route";
import { GET as getSingle } from "../[slug]/route";
import { NextRequest } from "next/server";
import { makeCategory, makeComparison, makeEvidence } from "@/test/fixtures";

const makeRequest = (url: string) => new NextRequest(`http://localhost${url}`);

const mockCategory = makeCategory();

const mockComparison = {
  ...makeComparison({
    slug: "generic-cereal-vs-kelloggs",
    genericPrice: null,
    nameBrandPrice: null,
    verdict: "SAME_QUALITY",
    confidenceScore: 80,
    totalVotes: 40,
    submittedById: null,
  }),
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

    // Matches the verdict shoppers see: the community verdict, or the
    // research verdict while the community verdict is still pending.
    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "APPROVED",
          OR: [{ verdict: "SAME_QUALITY" }, { verdict: "PENDING", editorialVerdict: "SAME_QUALITY" }],
        }),
      })
    );
  });

  it("ignores unknown verdict values", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    await getList(makeRequest("/api/comparisons?verdict=BOGUS"));

    const where = prismaMock.productComparison.findMany.mock.calls[0][0]?.where;
    expect(where).toEqual({ status: "APPROVED" });
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
  const mockEvidence = [makeEvidence({ type: "PHOTO", title: "Side by side comparison", content: "They look identical" })];

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
    prismaMock.productComparison.findUnique.mockResolvedValue(fullComparison as never);
    asMock(prismaMock.vote.groupBy).mockResolvedValue(mockVoteBreakdown as never);

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

  it("only includes approved evidence", async () => {
    prismaMock.productComparison.findUnique.mockResolvedValue({ ...mockComparison, evidence: [] } as never);
    asMock(prismaMock.vote.groupBy).mockResolvedValue([] as never);

    await getSingle(makeRequest("/api/comparisons/generic-cereal-vs-kelloggs"), {
      params: Promise.resolve({ slug: "generic-cereal-vs-kelloggs" }),
    });

    const args = prismaMock.productComparison.findUnique.mock.calls[0][0] as { include: { evidence: { where: unknown } } };
    expect(args.include.evidence.where).toEqual({ status: "APPROVED" });
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
      pendingComparison as never
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
