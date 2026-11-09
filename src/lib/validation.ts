/**
 * Input validation for user-submitted content. Every public write endpoint
 * runs its fields through these helpers before touching the database.
 */

export const LIMITS = {
  productName: 120,
  brand: 60,
  store: 60,
  size: 40,
  evidenceTitle: 120,
  evidenceContent: 2000,
  url: 500,
  reason: 500,
  maxPrice: 10000,
} as const;

/** Trim, collapse runs of whitespace and strip control characters. */
export function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Like cleanText but keeps paragraph breaks for long-form text. */
export function cleanMultiline(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Only absolute http(s) URLs are allowed in user content. Blocks javascript:,
 * data:, and other schemes that could execute script or confuse users.
 */
export function isSafeHttpUrl(value: string): boolean {
  if (!value || value.length > LIMITS.url) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && !!url.hostname && !url.username && !url.password;
  } catch {
    return false;
  }
}

/**
 * Accepts a number or numeric string; returns null for "not provided".
 * Returns NaN when a value was provided but isn't a sane price.
 */
export function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > LIMITS.maxPrice) return NaN;
  return Math.round(n * 100) / 100;
}

export type FieldErrors = Record<string, string>;

/** Validate a required single-line text field; records an error if invalid. */
export function requireText(
  data: Record<string, unknown>,
  field: string,
  label: string,
  max: number,
  errors: FieldErrors
): string {
  const value = cleanText(data[field]);
  if (!value) {
    errors[field] = `${label} is required`;
  } else if (value.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer`;
  }
  return value;
}

/** Validate an optional single-line text field; returns null when empty. */
export function optionalText(
  data: Record<string, unknown>,
  field: string,
  label: string,
  max: number,
  errors: FieldErrors
): string | null {
  const value = cleanText(data[field]);
  if (!value) return null;
  if (value.length > max) {
    errors[field] = `${label} must be ${max} characters or fewer`;
  }
  return value;
}
