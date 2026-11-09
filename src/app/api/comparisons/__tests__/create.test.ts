import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { NextRequest } from "next/server";
import { makeCategory, makeComparison, makeSession } from "@/test/fixtures";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/rate-limit", () => ({
  submissionLimiter: { check: vi.fn(() => ({ success: true, remaining: 4, resetAt: new Date() })) },
}));

import { getServerSession } from "next-auth";
import { submissionLimiter } from "@/lib/rate-limit";
const mockGetServerSession = vi.mocked(getServerSession);

import { POST } from "../route";

const makePostRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/comparisons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = {
  genericProductName: "No Name Macaroni & Cheese Dinner",
  genericBrand: "No Name",
  genericStore: "No Frills",
  nameBrandProductName: "Kraft Dinner Original",
  nameBrand: "Kraft Dinner",
  categoryId: "cat-1",
};

function setUpHappyPath() {
  mockGetServerSession.mockResolvedValue(makeSession());
  prismaMock.category.findUnique.mockResolvedValue(makeCategory());
  prismaMock.productComparison.findFirst.mockResolvedValue(null); // no duplicate, slug free
  prismaMock.productComparison.create.mockResolvedValue(
    makeComparison({ id: "comp-new", slug: "no-name-macaroni-cheese-dinner-vs-kraft-dinner-original", status: "PENDING" })
  );
}

describe("POST /api/comparisons", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submissionLimiter.check).mockReturnValue({ success: true, remaining: 4, resetAt: new Date() });
  });

  it("returns 401 when not authenticated", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBeDefined();
  });

  it("returns 429 when rate limited", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    vi.mocked(submissionLimiter.check).mockReturnValue({ success: false, remaining: 0, resetAt: new Date() });
    const res = await POST(makePostRequest(validBody));
    expect(res.status).toBe(429);
  });

  it("returns 400 when required fields are missing", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ genericProductName: "No Name Mac & Cheese" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    for (const field of ["genericBrand", "genericStore", "nameBrandProductName", "nameBrand", "categoryId"]) {
      expect(body.errors).toHaveProperty(field);
    }
  });

  it("returns 400 for each individually missing required field", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    for (const field of Object.keys(validBody)) {
      const body = { ...validBody, [field]: "   " };
      const res = await POST(makePostRequest(body));
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.errors).toHaveProperty(field);
    }
  });

  it("rejects fields longer than the limit", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ ...validBody, genericBrand: "x".repeat(61) }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.errors.genericBrand).toMatch(/60 characters/);
  });

  it("rejects negative, huge or non-numeric prices", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    for (const price of [-1, 100000, "abc"]) {
      const res = await POST(makePostRequest({ ...validBody, genericPrice: price }));
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.errors).toHaveProperty("genericPrice");
    }
  });

  it("returns 400 when the category doesn't exist", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    prismaMock.category.findUnique.mockResolvedValue(null);
    const res = await POST(makePostRequest(validBody));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.errors).toHaveProperty("categoryId");
    expect(prismaMock.productComparison.create).not.toHaveBeenCalled();
  });

  it("returns 409 with a link when an approved duplicate exists", async () => {
    setUpHappyPath();
    prismaMock.productComparison.findFirst.mockResolvedValueOnce(makeComparison({ slug: "existing-slug", status: "APPROVED" }));
    const res = await POST(makePostRequest(validBody));
    const json = await res.json();
    expect(res.status).toBe(409);
    expect(json.duplicate).toBe(true);
    expect(json.existingSlug).toBe("existing-slug");
    expect(prismaMock.productComparison.create).not.toHaveBeenCalled();
  });

  it("returns 409 without a link when the duplicate is still pending review", async () => {
    setUpHappyPath();
    prismaMock.productComparison.findFirst.mockResolvedValueOnce(makeComparison({ slug: "pending-slug", status: "PENDING" }));
    const res = await POST(makePostRequest(validBody));
    const json = await res.json();
    expect(res.status).toBe(409);
    expect(json.existingSlug).toBeNull();
  });

  it("creates the comparison as PENDING with a generated slug and trimmed fields", async () => {
    setUpHappyPath();
    const res = await POST(makePostRequest({ ...validBody, genericBrand: "  No   Name  " }));
    expect(res.status).toBe(201);

    const call = prismaMock.productComparison.create.mock.calls[0][0];
    expect(call.data).toMatchObject({
      slug: "no-name-macaroni-cheese-dinner-vs-kraft-dinner-original",
      genericBrand: "No Name",
      status: "PENDING",
      verdict: "PENDING",
      totalVotes: 0,
      submittedById: "user-1",
    });
    expect(call.data).not.toHaveProperty("evidence");
  });

  it("accepts prices as numbers or numeric strings, plus package sizes", async () => {
    setUpHappyPath();
    const res = await POST(
      makePostRequest({ ...validBody, genericPrice: "0.99", nameBrandPrice: 1.79, genericSize: "225 g", nameBrandSize: "200 g" })
    );
    expect(res.status).toBe(201);
    expect(prismaMock.productComparison.create.mock.calls[0][0].data).toMatchObject({
      genericPrice: 0.99,
      nameBrandPrice: 1.79,
      genericSize: "225 g",
      nameBrandSize: "200 g",
    });
  });

  it("creates initial evidence in the same request, held for review", async () => {
    setUpHappyPath();
    const res = await POST(
      makePostRequest({ ...validBody, evidenceTitle: "Same noodles", evidenceContent: "Tastes the same to my kids." })
    );
    expect(res.status).toBe(201);
    const data = prismaMock.productComparison.create.mock.calls[0][0].data as Record<string, unknown>;
    expect(data.evidence).toEqual({
      create: expect.objectContaining({
        userId: "user-1",
        title: "Same noodles",
        content: "Tastes the same to my kids.",
        status: "PENDING",
        confidence: "UNVERIFIED",
      }),
    });
  });

  it("requires both evidence title and details when either is given", async () => {
    mockGetServerSession.mockResolvedValue(makeSession());
    const res = await POST(makePostRequest({ ...validBody, evidenceTitle: "Only a title" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.errors).toHaveProperty("evidenceContent");
  });
});
