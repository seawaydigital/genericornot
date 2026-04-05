import { describe, it, expect, beforeEach, vi } from "vitest";
import { prismaMock } from "@/test/mock-prisma";
import { slugify, generateUniqueSlug } from "@/lib/slug";

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("great value cereal")).toBe("great-value-cereal");
  });

  it("handles multiple consecutive spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles multiple consecutive hyphens", () => {
    expect(slugify("hello--world")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Great Value! Cereal & Milk")).toBe(
      "great-value-cereal-milk"
    );
  });

  it("removes leading and trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("truncates to 80 characters", () => {
    const longText = "a".repeat(100);
    expect(slugify(longText).length).toBeLessThanOrEqual(80);
  });

  it("truncates a long string to 80 chars", () => {
    const input =
      "this is a very long product name that exceeds eighty characters limit for slugs";
    const result = slugify(input);
    expect(result.length).toBeLessThanOrEqual(80);
  });

  it("handles apostrophes", () => {
    expect(slugify("Kellogg's Frosted Flakes")).toBe("kelloggs-frosted-flakes");
  });

  it("handles numbers", () => {
    expect(slugify("Brand 2-in-1 Shampoo")).toBe("brand-2-in-1-shampoo");
  });

  it("produces correct vs slug", () => {
    expect(slugify("store brand vs kelloggs")).toBe("store-brand-vs-kelloggs");
  });
});

describe("generateUniqueSlug", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns base slug when no collision", async () => {
    prismaMock.productComparison.findFirst.mockResolvedValue(null);

    const slug = await generateUniqueSlug(
      "Great Value Cereal",
      "Frosted Flakes"
    );

    expect(slug).toBe("great-value-cereal-vs-frosted-flakes");
    expect(prismaMock.productComparison.findFirst).toHaveBeenCalledTimes(1);
  });

  it("appends -2 on first collision", async () => {
    prismaMock.productComparison.findFirst
      .mockResolvedValueOnce({ id: "existing" } as any) // base slug taken
      .mockResolvedValueOnce(null); // -2 is free

    const slug = await generateUniqueSlug(
      "Great Value Cereal",
      "Frosted Flakes"
    );

    expect(slug).toBe("great-value-cereal-vs-frosted-flakes-2");
  });

  it("appends -3 on two collisions", async () => {
    prismaMock.productComparison.findFirst
      .mockResolvedValueOnce({ id: "existing-1" } as any) // base taken
      .mockResolvedValueOnce({ id: "existing-2" } as any) // -2 taken
      .mockResolvedValueOnce(null); // -3 is free

    const slug = await generateUniqueSlug(
      "Great Value Cereal",
      "Frosted Flakes"
    );

    expect(slug).toBe("great-value-cereal-vs-frosted-flakes-3");
  });
});
