import { describe, it, expect } from "vitest";
import { categoryBlurb } from "../category-copy";
import { CATEGORIES } from "../catalogue/data";

describe("categoryBlurb", () => {
  it("describes every catalogue category", () => {
    for (const category of CATEGORIES) {
      expect(categoryBlurb(category.slug), category.slug).toMatch(/\.$/);
    }
  });

  it("returns null for unknown or missing slugs", () => {
    expect(categoryBlurb("garden-gnomes")).toBeNull();
    expect(categoryBlurb(null)).toBeNull();
    expect(categoryBlurb(undefined)).toBeNull();
  });
});
