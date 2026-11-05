import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { makeCategory, makeComparison } from "@/test/fixtures";
import { searchComparisons } from "../search";

const mockCategory = makeCategory();

const mockComparison = {
  ...makeComparison({
    slug: "store-cereal-vs-frosted-flakes",
    genericProductName: "Store Cereal",
    genericBrand: "Great Value",
    genericStore: "Walmart",
    nameBrandProductName: "Frosted Flakes",
    nameBrand: "Kellogg's",
    verdict: "SAME_QUALITY",
    confidenceScore: 80,
    totalVotes: 40,
    status: "APPROVED",
  }),
  category: mockCategory,
};

describe("searchComparisons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("finds matching comparisons for a single word query", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    const result = await searchComparisons("cereal");

    expect(result.results).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "APPROVED",
          OR: expect.arrayContaining([
            expect.objectContaining({ genericProductName: { contains: "cereal", mode: "insensitive" } }),
          ]),
        }),
      })
    );
  });

  it('parses "X vs Y" query into two search terms', async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    await searchComparisons("Store Cereal vs Frosted Flakes");

    const call = prismaMock.productComparison.findMany.mock.calls[0][0];
    const orConditions = (call as unknown as { where: { OR: Array<Record<string, { contains: string }>> } }).where.OR;

    // Should contain conditions for both "Store Cereal" and "Frosted Flakes"
    const allContainValues = orConditions.map((c) => Object.values(c)[0]).map((v) => v.contains);
    expect(allContainValues).toContain("Store Cereal");
    expect(allContainValues).toContain("Frosted Flakes");
  });

  it('parses "X vs. Y" query (with period) into two search terms', async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    await searchComparisons("ibuprofen vs. Advil");

    const call = prismaMock.productComparison.findMany.mock.calls[0][0];
    const orConditions = (call as unknown as { where: { OR: Array<Record<string, { contains: string }>> } }).where.OR;
    const allContainValues = orConditions.map((c) => Object.values(c)[0]).map((v) => v.contains);
    expect(allContainValues).toContain("ibuprofen");
    expect(allContainValues).toContain("Advil");
  });

  it("returns empty results when no comparisons match", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([]);
    prismaMock.productComparison.count.mockResolvedValue(0);

    const result = await searchComparisons("nonexistentproductxyz");

    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("only queries for APPROVED comparisons", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([]);
    prismaMock.productComparison.count.mockResolvedValue(0);

    await searchComparisons("cereal");

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "APPROVED" }),
      })
    );
    expect(prismaMock.productComparison.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "APPROVED" }),
      })
    );
  });

  it("paginates correctly on page 2", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([]);
    prismaMock.productComparison.count.mockResolvedValue(25);

    const result = await searchComparisons("cereal", 2, 10);

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(3);

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it("orders results by totalVotes descending", async () => {
    prismaMock.productComparison.findMany.mockResolvedValue([mockComparison]);
    prismaMock.productComparison.count.mockResolvedValue(1);

    await searchComparisons("cereal");

    expect(prismaMock.productComparison.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { totalVotes: "desc" },
      })
    );
  });
});
