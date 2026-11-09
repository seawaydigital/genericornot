import { describe, it, expect } from "vitest";
import { formatCAD, formatCADPrecise, formatDate, formatMonthYear, formatRelativeTime } from "../format";
import { generateUsername, USERNAME_PATTERN } from "../username";
import { shouldUsePgAdapter } from "../db";

describe("formatCAD", () => {
  it("formats Canadian dollars with a plain $", () => {
    expect(formatCAD(4.99)).toBe("$4.99");
    expect(formatCAD(1234.5)).toBe("$1,234.50");
  });

  it("returns an empty string for missing values", () => {
    expect(formatCAD(null)).toBe("");
    expect(formatCAD(Number.NaN)).toBe("");
  });

  it("keeps a third decimal for sub-dollar unit prices", () => {
    expect(formatCADPrecise(0.0455)).toBe("$0.046");
    expect(formatCADPrecise(2.5)).toBe("$2.50");
  });
});

describe("dates", () => {
  it("uses the en-CA locale in Eastern time", () => {
    expect(formatDate("2026-03-04T12:00:00Z")).toMatch(/Mar\.? 4, 2026/);
    expect(formatMonthYear("2026-03-04T12:00:00Z")).toBe("March 2026");
  });

  it("formats relative times", () => {
    const now = new Date("2026-11-05T12:00:00Z");
    expect(formatRelativeTime(new Date("2026-11-05T11:59:30Z"), now)).toBe("just now");
    expect(formatRelativeTime(new Date("2026-11-05T11:00:00Z"), now)).toBe("1h ago");
    expect(formatRelativeTime(new Date("2026-11-02T12:00:00Z"), now)).toBe("3d ago");
  });
});

describe("generateUsername", () => {
  it("creates pseudonymous handles that never include the person's name", () => {
    for (let i = 0; i < 50; i++) {
      const username = generateUsername();
      expect(username).toMatch(/^[a-z]+-[a-z-]+-\d{4}$/);
      expect(username).toMatch(USERNAME_PATTERN);
    }
  });
});

describe("shouldUsePgAdapter", () => {
  it("uses node-postgres for local databases and Neon otherwise", () => {
    expect(shouldUsePgAdapter("postgresql://u:p@localhost:5432/db")).toBe(true);
    expect(shouldUsePgAdapter("postgresql://u:p@127.0.0.1:5433/db")).toBe(true);
    expect(shouldUsePgAdapter("postgresql://u:p@ep-cool-name.us-east-2.aws.neon.tech/db?sslmode=require")).toBe(false);
    expect(shouldUsePgAdapter("not a url")).toBe(false);
  });
});
