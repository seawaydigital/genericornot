import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@auth/prisma-adapter", () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

const { authOptions } = await import("@/lib/auth");

describe("Auth configuration", () => {
  it("has Google provider configured", () => {
    const providers = authOptions.providers;
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
    const googleProvider = providers.find(
      (p) => (p as { id: string }).id === "google"
    );
    expect(googleProvider).toBeDefined();
  });

  it("uses JWT session strategy", () => {
    expect(authOptions.session).toBeDefined();
    expect(authOptions.session?.strategy).toBe("jwt");
  });
});
