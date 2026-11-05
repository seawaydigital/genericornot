import { vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

vi.mock("@/lib/db", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from "@/lib/db";
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

/**
 * Prisma's groupBy signature is generic enough that vitest-mock-extended can't
 * infer mock methods on it. Wrap it to set resolved values in tests.
 */
export function asMock(fn: unknown) {
  return fn as import("vitest").Mock<(...args: unknown[]) => unknown>;
}
