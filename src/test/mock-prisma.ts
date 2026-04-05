import { vi } from "vitest";
import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "vitest-mock-extended";

vi.mock("@/lib/db", () => ({
  prisma: mockDeep<PrismaClient>(),
}));

import { prisma } from "@/lib/db";
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
