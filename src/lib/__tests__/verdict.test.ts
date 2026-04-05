import { describe, it, expect } from "vitest";
import { computeVerdict, computeSavings } from "../verdict";

describe("computeVerdict", () => {
  it("returns PENDING when fewer than 5 total votes", () => {
    const result = computeVerdict({ sameQuality: 3, closeEnough: 1, notWorthIt: 0 });
    expect(result.verdict).toBe("PENDING");
    expect(result.confidenceScore).toBe(0);
  });

  it("returns PENDING for 0 votes", () => {
    const result = computeVerdict({ sameQuality: 0, closeEnough: 0, notWorthIt: 0 });
    expect(result.verdict).toBe("PENDING");
  });

  it("returns SAME_QUALITY when plurality exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 7, closeEnough: 2, notWorthIt: 1 });
    expect(result.verdict).toBe("SAME_QUALITY");
  });

  it("returns CLOSE_ENOUGH when plurality exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 1, closeEnough: 7, notWorthIt: 2 });
    expect(result.verdict).toBe("CLOSE_ENOUGH");
  });

  it("returns NOT_WORTH_IT when plurality exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 1, closeEnough: 2, notWorthIt: 7 });
    expect(result.verdict).toBe("NOT_WORTH_IT");
  });

  it("returns MIXED when no category exceeds 40%", () => {
    const result = computeVerdict({ sameQuality: 34, closeEnough: 33, notWorthIt: 33 });
    expect(result.verdict).toBe("MIXED");
  });

  it("handles exact 40% boundary — returns MIXED (>40% means strictly greater)", () => {
    const result = computeVerdict({ sameQuality: 4, closeEnough: 3, notWorthIt: 3 });
    expect(result.verdict).toBe("MIXED");
  });

  it("handles 41% — returns the verdict", () => {
    const result = computeVerdict({ sameQuality: 41, closeEnough: 30, notWorthIt: 29 });
    expect(result.verdict).toBe("SAME_QUALITY");
  });

  it("computes confidence: 30 votes, 70% agree = 42", () => {
    const result = computeVerdict({ sameQuality: 21, closeEnough: 5, notWorthIt: 4 });
    expect(result.confidenceScore).toBe(42);
  });

  it("computes confidence: 200 votes, 90% agree = 90", () => {
    const result = computeVerdict({ sameQuality: 180, closeEnough: 10, notWorthIt: 10 });
    expect(result.confidenceScore).toBe(90);
  });

  it("caps confidence at 100", () => {
    const result = computeVerdict({ sameQuality: 1000, closeEnough: 0, notWorthIt: 0 });
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });

  it("confidence is 0 for PENDING verdicts", () => {
    const result = computeVerdict({ sameQuality: 2, closeEnough: 1, notWorthIt: 0 });
    expect(result.confidenceScore).toBe(0);
  });

  it("returns totalVotes in result", () => {
    const result = computeVerdict({ sameQuality: 10, closeEnough: 5, notWorthIt: 3 });
    expect(result.totalVotes).toBe(18);
  });
});

describe("computeSavings", () => {
  it("computes savings percentage", () => {
    expect(computeSavings(12.99, 21.99)).toBe(41);
  });

  it("returns null when generic price is missing", () => {
    expect(computeSavings(null, 21.99)).toBeNull();
  });

  it("returns null when name brand price is missing", () => {
    expect(computeSavings(12.99, null)).toBeNull();
  });

  it("returns null when both prices missing", () => {
    expect(computeSavings(null, null)).toBeNull();
  });

  it("returns null when name brand price is 0", () => {
    expect(computeSavings(5, 0)).toBeNull();
  });

  it("returns 0 when prices are equal", () => {
    expect(computeSavings(10, 10)).toBe(0);
  });

  it("returns negative when generic is more expensive", () => {
    expect(computeSavings(25, 20)).toBe(-25);
  });
});
