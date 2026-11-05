// Types for the curated starter catalogue. Kept free of runtime imports so
// the data file can be loaded by scripts (tsx) and tests alike.

export type CategorySlug =
  | "grocery"
  | "health-otc"
  | "cleaning"
  | "baby-kids"
  | "personal-care"
  | "pet-supplies"
  | "electronics"
  | "home-garden";

export type CatalogueVerdict = "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT";

export interface CatalogueEvidence {
  type: "MANUFACTURER_INFO" | "INGREDIENT_COMPARISON" | "PHOTO" | "VIDEO_LINK" | "OTHER";
  confidence: "CONFIRMED" | "COMMUNITY" | "UNVERIFIED";
  title: string;
  content: string;
  url?: string;
}

export interface CatalogueProduct {
  product: string;
  brand: string;
  /** Approximate regular shelf price in CAD. */
  price?: number;
  /** Package size, e.g. "100 tablets", "454 g", "2 L". Omitted when packs aren't comparable by unit. */
  size?: string;
}

export interface CatalogueEntry {
  slug: string;
  category: CategorySlug;
  generic: CatalogueProduct & { store: string };
  nameBrand: CatalogueProduct;
  /**
   * Research verdict. Only set when backed by CONFIRMED, objective evidence
   * (same medicinal ingredient, a legal standard, a published spec). Taste
   * and performance questions are left to community votes.
   */
  editorialVerdict?: CatalogueVerdict;
  editorialNote?: string;
  featured?: boolean;
  evidence: CatalogueEvidence[];
}

export interface CatalogueCategory {
  slug: CategorySlug;
  name: string;
  icon: string;
}

export interface ArchivedSlug {
  slug: string;
  reason: string;
}
