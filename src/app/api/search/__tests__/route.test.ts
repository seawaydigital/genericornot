import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";

import { GET } from "../route";

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
  slug: "store-cereal-vs-frosted-flakes",
  genericProductName: "Store Cereal",
  genericBrand: "Great Value",
  genericStore: "Walmart",
  genericPrice: 2.99,
  genericImageUrl: null,
  nameBrandProductName: "Frosted Flakes",
  nameBrand: "Kellogg's",
  nameBrandPrice: 4.99,
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

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns search results for a valid query", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/search?q=cereal");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(1);
    expect(body.total).toBe(1);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(1);
  });

  it("returns 400 when query param is missing", async () => {
    const req = makeRequest("/api/search");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when query param is empty string", async () => {
    const req = makeRequest("/api/search?q=");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when query param is only whitespace", async () => {
    const req = makeRequest("/api/search?q=   ");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBeDefined();
  });

  it("returns empty results when no comparisons match", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([]);
    prismaMock.productComparison.count.mockResolvedValue(0);

    const req = makeRequest("/api/search?q=nonexistentproductxyz");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(0);
    expect(body.total).toBe(0);
  });

  it("respects page and limit query params", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([]);
    prismaMock.productComparison.count.mockResolvedValue(50);

    const req = makeRequest("/api/search?q=cereal&page=2&limit=10");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.page).toBe(2);
    expect(body.totalPages).toBe(5);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('handles "X vs Y" query correctly', async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const req = makeRequest("/api/search?q=Store+Cereal+vs+Frosted+Flakes");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.results).toHaveLength(1);
  });
});
