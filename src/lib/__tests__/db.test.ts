import { describe, it, expect } from "vitest";
import { Prisma } from "@prisma/client";

describe("Database schema", () => {
  it("exports all model names", () => {
    const values = Object.values(Prisma.ModelName);
    expect(values).toContain("User");
    expect(values).toContain("ProductComparison");
    expect(values).toContain("Vote");
    expect(values).toContain("Evidence");
    expect(values).toContain("Category");
  });

  it("has the expected enums", () => {
    const verdict: Prisma.EnumVerdictFilter = { equals: "SAME_QUALITY" };
    const vote: Prisma.EnumVoteValueFilter = { equals: "SAME_QUALITY" };
    const status: Prisma.EnumComparisonStatusFilter = { equals: "PENDING" };
    const evidenceType: Prisma.EnumEvidenceTypeFilter = { equals: "MANUFACTURER_INFO" };
    const role: Prisma.EnumUserRoleFilter = { equals: "USER" };
    expect(verdict.equals).toBe("SAME_QUALITY");
    expect(vote.equals).toBe("SAME_QUALITY");
    expect(status.equals).toBe("PENDING");
    expect(evidenceType.equals).toBe("MANUFACTURER_INFO");
    expect(role.equals).toBe("USER");
  });
});
