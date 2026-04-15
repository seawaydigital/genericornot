import { describe, it, expect, vi } from "vitest";

// Stub OAuth env vars BEFORE importing auth.ts, since providers are
// registered conditionally at module load time.
process.env.GOOGLE_CLIENT_ID = "test-google-id";
process.env.GOOGLE_CLIENT_SECRET = "test-google-secret";

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
  it("has Google provider configured when env vars are set", () => {
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

  it("does not register email provider without RESEND_API_KEY", () => {
    // RESEND_API_KEY is intentionally not set in test env
    const emailProvider = authOptions.providers.find(
      (p) => (p as { id: string }).id === "email"
    );
    expect(emailProvider).toBeUndefined();
  });
});
