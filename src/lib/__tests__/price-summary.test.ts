import { describe, it, expect } from "vitest";
import { describeSavings } from "../price-summary";

describe("describeSavings", () => {
  it("compares unit prices when both sizes use the same unit", () => {
    expect(
      describeSavings({
        genericBrand: "Life Brand",
        genericPrice: 9.99,
        genericSize: "100 tablets",
        nameBrandPrice: 16.99,
        nameBrandSize: "100 tablets",
      })
    ).toBe("You save about 41% per unit by choosing Life Brand.");
  });

  it("credits a bulk pack that costs more per package but less per unit", () => {
    expect(
      describeSavings({
        genericBrand: "Kirkland Signature",
        genericPrice: 9.99,
        genericSize: "2 x 1.89 L",
        nameBrandPrice: 5.99,
        nameBrandSize: "1.89 L",
      })
    ).toBe("You save about 17% per unit by choosing Kirkland Signature.");
  });

  it("says so when the store brand costs more", () => {
    expect(
      describeSavings({ genericBrand: "Selection", genericPrice: 5.49, nameBrandPrice: 4.99 })
    ).toBe("Selection costs about 10% more at these prices.");
  });

  it("calls small differences about the same", () => {
    expect(describeSavings({ genericBrand: "No Name", genericPrice: 4.99, nameBrandPrice: 5.0 })).toBe(
      "About the same price."
    );
  });

  it("warns when package sizes can't be compared per unit", () => {
    const text = describeSavings({
      genericBrand: "Equate",
      genericPrice: 6.97,
      genericSize: "100 tablets",
      nameBrandPrice: 11.99,
      nameBrandSize: "500 mL",
    });
    expect(text).toMatch(/^You save about 42% by choosing Equate\./);
    expect(text).toMatch(/Package sizes differ/);
  });

  it("returns null without both prices", () => {
    expect(describeSavings({ genericBrand: "No Name", genericPrice: null, nameBrandPrice: 4.99 })).toBeNull();
    expect(describeSavings({ genericBrand: "No Name", genericPrice: 3.99, nameBrandPrice: null })).toBeNull();
  });
});
