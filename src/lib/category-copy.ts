// One-line, neutral descriptions of what each aisle covers. No claims about
// quality: verdicts come from votes and evidence, not from this copy.
const CATEGORY_BLURBS: Record<string, string> = {
  grocery: "Pantry staples, dairy, snacks, condiments and baking basics.",
  "health-otc": "Pain relievers, allergy tablets and other over-the-counter medicine.",
  "home-garden": "Paper towels, tissue, wraps, foil, bags and furnace filters.",
  "baby-kids": "Diapers, wipes, formula and children's medicine.",
  "personal-care": "Skin care, oral care, shaving and everyday toiletries.",
  cleaning: "Laundry detergent, dish soap, sponges and household cleaners.",
  electronics: "Batteries, cables, chargers and small accessories.",
  "pet-supplies": "Cat litter, pet food and treats.",
};

export function categoryBlurb(slug: string | null | undefined): string | null {
  return (slug && CATEGORY_BLURBS[slug]) || null;
}
