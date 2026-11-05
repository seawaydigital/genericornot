import { Prisma } from "@prisma/client";
import type { Category, Evidence, ProductComparison, User, Vote } from "@prisma/client";

/**
 * Fully-typed model fixtures for tests. Using these instead of hand-written
 * object literals keeps tests compiling when the schema gains a column.
 */

export function makeComparison(overrides: Partial<ProductComparison> = {}): ProductComparison {
  return {
    id: "comp-1",
    slug: "generic-cereal-vs-frosted-flakes",
    genericProductName: "Generic Cereal",
    genericBrand: "Store Brand",
    genericStore: "Walmart",
    genericPrice: new Prisma.Decimal(2.99),
    genericSize: null,
    genericImageUrl: null,
    nameBrandProductName: "Frosted Flakes",
    nameBrand: "Kellogg's",
    nameBrandPrice: new Prisma.Decimal(4.99),
    nameBrandSize: null,
    nameBrandImageUrl: null,
    categoryId: "cat-1",
    verdict: "PENDING",
    confidenceScore: 0,
    totalVotes: 0,
    editorialVerdict: null,
    editorialNote: null,
    featured: false,
    status: "APPROVED",
    rejectionReason: null,
    submittedById: "user-2",
    lastVerifiedAt: null,
    flaggedOutdated: false,
    flagCount: 0,
    createdAt: new Date("2026-04-01T00:00:00Z"),
    updatedAt: new Date("2026-04-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: "cat-1",
    name: "Grocery",
    slug: "grocery",
    icon: "🛒",
    comparisonCount: 5,
    ...overrides,
  };
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    username: "thrifty-loon-1234",
    email: "test@example.ca",
    name: "Test User",
    image: null,
    role: "USER",
    emailVerified: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: "ev-1",
    comparisonId: "comp-1",
    userId: "user-1",
    type: "OTHER",
    title: "Tried both",
    content: "No difference for me.",
    url: null,
    imageUrl: null,
    confidence: "UNVERIFIED",
    status: "APPROVED",
    createdAt: new Date("2026-04-05T00:00:00Z"),
    ...overrides,
  };
}

export function makeVote(overrides: Partial<Vote> = {}): Vote {
  return {
    id: "vote-1",
    userId: "user-1",
    comparisonId: "comp-1",
    value: "SAME_QUALITY",
    createdAt: new Date("2026-04-05T00:00:00Z"),
    ...overrides,
  };
}

/** A session object matching our NextAuth type augmentation. */
export function makeSession(overrides: Partial<{ id: string; role: string; username: string; name: string; email: string }> = {}) {
  return {
    user: {
      id: "user-1",
      role: "USER",
      username: "thrifty-loon-1234",
      name: "Test User",
      email: "test@example.ca",
      ...overrides,
    },
    expires: "2099-01-01T00:00:00.000Z",
  };
}
