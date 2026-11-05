import { describe, it, expect } from "vitest";
import { cleanMultiline, cleanText, isSafeHttpUrl, optionalText, parsePrice, requireText, type FieldErrors } from "../validation";
import { safeCallbackPath } from "../site";

describe("cleanText", () => {
  it("trims, collapses spaces and strips control characters", () => {
    expect(cleanText("  No\u0000   Name\u0007  ")).toBe("No Name");
  });

  it("returns empty string for non-strings", () => {
    expect(cleanText(42)).toBe("");
    expect(cleanText(undefined)).toBe("");
  });
});

describe("cleanMultiline", () => {
  it("keeps paragraphs but limits blank lines", () => {
    expect(cleanMultiline("Line one\r\n\r\n\r\n\r\nLine   two")).toBe("Line one\n\nLine two");
  });
});

describe("isSafeHttpUrl", () => {
  it.each(["https://www.canada.ca/en.html", "http://example.com/path?q=1"])("accepts %s", (url) => {
    expect(isSafeHttpUrl(url)).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "JAVASCRIPT:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox",
    "ftp://example.com",
    "//example.com",
    "/relative/path",
    "https://user:pass@example.com",
    "",
    `https://example.com/${"a".repeat(600)}`,
  ])("rejects %s", (url) => {
    expect(isSafeHttpUrl(url)).toBe(false);
  });
});

describe("parsePrice", () => {
  it("treats empty values as not provided", () => {
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice("")).toBeNull();
  });

  it("accepts numbers and numeric strings, rounded to cents", () => {
    expect(parsePrice(4.999)).toBe(5);
    expect(parsePrice("12.34")).toBe(12.34);
    expect(parsePrice(0)).toBe(0);
  });

  it("flags nonsense as NaN", () => {
    for (const bad of [-1, 10001, "abc", Infinity, {}]) {
      expect(Number.isNaN(parsePrice(bad))).toBe(true);
    }
  });
});

describe("requireText / optionalText", () => {
  it("records missing and too-long fields", () => {
    const errors: FieldErrors = {};
    requireText({ a: "" }, "a", "Brand", 5, errors);
    requireText({ b: "toolong" }, "b", "Store", 5, errors);
    optionalText({ c: "abcdefg" }, "c", "Size", 5, errors);
    expect(errors).toEqual({
      a: "Brand is required",
      b: "Store must be 5 characters or fewer",
      c: "Size must be 5 characters or fewer",
    });
  });

  it("returns null for an empty optional field", () => {
    const errors: FieldErrors = {};
    expect(optionalText({}, "size", "Size", 5, errors)).toBeNull();
    expect(errors).toEqual({});
  });
});

describe("safeCallbackPath", () => {
  it("allows same-site paths", () => {
    expect(safeCallbackPath("/compare/life-brand-ibuprofen-vs-advil")).toBe("/compare/life-brand-ibuprofen-vs-advil");
    expect(safeCallbackPath("/submit")).toBe("/submit");
  });

  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/auth/signin", "/api/votes", 42, undefined])(
    "falls back to / for %s",
    (value) => {
      expect(safeCallbackPath(value)).toBe("/");
    }
  );
});
