export const SITE_NAME = "GenericOrNot";

/** Canonical origin (no trailing slash). Non-www is canonical in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://genericornot.com").replace(/\/+$/, "");

export const SITE_TAGLINE = "Store brand or name brand? Canadians compare notes.";

export const SITE_DESCRIPTION =
  "Community-powered comparisons of Canadian store brands — No Name, President's Choice, Great Value, Kirkland Signature, Life Brand, Compliments and more — against the name brands. See when the generic is worth it before you buy.";

export const CONTACT_EMAIL = "hello@genericornot.com";

/**
 * Only allow redirects to our own pages after sign-in. Accepts relative paths
 * ("/compare/x") and rejects protocol-relative or absolute URLs that could be
 * used to bounce users to another site.
 */
export function safeCallbackPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  if (value.startsWith("/auth/") || value.startsWith("/api/")) return fallback;
  return value.slice(0, 300);
}
