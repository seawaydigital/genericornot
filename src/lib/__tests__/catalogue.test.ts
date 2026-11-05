import { describe, it, expect } from "vitest";
import { ARCHIVED_LEGACY_SLUGS, CATALOGUE, CATEGORIES } from "../catalogue/data";
import { parseSize } from "../units";
import { slugify } from "../slug";

/**
 * Guard rails for the editorial catalogue. These encode the rules in the
 * header of src/lib/catalogue/data.ts so a future edit can't quietly break
 * them.
 */
describe("catalogue integrity", () => {
  const slugs = CATALOGUE.map((e) => e.slug);
  const categorySlugs = new Set(CATEGORIES.map((c) => c.slug));

  it("has unique, URL-safe slugs", () => {
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slugify(slug)).toBe(slug);
    }
  });

  it("never lists a slug as both live and archived", () => {
    const archived = new Set(ARCHIVED_LEGACY_SLUGS.map((a) => a.slug));
    expect(slugs.filter((s) => archived.has(s))).toEqual([]);
    expect(archived.size).toBe(ARCHIVED_LEGACY_SLUGS.length);
  });

  it("uses only known categories, and every category has comparisons", () => {
    for (const entry of CATALOGUE) {
      expect(categorySlugs.has(entry.category)).toBe(true);
    }
    for (const category of CATEGORIES) {
      expect(CATALOGUE.some((e) => e.category === category.slug)).toBe(true);
    }
  });

  it("only sets a research verdict when CONFIRMED, sourced evidence backs it", () => {
    for (const entry of CATALOGUE.filter((e) => e.editorialVerdict)) {
      const confirmed = entry.evidence.filter((e) => e.confidence === "CONFIRMED");
      expect(confirmed.length, `${entry.slug} needs CONFIRMED evidence`).toBeGreaterThan(0);
      expect(confirmed.some((e) => !!e.url), `${entry.slug} needs a source URL`).toBe(true);
      expect(entry.editorialNote, `${entry.slug} needs an editorial note`).toBeTruthy();
    }
  });

  it("only links to http(s) sources", () => {
    for (const entry of CATALOGUE) {
      for (const e of entry.evidence) {
        if (e.url) expect(e.url).toMatch(/^https:\/\//);
      }
    }
  });

  it("has sane CAD prices and parseable sizes", () => {
    for (const entry of CATALOGUE) {
      for (const product of [entry.generic, entry.nameBrand]) {
        if (product.price !== undefined) {
          expect(product.price).toBeGreaterThan(0);
          expect(product.price).toBeLessThan(200);
        }
        if (product.size) {
          expect(parseSize(product.size), `${entry.slug}: "${product.size}"`).not.toBeNull();
        }
      }
    }
  });

  it("only mentions Canadian retailers", () => {
    const usOnly = /\b(Target|Trader Joe|Aldi|CVS|Walgreens|Kroger|Publix)\b/i;
    for (const entry of CATALOGUE) {
      expect(entry.generic.store).not.toMatch(usOnly);
    }
  });

  it("doesn't cite the US FDA as the regulator", () => {
    for (const entry of CATALOGUE) {
      for (const e of entry.evidence) {
        expect(`${e.title} ${e.content}`).not.toMatch(/\bFDA\b/);
      }
    }
  });

  it("features a handful of recognisable swaps", () => {
    const featured = CATALOGUE.filter((e) => e.featured);
    expect(featured.length).toBeGreaterThanOrEqual(4);
    expect(featured.length).toBeLessThanOrEqual(8);
  });
});
