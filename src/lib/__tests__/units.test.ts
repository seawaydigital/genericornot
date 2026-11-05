import { describe, it, expect } from "vitest";
import { formatUnitPrice, parseSize, unitPrice } from "../units";
import { formatCADPrecise } from "../format";

describe("parseSize", () => {
  it.each([
    ["454 g", 454, "g"],
    ["2.5 kg", 2500, "g"],
    ["1 kg", 1000, "g"],
    ["796 mL", 796, "ml"],
    ["1.89 L", 1890, "ml"],
    ["2 L", 2000, "ml"],
    ["2 x 1.89 L", 3780, "ml"],
    ["12 × 355 mL", 4260, "ml"],
    ["100 tablets", 100, "count"],
    ["6 x 126 tissues", 756, "count"],
    ["1,320 sheets (6 rolls)", 1320, "count"],
    ["168 diapers", 168, "count"],
    ["30 g", 30, "g"],
    ["40 m", 40, "m"],
    ["1,000 sq ft (92.9 m²)", 92.903, "m2"],
    ["75 sq. ft.", 6.968, "m2"],
    ["6.97 m²", 6.97, "m2"],
  ])("parses %s", (input, quantity, unit) => {
    const parsed = parseSize(input);
    expect(parsed?.unit).toBe(unit);
    expect(parsed?.quantity).toBeCloseTo(quantity, 1);
  });

  it("reads a decimal comma (French-language labels)", () => {
    expect(parseSize("1,89 L")).toEqual({ quantity: 1890, unit: "ml" });
  });

  it("skips doses and finds the package count", () => {
    expect(parseSize("200 mg, 100 tablets")).toEqual({ quantity: 100, unit: "count" });
  });

  it.each(["", null, undefined, "6 double rolls", "family size", "big"])("returns null for %s", (input) => {
    expect(parseSize(input as string | null | undefined)).toBeNull();
  });
});

describe("unitPrice / formatUnitPrice", () => {
  it("computes price per gram", () => {
    expect(unitPrice(4.54, "454 g")?.value).toBeCloseTo(0.01);
  });

  it("formats like a Canadian shelf tag", () => {
    expect(formatUnitPrice(4.54, "454 g", formatCADPrecise)).toBe("$1.00 / 100 g");
    expect(formatUnitPrice(2.79, "1 L", formatCADPrecise)).toBe("$0.279 / 100 mL");
    expect(formatUnitPrice(9.99, "100 tablets", formatCADPrecise)).toBe("$0.10 each");
    expect(formatUnitPrice(32.99, "1,000 sq ft (92.9 m²)", formatCADPrecise)).toBe("$0.355 / m²");
  });

  it("returns null without a price or a parseable size", () => {
    expect(formatUnitPrice(null, "454 g", formatCADPrecise)).toBeNull();
    expect(formatUnitPrice(4.99, "family size", formatCADPrecise)).toBeNull();
  });
});
