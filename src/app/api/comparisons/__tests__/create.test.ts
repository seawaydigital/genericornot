import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "next-auth";
const mockGetServerSession = vi.mocked(getServerSession);

import { POST } from "../route";

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/comparisons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  genericProductName: "Great Value Cereal",
  genericBrand: "Great Value",
  genericStore: "Walmart",
  nameBrandProductName: "Frosted Flakes",
  nameBrand: "Kellogg's",
  categoryId: "cat-1",
};

const mockCreatedComparison = {
  id: "comp-new",
  slug: "great-value-cereal-vs-frosted-flakes",
  genericProductName: "Great Value Cereal",
  genericBrand: "Great Value",
  genericStore: "Walmart",
  genericPrice: null,
  genericImageUrl: null,
  nameBrandProductName: "Frosted Flakes",
  nameBrand: "Kellogg's",
  nameBrandPrice: null,
  nameBrandImageUrl: null,
  categoryId: "cat-1",
  verdict: "PENDING" as const,
  confidenceScore: 0,
  totalVotes: 0,
  status: "PENDING" as const,
  rejectionReason: null,
  submittedById: "user-1",
  createdAt: new Date("2026-04-05"),
  updatedAt: new Date("2026-04-05"),
};

describe("POST /api/comparisons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const req = makePostRequest(validBody);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeDefined();
  });

  it("returns 400 when required fields are missing", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test",
        email: "test@test.com",
        role: "USER",
        username: "test-123",
      },
      expires: "2099-01-01",
    });

    const incompleteBody = {
      genericProductName: "Great Value Cereal",
      // missing genericBrand, genericStore, nameBrandProductName, nameBrand, categoryId
    };

    const req = makePostRequest(incompleteBody);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.errors).toBeDefined();
    expect(body.errors).toHaveProperty("genericBrand");
    expect(body.errors).toHaveProperty("genericStore");
    expect(body.errors).toHaveProperty("nameBrandProductName");
    expect(body.errors).toHaveProperty("nameBrand");
    expect(body.errors).toHaveProperty("categoryId");
  });

  it("returns 400 for each individually missing required field", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test",
        email: "test@test.com",
        role: "USER",
        username: "test-123",
      },
      expires: "2099-01-01",
    });

    const requiredFields = [
      "genericProductName",
      "genericBrand",
      "genericStore",
      "nameBrandProductName",
      "nameBrand",
      "categoryId",
    ];

    for (const field of requiredFields) {
      const body = { ...validBody, [field]: "" };
      const req = makePostRequest(body);
      const res = await POST(req);
      const resBody = await res.json();

      expect(res.status).toBe(400);
      expect(resBody.errors).toHaveProperty(field);
    }
  });

  it("creates comparison with PENDING status and auto-generated slug", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test",
        email: "test@test.com",
        role: "USER",
        username: "test-123",
      },
      expires: "2099-01-01",
    });

    // generateUniqueSlug calls findFirst — no collision
    prismaMock.productComparison.findFirst.mockResolvedValue(null);
    prismaMock.productComparison.create.mockResolvedValue(
      mockCreatedComparison
    );

    const req = makePostRequest(validBody);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.comparison).toBeDefined();
    expect(body.comparison.status).toBe("PENDING");
    expect(body.comparison.verdict).toBe("PENDING");
    expect(body.comparison.submittedById).toBe("user-1");

    expect(prismaMock.productComparison.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "PENDING",
          verdict: "PENDING",
          submittedById: "user-1",
          genericProductName: "Great Value Cereal",
          nameBrandProductName: "Frosted Flakes",
          categoryId: "cat-1",
        }),
      })
    );
  });

  it("slug is auto-generated from product names", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test",
        email: "test@test.com",
        role: "USER",
        username: "test-123",
      },
      expires: "2099-01-01",
    });

    prismaMock.productComparison.findFirst.mockResolvedValue(null);
    prismaMock.productComparison.create.mockResolvedValue(
      mockCreatedComparison
    );

    const req = makePostRequest(validBody);
    await POST(req);

    expect(prismaMock.productComparison.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "great-value-cereal-vs-frosted-flakes",
        }),
      })
    );
  });

  it("accepts optional price and image fields", async () => {
    mockGetServerSession.mockResolvedValue({
      user: {
        id: "user-1",
        name: "Test",
        email: "test@test.com",
        role: "USER",
        username: "test-123",
      },
      expires: "2099-01-01",
    });

    prismaMock.productComparison.findFirst.mockResolvedValue(null);
    const compWithPrices = {
      ...mockCreatedComparison,
      genericPrice: 2.99,
      nameBrandPrice: 4.99,
      genericImageUrl: "https://r2.example.com/generic.jpg",
      nameBrandImageUrl: "https://r2.example.com/namebrand.jpg",
    };
    prismaMock.productComparison.create.mockResolvedValue(compWithPrices);

    const bodyWithOptionals = {
      ...validBody,
      genericPrice: 2.99,
      nameBrandPrice: 4.99,
      genericImageUrl: "https://r2.example.com/generic.jpg",
      nameBrandImageUrl: "https://r2.example.com/namebrand.jpg",
    };

    const req = makePostRequest(bodyWithOptionals);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(prismaMock.productComparison.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          genericPrice: 2.99,
          nameBrandPrice: 4.99,
          genericImageUrl: "https://r2.example.com/generic.jpg",
          nameBrandImageUrl: "https://r2.example.com/namebrand.jpg",
        }),
      })
    );
  });
});
