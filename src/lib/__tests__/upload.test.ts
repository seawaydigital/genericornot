import { describe, it, expect } from "vitest";
import { validateFile } from "../upload";

function makeFile(type: string, size: number): { type: string; size: number } {
  return { type, size };
}

const MB = 1024 * 1024;

describe("validateFile", () => {
  it("returns null for a valid JPEG under 5MB", () => {
    const result = validateFile(makeFile("image/jpeg", 1 * MB));
    expect(result).toBeNull();
  });

  it("returns null for a valid PNG under 5MB", () => {
    const result = validateFile(makeFile("image/png", 2 * MB));
    expect(result).toBeNull();
  });

  it("returns null for a valid WebP under 5MB", () => {
    const result = validateFile(makeFile("image/webp", 3 * MB));
    expect(result).toBeNull();
  });

  it("returns null for a file exactly at 5MB limit", () => {
    const result = validateFile(makeFile("image/jpeg", 5 * MB));
    expect(result).toBeNull();
  });

  it("returns error for a file over 5MB", () => {
    const result = validateFile(makeFile("image/jpeg", 5 * MB + 1));
    expect(result).toBeTruthy();
    expect(result).toContain("5MB");
  });

  it("returns error for a file significantly over 5MB", () => {
    const result = validateFile(makeFile("image/png", 10 * MB));
    expect(result).toBeTruthy();
    expect(result).toContain("5MB");
  });

  it("returns error for a disallowed file type (PDF)", () => {
    const result = validateFile(makeFile("application/pdf", 1 * MB));
    expect(result).toBeTruthy();
    expect(result).toContain("JPEG");
  });

  it("returns error for a disallowed file type (GIF)", () => {
    const result = validateFile(makeFile("image/gif", 1 * MB));
    expect(result).toBeTruthy();
    expect(result).toContain("JPEG");
  });

  it("returns error for a text file type", () => {
    const result = validateFile(makeFile("text/plain", 100));
    expect(result).toBeTruthy();
  });

  it("returns a string (not null) for both type and size violations — type checked first", () => {
    // Over size AND wrong type — type error should take precedence
    const result = validateFile(makeFile("application/pdf", 10 * MB));
    expect(result).toBeTruthy();
    expect(result).toContain("JPEG");
  });
});
