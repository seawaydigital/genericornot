import type { ArchivedSlug, CatalogueCategory, CatalogueEntry, CatalogueEvidence } from "./types";

/**
 * GenericOrNot starter catalogue — Canadian stores, brands and prices.
 *
 * Ground rules for anyone editing this file:
 *  - Prices are approximate REGULAR shelf prices in CAD (not sale prices).
 *    Re-check them periodically; they drift.
 *  - `editorialVerdict` only when a CONFIRMED, objective source backs it.
 *    Never set one for taste, texture or "how well it works" questions.
 *  - Evidence must be true as written. If you can't source a manufacturing
 *    claim, mark it COMMUNITY and say "reported", or leave it out.
 *  - Slugs are permanent URLs. Never rename one; archive it instead.
 *
 * Run `npx tsx scripts/sync-catalogue.ts` to apply changes to a database.
 */

export const DPD_URL = "https://health-products.canada.ca/dpd-bdpp/";
export const FOOD_AND_DRUG_REGS_URL = "https://laws-lois.justice.gc.ca/eng/regulations/c.r.c.,_c._870/";
export const NHP_REGS_URL = "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/";

export const CATEGORIES: CatalogueCategory[] = [
  { slug: "grocery", name: "Grocery", icon: "🛒" },
  { slug: "health-otc", name: "Health & Pharmacy", icon: "💊" },
  { slug: "cleaning", name: "Cleaning & Laundry", icon: "🧹" },
  { slug: "baby-kids", name: "Baby & Kids", icon: "👶" },
  { slug: "personal-care", name: "Personal Care", icon: "🧴" },
  { slug: "pet-supplies", name: "Pet Supplies", icon: "🐕" },
  { slug: "electronics", name: "Electronics", icon: "🔋" },
  { slug: "home-garden", name: "Household", icon: "🏠" },
];

/** Standard evidence for store-brand medicines with the same medicinal ingredient. */
function sameMedicinalIngredient(ingredient: string): CatalogueEvidence {
  return {
    type: "INGREDIENT_COMPARISON",
    confidence: "CONFIRMED",
    title: `Same medicinal ingredient and strength: ${ingredient}`,
    content:
      `Both products list ${ingredient} as the medicinal ingredient. Store-brand medicines are generic drugs: to be sold in Canada they must be authorized by Health Canada and contain the same medicinal ingredient, in the same strength and dosage form, as the brand-name product. ` +
      "Non-medicinal ingredients — coatings, dyes, flavours — can differ, so check the label if you have allergies. Every box carries an 8-digit DIN you can look up in Health Canada's Drug Product Database.",
    url: DPD_URL,
  };
}

const medicineNote = (ingredient: string) =>
  `Same medicinal ingredient and strength (${ingredient}), authorized by Health Canada. Differences are limited to non-medicinal ingredients and packaging.`;

export const CATALOGUE: CatalogueEntry[] = [
  // ─── HEALTH & PHARMACY ─────────────────────────────────────────────────
  {
    slug: "life-brand-ibuprofen-vs-advil",
    category: "health-otc",
    featured: true,
    generic: { product: "Life Brand Ibuprofen 200 mg Tablets", brand: "Life Brand", store: "Shoppers Drug Mart", price: 9.99, size: "100 tablets" },
    nameBrand: { product: "Advil Ibuprofen 200 mg Tablets", brand: "Advil", price: 16.99, size: "100 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("ibuprofen 200 mg"),
    evidence: [sameMedicinalIngredient("ibuprofen 200 mg")],
  },
  {
    slug: "equate-ibuprofen-vs-advil",
    category: "health-otc",
    generic: { product: "Equate Ibuprofen 200 mg Tablets", brand: "Equate", store: "Walmart", price: 6.97, size: "100 tablets" },
    nameBrand: { product: "Advil Ibuprofen 200 mg Tablets", brand: "Advil", price: 16.97, size: "100 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("ibuprofen 200 mg"),
    evidence: [sameMedicinalIngredient("ibuprofen 200 mg")],
  },
  {
    slug: "exact-acetaminophen-vs-tylenol",
    category: "health-otc",
    generic: { product: "Exact Extra Strength Acetaminophen 500 mg Caplets", brand: "Exact", store: "Loblaws", price: 7.99, size: "100 caplets" },
    nameBrand: { product: "Tylenol Extra Strength 500 mg Caplets", brand: "Tylenol", price: 14.99, size: "100 caplets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("acetaminophen 500 mg"),
    evidence: [sameMedicinalIngredient("acetaminophen 500 mg")],
  },
  {
    slug: "life-brand-allergy-relief-vs-reactine",
    category: "health-otc",
    generic: { product: "Life Brand Allergy Relief Cetirizine 10 mg Tablets", brand: "Life Brand", store: "Shoppers Drug Mart", price: 21.99, size: "60 tablets" },
    nameBrand: { product: "Reactine Extra Strength Cetirizine 10 mg Tablets", brand: "Reactine", price: 36.99, size: "60 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("cetirizine 10 mg"),
    evidence: [sameMedicinalIngredient("cetirizine hydrochloride 10 mg")],
  },
  {
    slug: "life-brand-loratadine-vs-claritin",
    category: "health-otc",
    generic: { product: "Life Brand Loratadine 10 mg Tablets", brand: "Life Brand", store: "Shoppers Drug Mart", price: 19.99, size: "60 tablets" },
    nameBrand: { product: "Claritin Allergy 10 mg Tablets", brand: "Claritin", price: 36.99, size: "60 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("loratadine 10 mg"),
    evidence: [sameMedicinalIngredient("loratadine 10 mg")],
  },
  {
    slug: "life-brand-fexofenadine-vs-allegra",
    category: "health-otc",
    generic: { product: "Life Brand Fexofenadine 120 mg Tablets (24 hour)", brand: "Life Brand", store: "Shoppers Drug Mart", price: 15.99, size: "30 tablets" },
    nameBrand: { product: "Allegra 24 Hour 120 mg Tablets", brand: "Allegra", price: 27.99, size: "30 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("fexofenadine 120 mg"),
    evidence: [sameMedicinalIngredient("fexofenadine hydrochloride 120 mg")],
  },
  {
    slug: "equate-naproxen-vs-aleve",
    category: "health-otc",
    generic: { product: "Equate Naproxen Sodium 220 mg Caplets", brand: "Equate", store: "Walmart", price: 8.97, size: "100 caplets" },
    nameBrand: { product: "Aleve Naproxen Sodium 220 mg Caplets", brand: "Aleve", price: 17.99, size: "100 caplets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("naproxen sodium 220 mg"),
    evidence: [sameMedicinalIngredient("naproxen sodium 220 mg")],
  },
  {
    slug: "equate-aspirin-vs-bayer",
    category: "health-otc",
    generic: { product: "Equate ASA 325 mg Tablets", brand: "Equate", store: "Walmart", price: 3.97, size: "100 tablets" },
    nameBrand: { product: "Aspirin Regular Strength 325 mg Tablets", brand: "Bayer", price: 12.99, size: "100 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("acetylsalicylic acid (ASA) 325 mg"),
    evidence: [
      sameMedicinalIngredient("acetylsalicylic acid (ASA) 325 mg"),
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "Why the generic isn't called \"aspirin\" in Canada",
        content:
          "In Canada, Aspirin is a Bayer trademark, so generic versions are sold as \"ASA\" (acetylsalicylic acid). Same medicine, different name on the box.",
      },
    ],
  },
  {
    slug: "life-brand-famotidine-vs-pepcid-ac",
    category: "health-otc",
    generic: { product: "Life Brand Acid Reducer Famotidine 20 mg Tablets", brand: "Life Brand", store: "Shoppers Drug Mart", price: 10.99, size: "30 tablets" },
    nameBrand: { product: "Pepcid AC Maximum Strength 20 mg Tablets", brand: "Pepcid", price: 17.99, size: "30 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("famotidine 20 mg"),
    evidence: [sameMedicinalIngredient("famotidine 20 mg")],
  },
  {
    slug: "life-brand-dimenhydrinate-vs-gravol",
    category: "health-otc",
    featured: true,
    generic: { product: "Life Brand Travel Sickness Dimenhydrinate 50 mg Tablets", brand: "Life Brand", store: "Shoppers Drug Mart", price: 5.99, size: "24 tablets" },
    nameBrand: { product: "Gravol Dimenhydrinate 50 mg Tablets", brand: "Gravol", price: 9.99, size: "24 tablets" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("dimenhydrinate 50 mg"),
    evidence: [sameMedicinalIngredient("dimenhydrinate 50 mg")],
  },
  {
    slug: "life-brand-antibiotic-ointment-vs-polysporin",
    category: "health-otc",
    generic: { product: "Life Brand Antibiotic Ointment (Polymyxin B + Bacitracin)", brand: "Life Brand", store: "Shoppers Drug Mart", price: 7.49, size: "30 g" },
    nameBrand: { product: "Polysporin Original Antibiotic Ointment", brand: "Polysporin", price: 11.99, size: "30 g" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("polymyxin B + bacitracin"),
    evidence: [
      sameMedicinalIngredient("polymyxin B sulfate and bacitracin zinc"),
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "Match the formula, not just the name",
        content:
          "Polysporin sells several formulas, such as Original and Triple. Compare the medicinal ingredients on the back of each box — a store brand only matches the version with the same ingredients.",
      },
    ],
  },
  {
    slug: "life-brand-nicotine-gum-vs-nicorette",
    category: "health-otc",
    generic: { product: "Life Brand Nicotine Gum 4 mg", brand: "Life Brand", store: "Shoppers Drug Mart", price: 46.99, size: "105 pieces" },
    nameBrand: { product: "Nicorette Gum 4 mg", brand: "Nicorette", price: 66.99, size: "105 pieces" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("nicotine 4 mg"),
    evidence: [
      sameMedicinalIngredient("nicotine (as nicotine resin) 4 mg"),
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "Flavour and chew can differ",
        content:
          "The nicotine dose is the same, but flavours, coating and texture vary between brands. If you're quitting, pick the one you'll actually keep using.",
      },
    ],
  },
  {
    slug: "life-brand-melatonin-vs-jamieson",
    category: "health-otc",
    generic: { product: "Life Brand Melatonin 5 mg", brand: "Life Brand", store: "Shoppers Drug Mart", price: 8.99, size: "60 tablets" },
    nameBrand: { product: "Jamieson Melatonin 5 mg", brand: "Jamieson", price: 12.99, size: "60 tablets" },
    evidence: [
      {
        type: "OTHER",
        confidence: "CONFIRMED",
        title: "Melatonin is a licensed natural health product in Canada",
        content:
          "Melatonin products sold in Canada are natural health products under the Natural Health Products Regulations and must carry an eight-digit Natural Product Number (NPN) from Health Canada. Compare the dose and form (regular vs quick-dissolve or sustained-release) on each label.",
        url: NHP_REGS_URL,
      },
    ],
  },
  {
    slug: "compliments-vitamin-d-vs-jamieson",
    category: "health-otc",
    generic: { product: "Compliments Vitamin D3 1000 IU Tablets", brand: "Compliments", store: "Sobeys", price: 7.49, size: "180 tablets" },
    nameBrand: { product: "Jamieson Vitamin D3 1000 IU Tablets", brand: "Jamieson", price: 11.99, size: "180 tablets" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Compare the IU per tablet",
        content:
          "Vitamin D3 (cholecalciferol) is the same nutrient whichever brand you buy. Make sure the dose per tablet matches — 1,000 IU is the most common strength in Canada — and look for an NPN on both labels.",
      },
    ],
  },

  // ─── GROCERY ────────────────────────────────────────────────────────────
  {
    slug: "no-name-macaroni-cheese-vs-kraft-dinner",
    category: "grocery",
    featured: true,
    generic: { product: "No Name Macaroni & Cheese Dinner", brand: "No Name", store: "No Frills", price: 0.99, size: "225 g" },
    nameBrand: { product: "Kraft Dinner Original Macaroni & Cheese", brand: "Kraft Dinner", price: 1.79, size: "200 g" },
    evidence: [],
  },
  {
    slug: "great-value-mac-cheese-vs-kraft",
    category: "grocery",
    generic: { product: "Great Value Macaroni & Cheese Dinner", brand: "Great Value", store: "Walmart", price: 1.07, size: "225 g" },
    nameBrand: { product: "Kraft Dinner Original Macaroni & Cheese", brand: "Kraft Dinner", price: 1.79, size: "200 g" },
    evidence: [],
  },
  {
    slug: "no-name-butter-vs-lactantia",
    category: "grocery",
    featured: true,
    generic: { product: "No Name Salted Butter", brand: "No Name", store: "Loblaws", price: 6.49, size: "454 g" },
    nameBrand: { product: "Lactantia Salted Butter", brand: "Lactantia", price: 7.99, size: "454 g" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: "Both must meet the same legal standard for butter in Canada (at least 80% milk fat). Differences in taste are small.",
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "CONFIRMED",
        title: "Canadian butter must contain at least 80% milk fat",
        content:
          "Canada's Food and Drug Regulations set a compositional standard for butter: it must contain at least 80% milk fat. Salted butter is cream and salt, so two butters that meet the standard are very close. Some people notice a slight difference in flavour or spreadability.",
        url: FOOD_AND_DRUG_REGS_URL,
      },
    ],
  },
  {
    slug: "no-name-all-purpose-flour-vs-robin-hood",
    category: "grocery",
    generic: { product: "No Name All Purpose Flour", brand: "No Name", store: "Loblaws", price: 4.99, size: "2.5 kg" },
    nameBrand: { product: "Robin Hood Original All Purpose Flour", brand: "Robin Hood", price: 7.49, size: "2.5 kg" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: "White flour sold in Canada must meet the same standard and be enriched with the same vitamins and iron.",
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "CONFIRMED",
        title: "Same standard, same mandatory enrichment",
        content:
          "Canada's Food and Drug Regulations define flour and require white flour to be enriched with thiamine, riboflavin, niacin, folic acid and iron. All-purpose flours differ mainly in protein content by a percent or so — check the nutrition table if you bake bread.",
        url: FOOD_AND_DRUG_REGS_URL,
      },
    ],
  },
  {
    slug: "no-name-canned-tomatoes-vs-hunts",
    category: "grocery",
    generic: { product: "No Name Diced Tomatoes", brand: "No Name", store: "Loblaws", price: 1.49, size: "796 mL" },
    nameBrand: { product: "Hunt's Diced Tomatoes", brand: "Hunt's", price: 2.29, size: "796 mL" },
    evidence: [],
  },
  {
    slug: "pc-decadent-chocolate-chip-cookies-vs-chips-ahoy",
    category: "grocery",
    featured: true,
    generic: { product: "PC The Decadent Chocolate Chip Cookies", brand: "President's Choice", store: "Loblaws", price: 4.49, size: "300 g" },
    nameBrand: { product: "Chips Ahoy! Original Chocolate Chip Cookies", brand: "Chips Ahoy!", price: 4.79, size: "300 g" },
    evidence: [
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "A store brand that many Canadians prefer",
        content:
          "President's Choice launched The Decadent in the late 1980s as a premium cookie, and it has been one of the brand's best-known products ever since. Plenty of shoppers say they prefer it to the name brand — taste is personal, so vote and tell us what you think.",
      },
    ],
  },
  {
    slug: "selection-pasta-vs-barilla",
    category: "grocery",
    generic: { product: "Selection Spaghetti", brand: "Selection", store: "Metro", price: 1.99, size: "900 g" },
    nameBrand: { product: "Barilla Spaghetti", brand: "Barilla", price: 3.49, size: "900 g" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Check for durum semolina and cook time",
        content:
          "Most dry spaghetti is made from durum wheat semolina. Differences show up in texture — rougher, bronze-die pastas hold sauce better. Compare the ingredient list and the cooking time on both boxes.",
      },
    ],
  },
  {
    slug: "compliments-frozen-vegetables-vs-green-giant",
    category: "grocery",
    generic: { product: "Compliments Frozen Mixed Vegetables", brand: "Compliments", store: "Sobeys", price: 3.29, size: "750 g" },
    nameBrand: { product: "Green Giant Mixed Vegetables", brand: "Green Giant", price: 4.99, size: "750 g" },
    evidence: [],
  },
  {
    slug: "no-name-chunk-light-tuna-vs-clover-leaf",
    category: "grocery",
    generic: { product: "No Name Chunk Light Tuna in Water", brand: "No Name", store: "No Frills", price: 1.29, size: "170 g" },
    nameBrand: { product: "Clover Leaf Chunk Light Tuna in Water", brand: "Clover Leaf", price: 2.29, size: "170 g" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Compare the species and drained weight",
        content:
          "\"Chunk light\" is usually skipjack tuna. The useful number on the label is the drained weight — how much tuna you get once the water is poured off — which can differ between brands for the same can size.",
      },
    ],
  },
  {
    slug: "no-name-canola-oil-vs-mazola",
    category: "grocery",
    generic: { product: "No Name Canola Oil", brand: "No Name", store: "Loblaws", price: 9.99, size: "3 L" },
    nameBrand: { product: "Mazola Canola Oil", brand: "Mazola", price: 12.49, size: "2.84 L" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Check the ingredient list: it should say just \"canola oil\"",
        content:
          "Refined canola oil is usually a single-ingredient product, so two bottles that both list only canola oil — with matching nutrition facts tables — are very close. Canola itself was developed by Canadian plant breeders in the 1970s.",
      },
    ],
  },
  {
    slug: "no-name-ketchup-vs-heinz",
    category: "grocery",
    generic: { product: "No Name Ketchup", brand: "No Name", store: "No Frills", price: 2.79, size: "1 L" },
    nameBrand: { product: "Heinz Tomato Ketchup", brand: "Heinz", price: 5.49, size: "1 L" },
    evidence: [],
  },
  {
    slug: "no-name-peanut-butter-vs-kraft",
    category: "grocery",
    generic: { product: "No Name Smooth Peanut Butter", brand: "No Name", store: "No Frills", price: 4.99, size: "1 kg" },
    nameBrand: { product: "Kraft Smooth Peanut Butter", brand: "Kraft", price: 7.99, size: "1 kg" },
    evidence: [],
  },
  {
    slug: "compliments-medium-cheddar-vs-cracker-barrel",
    category: "grocery",
    generic: { product: "Compliments Medium Cheddar Cheese", brand: "Compliments", store: "Sobeys", price: 6.49, size: "400 g" },
    nameBrand: { product: "Cracker Barrel Medium Cheddar Cheese", brand: "Cracker Barrel", price: 8.99, size: "400 g" },
    evidence: [],
  },
  {
    slug: "pc-cola-vs-coca-cola",
    category: "grocery",
    generic: { product: "President's Choice Cola", brand: "President's Choice", store: "Loblaws", price: 1.49, size: "2 L" },
    nameBrand: { product: "Coca-Cola", brand: "Coca-Cola", price: 3.49, size: "2 L" },
    evidence: [
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "The store-brand cola that took on the giants",
        content:
          "PC Cola launched in 1990 and was produced by Cott, a Canadian beverage company — one of the best-known store-brand success stories in Canadian retail. Whether it tastes as good as Coke is exactly what votes are for.",
      },
    ],
  },
  {
    slug: "kirkland-coffee-vs-starbucks",
    category: "grocery",
    generic: { product: "Kirkland Signature House Blend Medium Roast Coffee", brand: "Kirkland Signature", store: "Costco", price: 21.99, size: "1.13 kg" },
    nameBrand: { product: "Starbucks House Blend Whole Bean Coffee", brand: "Starbucks", price: 13.49, size: "340 g" },
    evidence: [
      {
        type: "MANUFACTURER_INFO",
        confidence: "COMMUNITY",
        title: "Shoppers point to a \"roasted by Starbucks\" label",
        content:
          "Kirkland Signature house-blend coffee has been sold with a \"custom roasted by Starbucks\" label. That tells you who roasts it, not that it's the same blend as Starbucks House Blend — compare roast level and origin on both bags.",
      },
    ],
  },
  {
    slug: "great-value-pasta-sauce-vs-raos",
    category: "grocery",
    generic: { product: "Great Value Traditional Pasta Sauce", brand: "Great Value", store: "Walmart", price: 1.97, size: "650 mL" },
    nameBrand: { product: "Rao's Homemade Marinara Sauce", brand: "Rao's", price: 11.99, size: "680 mL" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Different recipes at very different prices",
        content:
          "Premium sauces like Rao's are typically made without added sugar and with olive oil; many budget sauces add sugar, starch or canola oil. Read both ingredient lists — this is a comparison of recipes, not just brands.",
      },
    ],
  },

  // ─── CLEANING & LAUNDRY ─────────────────────────────────────────────────
  {
    slug: "no-name-dish-soap-vs-dawn",
    category: "cleaning",
    generic: { product: "No Name Dishwashing Liquid", brand: "No Name", store: "No Frills", price: 2.29, size: "950 mL" },
    nameBrand: { product: "Dawn Ultra Original Dishwashing Liquid", brand: "Dawn", price: 4.49, size: "828 mL" },
    evidence: [],
  },
  {
    slug: "great-value-bleach-vs-clorox",
    category: "cleaning",
    generic: { product: "Great Value Bleach", brand: "Great Value", store: "Walmart", price: 3.97, size: "3.6 L" },
    nameBrand: { product: "Javex Classic Bleach", brand: "Javex (Clorox)", price: 6.97, size: "3.6 L" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Bleach is bleach — check the strength",
        content:
          "Household bleach is sodium hypochlorite in water. The number that matters is the concentration printed on the label: a weaker bleach needs more product for the same job. In Canada, Clorox's bleach is sold under the Javex name.",
      },
    ],
  },
  {
    slug: "kirkland-laundry-pacs-vs-tide-pods",
    category: "cleaning",
    generic: { product: "Kirkland Signature Ultra Clean Laundry Pacs", brand: "Kirkland Signature", store: "Costco", price: 29.99, size: "152 pacs" },
    nameBrand: { product: "Tide Pods Original", brand: "Tide", price: 27.97, size: "81 pacs" },
    evidence: [],
  },
  {
    slug: "kirkland-dryer-sheets-vs-bounce",
    category: "cleaning",
    generic: { product: "Kirkland Signature Fabric Softener Sheets", brand: "Kirkland Signature", store: "Costco", price: 14.99, size: "500 sheets" },
    nameBrand: { product: "Bounce Outdoor Fresh Dryer Sheets", brand: "Bounce", price: 9.97, size: "240 sheets" },
    evidence: [],
  },
  {
    slug: "great-value-fabric-softener-vs-downy",
    category: "cleaning",
    generic: { product: "Great Value Liquid Fabric Softener", brand: "Great Value", store: "Walmart", price: 4.97, size: "1.53 L" },
    nameBrand: { product: "Downy Liquid Fabric Softener", brand: "Downy", price: 8.97, size: "1.53 L" },
    evidence: [],
  },
  {
    slug: "great-value-scrub-sponges-vs-scotch-brite",
    category: "cleaning",
    generic: { product: "Great Value Heavy Duty Scrub Sponges", brand: "Great Value", store: "Walmart", price: 3.97, size: "6 sponges" },
    nameBrand: { product: "Scotch-Brite Heavy Duty Scrub Sponges", brand: "Scotch-Brite", price: 7.49, size: "6 sponges" },
    evidence: [],
  },

  // ─── HOUSEHOLD ──────────────────────────────────────────────────────────
  {
    slug: "great-value-paper-towels-vs-bounty",
    category: "home-garden",
    generic: { product: "Great Value Paper Towels (6 rolls)", brand: "Great Value", store: "Walmart", price: 7.97 },
    nameBrand: { product: "Bounty Select-A-Size Paper Towels (6 rolls)", brand: "Bounty", price: 13.99 },
    evidence: [
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "Compare sheets, not rolls",
        content:
          "Roll sizes vary wildly (\"double\", \"triple\", \"mega\"), so the honest comparison is price per sheet or per square metre. Check the sheet count and sheet size on both packages before deciding.",
      },
    ],
  },
  {
    slug: "great-value-toilet-paper-vs-charmin",
    category: "home-garden",
    generic: { product: "Great Value Bathroom Tissue (12 double rolls)", brand: "Great Value", store: "Walmart", price: 7.97 },
    nameBrand: { product: "Charmin Ultra Soft Toilet Paper (12 double rolls)", brand: "Charmin", price: 13.99 },
    evidence: [],
  },
  {
    slug: "no-name-bathroom-tissue-vs-cashmere",
    category: "home-garden",
    generic: { product: "No Name 2-Ply Bathroom Tissue (12 double rolls)", brand: "No Name", store: "No Frills", price: 6.99 },
    nameBrand: { product: "Cashmere Bathroom Tissue (12 double rolls)", brand: "Cashmere", price: 12.49 },
    evidence: [],
  },
  {
    slug: "kirkland-aluminum-foil-vs-reynolds",
    category: "home-garden",
    generic: { product: "Kirkland Signature Foodservice Foil", brand: "Kirkland Signature", store: "Costco", price: 32.99, size: "1,000 sq ft (92.9 m²)" },
    nameBrand: { product: "Reynolds Wrap Aluminum Foil", brand: "Reynolds", price: 7.49, size: "75 sq ft (6.97 m²)" },
    evidence: [
      {
        type: "MANUFACTURER_INFO",
        confidence: "COMMUNITY",
        title: "Shoppers report Reynolds on the box",
        content:
          "Costco shoppers have reported that Kirkland foodservice foil boxes name Reynolds as the manufacturer. Check the fine print on your box — suppliers can change. Note the Kirkland roll is a heavier, wider foodservice format.",
      },
    ],
  },
  {
    slug: "great-value-plastic-wrap-vs-glad-cling",
    category: "home-garden",
    generic: { product: "Great Value Plastic Wrap", brand: "Great Value", store: "Walmart", price: 2.97, size: "100 m" },
    nameBrand: { product: "Glad Cling Wrap", brand: "Glad", price: 5.49, size: "100 m" },
    evidence: [],
  },
  {
    slug: "great-value-slider-bags-vs-ziploc",
    category: "home-garden",
    generic: { product: "Great Value Slider Freezer Bags, Large", brand: "Great Value", store: "Walmart", price: 3.97, size: "20 bags" },
    nameBrand: { product: "Ziploc Slider Freezer Bags, Large", brand: "Ziploc", price: 6.49, size: "20 bags" },
    evidence: [],
  },
  {
    slug: "compliments-garbage-bags-vs-glad",
    category: "home-garden",
    generic: { product: "Compliments Kitchen Catcher Bags", brand: "Compliments", store: "Sobeys", price: 5.29, size: "40 bags" },
    nameBrand: { product: "Glad Kitchen Catchers", brand: "Glad", price: 8.99, size: "40 bags" },
    evidence: [],
  },
  {
    slug: "kirkland-garbage-bags-vs-glad",
    category: "home-garden",
    generic: { product: "Kirkland Signature Flex-Tech Kitchen Bags", brand: "Kirkland Signature", store: "Costco", price: 27.99, size: "200 bags" },
    nameBrand: { product: "Glad Kitchen Catchers ForceFlex", brand: "Glad", price: 15.99, size: "80 bags" },
    evidence: [],
  },
  {
    slug: "great-value-led-bulbs-vs-philips",
    category: "home-garden",
    generic: { product: "Great Value LED A19 Bulbs, 60 W Equivalent", brand: "Great Value", store: "Walmart", price: 5.97, size: "4 bulbs" },
    nameBrand: { product: "Philips LED A19 Bulbs, 60 W Equivalent", brand: "Philips", price: 11.97, size: "4 bulbs" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Compare lumens, colour temperature and rated life",
        content:
          "The box tells you what matters: brightness (lumens), colour (e.g. 2700 K soft white vs 5000 K daylight), and rated hours. Look for a certification mark such as cUL or CSA on both.",
      },
    ],
  },
  {
    slug: "great-value-air-filters-vs-filtrete",
    category: "home-garden",
    generic: { product: "Great Value Furnace Filter, 16 x 25 x 1 in", brand: "Great Value", store: "Walmart", price: 9.97 },
    nameBrand: { product: "Filtrete Furnace Filter, 16 x 25 x 1 in", brand: "Filtrete", price: 24.97 },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "The rating matters more than the brand",
        content:
          "Furnace filters are rated by MERV (Filtrete also uses its own MPR scale). A higher rating traps finer particles like pollen and pet dander, but can restrict airflow on some furnaces. Compare filters with the same rating — a MERV 8 and a MERV 11 aren't the same product.",
      },
    ],
  },
  {
    slug: "great-value-parchment-paper-vs-reynolds",
    category: "home-garden",
    generic: { product: "Great Value Parchment Paper", brand: "Great Value", store: "Walmart", price: 3.97 },
    nameBrand: { product: "Reynolds Kitchens Parchment Paper", brand: "Reynolds", price: 6.47 },
    evidence: [],
  },

  // ─── BABY & KIDS ────────────────────────────────────────────────────────
  {
    slug: "kirkland-diapers-vs-huggies",
    category: "baby-kids",
    featured: true,
    generic: { product: "Kirkland Signature Diapers, Size 4", brand: "Kirkland Signature", store: "Costco", price: 53.99, size: "168 diapers" },
    nameBrand: { product: "Huggies Little Movers Diapers, Size 4", brand: "Huggies", price: 49.99, size: "120 diapers" },
    evidence: [
      {
        type: "MANUFACTURER_INFO",
        confidence: "COMMUNITY",
        title: "Long reported to be made by Kimberly-Clark",
        content:
          "Shoppers have long reported that Kirkland diapers are made by Kimberly-Clark, the company behind Huggies. Costco doesn't publish its suppliers and manufacturers can change, so judge by fit and leak protection — and vote.",
      },
    ],
  },
  {
    slug: "kirkland-baby-wipes-vs-huggies",
    category: "baby-kids",
    generic: { product: "Kirkland Signature Baby Wipes", brand: "Kirkland Signature", store: "Costco", price: 27.99, size: "900 wipes" },
    nameBrand: { product: "Huggies Natural Care Baby Wipes", brand: "Huggies", price: 8.99, size: "168 wipes" },
    evidence: [],
  },
  {
    slug: "pc-baby-wipes-vs-pampers-wipes",
    category: "baby-kids",
    generic: { product: "PC Baby Wipes, Unscented", brand: "President's Choice", store: "Loblaws", price: 7.99, size: "240 wipes" },
    nameBrand: { product: "Pampers Sensitive Baby Wipes", brand: "Pampers", price: 9.99, size: "168 wipes" },
    evidence: [],
  },
  {
    slug: "parents-choice-training-pants-vs-pull-ups",
    category: "baby-kids",
    generic: { product: "Parent's Choice Training Pants, 2T–3T", brand: "Parent's Choice", store: "Walmart", price: 24.97, size: "74 pants" },
    nameBrand: { product: "Huggies Pull-Ups Training Pants, 2T–3T", brand: "Huggies", price: 27.99, size: "66 pants" },
    evidence: [],
  },
  {
    slug: "parents-choice-formula-vs-similac",
    category: "baby-kids",
    generic: { product: "Parent's Choice Infant Formula with Iron, Powder", brand: "Parent's Choice", store: "Walmart", price: 27.97, size: "900 g" },
    nameBrand: { product: "Similac Pro-Advance Infant Formula, Powder", brand: "Similac", price: 54.99, size: "964 g" },
    evidence: [
      {
        type: "OTHER",
        confidence: "CONFIRMED",
        title: "All infant formula sold in Canada is regulated by Health Canada",
        content:
          "Canada's Food and Drug Regulations set composition and safety requirements for infant formula, and new formulas must be reviewed by Health Canada before sale. Recipes still differ — protein type, added ingredients like HMOs — so talk to your doctor before switching, especially for babies with allergies or reflux.",
        url: FOOD_AND_DRUG_REGS_URL,
      },
    ],
  },
  {
    slug: "compliments-baby-formula-vs-similac",
    category: "baby-kids",
    generic: { product: "Compliments Infant Formula with Iron, Powder", brand: "Compliments", store: "Sobeys", price: 29.99, size: "900 g" },
    nameBrand: { product: "Similac Pro-Advance Infant Formula, Powder", brand: "Similac", price: 54.99, size: "964 g" },
    evidence: [
      {
        type: "OTHER",
        confidence: "CONFIRMED",
        title: "All infant formula sold in Canada is regulated by Health Canada",
        content:
          "Canada's Food and Drug Regulations set composition and safety requirements for infant formula, and new formulas must be reviewed by Health Canada before sale. Recipes still differ — protein type, added ingredients like HMOs — so talk to your doctor before switching, especially for babies with allergies or reflux.",
        url: FOOD_AND_DRUG_REGS_URL,
      },
    ],
  },
  {
    slug: "equate-childrens-acetaminophen-vs-tylenol",
    category: "baby-kids",
    generic: { product: "Equate Children's Acetaminophen Oral Suspension 160 mg/5 mL", brand: "Equate", store: "Walmart", price: 6.97, size: "100 mL" },
    nameBrand: { product: "Children's Tylenol Oral Suspension 160 mg/5 mL", brand: "Tylenol", price: 11.99, size: "100 mL" },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: medicineNote("acetaminophen 160 mg per 5 mL"),
    evidence: [
      sameMedicinalIngredient("acetaminophen 160 mg per 5 mL"),
      {
        type: "OTHER",
        confidence: "COMMUNITY",
        title: "Dose by the label and the included syringe",
        content:
          "Children's products come in different concentrations (infant drops vs children's suspension). Use the dosing device that comes with the bottle, and dose by your child's weight as the label directs.",
      },
    ],
  },
  {
    slug: "equate-diaper-rash-cream-vs-desitin",
    category: "baby-kids",
    generic: { product: "Equate Zinc Oxide Diaper Rash Cream 40%", brand: "Equate", store: "Walmart", price: 6.97, size: "113 g" },
    nameBrand: { product: "Desitin Maximum Strength Diaper Rash Paste 40%", brand: "Desitin", price: 12.99, size: "113 g" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Same active ingredient strength, different base",
        content:
          "Both are 40% zinc oxide. The difference is the base — some are thick pastes, others creamier — which affects how easily they spread and wash off.",
      },
    ],
  },

  // ─── PERSONAL CARE ──────────────────────────────────────────────────────
  {
    slug: "life-brand-shampoo-vs-pantene",
    category: "personal-care",
    generic: { product: "Life Brand Classic Clean Shampoo", brand: "Life Brand", store: "Shoppers Drug Mart", price: 3.99, size: "400 mL" },
    nameBrand: { product: "Pantene Pro-V Classic Clean Shampoo", brand: "Pantene", price: 6.99, size: "375 mL" },
    evidence: [],
  },
  {
    slug: "life-brand-gentle-cleanser-vs-cetaphil",
    category: "personal-care",
    generic: { product: "Life Brand Gentle Skin Cleanser", brand: "Life Brand", store: "Shoppers Drug Mart", price: 9.99, size: "500 mL" },
    nameBrand: { product: "Cetaphil Gentle Skin Cleanser", brand: "Cetaphil", price: 17.99, size: "500 mL" },
    evidence: [],
  },
  {
    slug: "compliments-toothpaste-vs-colgate",
    category: "personal-care",
    generic: { product: "Compliments Cavity Protection Fluoride Toothpaste", brand: "Compliments", store: "Sobeys", price: 1.29, size: "130 mL" },
    nameBrand: { product: "Colgate Cavity Protection Toothpaste", brand: "Colgate", price: 2.49, size: "130 mL" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Fluoride is the ingredient that fights cavities",
        content:
          "Fluoride toothpastes sold in Canada list their fluoride source and amount on the box (for example, sodium monofluorophosphate). Taste, foam and whitening extras are where brands differ.",
      },
    ],
  },
  {
    slug: "equate-mouthwash-vs-listerine",
    category: "personal-care",
    generic: { product: "Equate Antiseptic Mouthwash, Cool Mint", brand: "Equate", store: "Walmart", price: 4.97, size: "1 L" },
    nameBrand: { product: "Listerine Cool Mint Antiseptic Mouthwash", brand: "Listerine", price: 9.99, size: "1 L" },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Look for the same essential-oil actives",
        content:
          "Listerine's antiseptic formula uses eucalyptol, menthol, methyl salicylate and thymol. Store-brand \"antiseptic\" mouthwashes often copy that list — compare the medicinal ingredients on both labels.",
      },
    ],
  },
  {
    slug: "equate-body-wash-vs-dove",
    category: "personal-care",
    generic: { product: "Equate Beauty Moisturizing Body Wash", brand: "Equate", store: "Walmart", price: 4.47, size: "532 mL" },
    nameBrand: { product: "Dove Deep Moisture Body Wash", brand: "Dove", price: 8.99, size: "650 mL" },
    evidence: [],
  },
  {
    slug: "equate-dental-floss-vs-oral-b-glide",
    category: "personal-care",
    generic: { product: "Equate Comfort Glide Dental Floss", brand: "Equate", store: "Walmart", price: 1.97, size: "40 m" },
    nameBrand: { product: "Oral-B Glide Pro-Health Floss", brand: "Oral-B", price: 4.99, size: "40 m" },
    evidence: [],
  },
  {
    slug: "equate-bandages-vs-band-aid",
    category: "personal-care",
    generic: { product: "Equate Flexible Fabric Bandages", brand: "Equate", store: "Walmart", price: 4.97, size: "100 bandages" },
    nameBrand: { product: "Band-Aid Flexible Fabric Bandages", brand: "Band-Aid", price: 9.99, size: "100 bandages" },
    evidence: [],
  },
  {
    slug: "no-name-facial-tissue-vs-kleenex",
    category: "personal-care",
    generic: { product: "No Name 2-Ply Facial Tissue", brand: "No Name", store: "No Frills", price: 5.99, size: "6 x 126 tissues" },
    nameBrand: { product: "Kleenex Trusted Care Facial Tissue", brand: "Kleenex", price: 9.99, size: "6 x 126 tissues" },
    evidence: [],
  },

  // ─── PET SUPPLIES ───────────────────────────────────────────────────────
  {
    slug: "kirkland-dog-food-vs-diamond-naturals",
    category: "pet-supplies",
    generic: { product: "Kirkland Signature Adult Formula Chicken, Rice & Vegetable Dog Food", brand: "Kirkland Signature", store: "Costco", price: 64.99, size: "18.14 kg" },
    nameBrand: { product: "Diamond Naturals Adult Chicken & Rice Dog Food", brand: "Diamond Naturals", price: 84.99, size: "18.14 kg" },
    evidence: [
      {
        type: "MANUFACTURER_INFO",
        confidence: "COMMUNITY",
        title: "Made by the same company",
        content:
          "Kirkland Signature dry dog food has been made by Diamond Pet Foods, the maker of Diamond Naturals — something that became public during a 2012 recall. Same maker doesn't mean the same recipe: compare the guaranteed analysis and first ingredients on both bags.",
      },
    ],
  },
  {
    slug: "kirkland-natures-domain-vs-taste-of-the-wild",
    category: "pet-supplies",
    generic: { product: "Kirkland Signature Nature's Domain Salmon Meal & Sweet Potato Dog Food", brand: "Kirkland Signature", store: "Costco", price: 59.99, size: "15.87 kg" },
    nameBrand: { product: "Taste of the Wild Pacific Stream Dog Food", brand: "Taste of the Wild", price: 92.99, size: "12.7 kg" },
    evidence: [
      {
        type: "MANUFACTURER_INFO",
        confidence: "COMMUNITY",
        title: "Both come from Diamond Pet Foods",
        content:
          "Taste of the Wild is a Diamond Pet Foods brand, and Diamond has also produced Kirkland's Nature's Domain line. The formulas are similar in style (grain-free, fish-based) but not identical — compare the ingredient lists.",
      },
    ],
  },
  {
    slug: "kirkland-cat-litter-vs-tidy-cats",
    category: "pet-supplies",
    generic: { product: "Kirkland Signature Clumping Cat Litter", brand: "Kirkland Signature", store: "Costco", price: 19.99, size: "18.14 kg" },
    nameBrand: { product: "Tidy Cats Clumping Cat Litter", brand: "Tidy Cats", price: 19.99, size: "9.07 kg" },
    evidence: [],
  },

  // ─── ELECTRONICS ────────────────────────────────────────────────────────
  {
    slug: "kirkland-batteries-vs-duracell",
    category: "electronics",
    generic: { product: "Kirkland Signature AA Alkaline Batteries", brand: "Kirkland Signature", store: "Costco", price: 24.99, size: "48 batteries" },
    nameBrand: { product: "Duracell Coppertop AA Alkaline Batteries", brand: "Duracell", price: 24.99, size: "24 batteries" },
    evidence: [
      {
        type: "MANUFACTURER_INFO",
        confidence: "COMMUNITY",
        title: "Widely reported to be made by Duracell",
        content:
          "It's widely reported that Duracell makes Kirkland Signature alkaline batteries. Costco doesn't print the supplier on the pack and suppliers can change, so judge by how long they last in your devices — and vote.",
      },
    ],
  },
  {
    slug: "amazon-basics-batteries-vs-duracell",
    category: "electronics",
    generic: { product: "Amazon Basics AA Alkaline Batteries", brand: "Amazon Basics", store: "Amazon.ca", price: 19.99, size: "48 batteries" },
    nameBrand: { product: "Duracell Coppertop AA Alkaline Batteries", brand: "Duracell", price: 24.99, size: "24 batteries" },
    evidence: [],
  },
  {
    slug: "amazon-basics-hdmi-vs-monster",
    category: "electronics",
    generic: { product: "Amazon Basics High-Speed HDMI Cable, 1.8 m", brand: "Amazon Basics", store: "Amazon.ca", price: 10.99 },
    nameBrand: { product: "Monster High-Speed HDMI Cable, 1.8 m", brand: "Monster", price: 39.99 },
    editorialVerdict: "SAME_QUALITY",
    editorialNote: "HDMI is a digital standard: a cable rated for the same HDMI speed delivers the identical picture and sound.",
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "CONFIRMED",
        title: "Digital signal: it either works or it doesn't",
        content:
          "HDMI carries a digital signal, so a cable can't make the picture \"sharper\" or colours \"richer\". What matters is the certified speed rating defined by the HDMI specification — High Speed for 1080p, Premium High Speed for 4K at 60 Hz, Ultra High Speed for 4K at 120 Hz and 8K. Match the rating to your devices and the cheaper cable performs the same.",
        url: "https://www.hdmi.org/",
      },
    ],
  },
  {
    slug: "amazon-basics-usb-c-vs-apple",
    category: "electronics",
    generic: { product: "Amazon Basics USB-C to USB-C Charging Cable", brand: "Amazon Basics", store: "Amazon.ca", price: 12.99 },
    nameBrand: { product: "Apple USB-C Charge Cable", brand: "Apple", price: 25.0 },
    evidence: [
      {
        type: "INGREDIENT_COMPARISON",
        confidence: "COMMUNITY",
        title: "Check the wattage and data speed",
        content:
          "USB-C cables vary in how much power they carry (60 W vs 240 W) and how fast they move data. A cable with the same ratings — ideally USB-IF certified — will charge your device the same way.",
      },
    ],
  },
  {
    slug: "amazon-basics-phone-case-vs-otterbox",
    category: "electronics",
    generic: { product: "Amazon Basics Protective Phone Case", brand: "Amazon Basics", store: "Amazon.ca", price: 16.99 },
    nameBrand: { product: "OtterBox Commuter Series Case", brand: "OtterBox", price: 54.99 },
    evidence: [],
  },
];

/**
 * Comparisons from the original (mostly US) seed that no longer fit a Canadian
 * catalogue. They are archived — hidden but kept — never deleted, so any real
 * votes and history survive and an admin can restore them.
 */
const NOT_IN_CANADA = "Store or brand not sold in Canada";
const NOT_EVERYDAY = "Not an everyday product";
const DUPLICATE = "Duplicate of another comparison";
const REPLACED = "Replaced by a Canadian equivalent";
const UNVERIFIED = "Product not verified as available in Canada";

export const ARCHIVED_LEGACY_SLUGS: ArchivedSlug[] = [
  // Grocery
  { slug: "kirkland-tuna-vs-bumble-bee-tuna", reason: REPLACED },
  { slug: "kirkland-cranberry-juice-vs-ocean-spray", reason: UNVERIFIED },
  { slug: "kirkland-k-cups-vs-green-mountain", reason: UNVERIFIED },
  { slug: "kirkland-frozen-pizza-vs-palermos", reason: NOT_IN_CANADA },
  { slug: "kirkland-bacon-vs-hormel", reason: NOT_IN_CANADA },
  { slug: "kirkland-jelly-beans-vs-jelly-belly", reason: UNVERIFIED },
  { slug: "great-value-ice-cream-vs-blue-bunny", reason: NOT_IN_CANADA },
  { slug: "great-value-chicken-nuggets-vs-perdue", reason: NOT_IN_CANADA },
  { slug: "millville-cereal-vs-honey-bunches-of-oats", reason: NOT_IN_CANADA },
  { slug: "trader-joes-pita-chips-vs-stacys", reason: NOT_IN_CANADA },
  { slug: "trader-joes-pistachios-vs-wonderful", reason: NOT_IN_CANADA },
  { slug: "trader-joes-yogurt-vs-stonyfield", reason: NOT_IN_CANADA },
  { slug: "trader-joes-salad-kits-vs-taylor-farms", reason: NOT_IN_CANADA },
  { slug: "trader-joes-baguettes-vs-la-boulangerie", reason: NOT_IN_CANADA },
  { slug: "friendly-farms-yogurt-vs-ehrmann", reason: NOT_IN_CANADA },
  { slug: "great-value-cinnamon-rolls-vs-sara-lee", reason: NOT_IN_CANADA },
  { slug: "kirkland-bourbon-vs-1792", reason: NOT_EVERYDAY },
  { slug: "market-pantry-ketchup-vs-heinz", reason: NOT_IN_CANADA },
  { slug: "sams-choice-cola-vs-coca-cola", reason: REPLACED },
  { slug: "bakers-corner-flour-vs-gold-medal", reason: NOT_IN_CANADA },
  { slug: "great-value-frozen-vegetables-vs-birds-eye", reason: DUPLICATE },
  { slug: "great-value-vegetable-oil-vs-wesson", reason: REPLACED },
  { slug: "pc-blue-menu-granola-vs-nature-valley", reason: UNVERIFIED },
  { slug: "great-value-maple-syrup-vs-aunt-jemima", reason: "Compares two different kinds of product (pure maple syrup vs table syrup)" },
  { slug: "earth-grown-frozen-dessert-vs-ben-jerrys", reason: NOT_IN_CANADA },
  // Health
  { slug: "up-and-up-acetaminophen-vs-tylenol", reason: NOT_IN_CANADA },
  { slug: "kirkland-allerclear-vs-claritin", reason: REPLACED },
  { slug: "kirkland-diphenhydramine-vs-benadryl", reason: UNVERIFIED },
  { slug: "equate-omeprazole-vs-prilosec", reason: "Prilosec is not sold over the counter in Canada" },
  { slug: "cvs-cetirizine-vs-zyrtec", reason: NOT_IN_CANADA },
  { slug: "kirkland-sleep-aid-vs-unisom", reason: UNVERIFIED },
  { slug: "cvs-mucus-relief-vs-mucinex", reason: NOT_IN_CANADA },
  { slug: "equate-famotidine-vs-pepcid", reason: REPLACED },
  { slug: "kirkland-minoxidil-vs-rogaine", reason: UNVERIFIED },
  { slug: "equate-fexofenadine-vs-allegra", reason: REPLACED },
  { slug: "equate-nicotine-gum-vs-nicorette", reason: REPLACED },
  { slug: "up-and-up-loperamide-vs-imodium", reason: NOT_IN_CANADA },
  { slug: "kirkland-calcium-vs-caltrate", reason: UNVERIFIED },
  { slug: "equate-melatonin-vs-natrol", reason: REPLACED },
  { slug: "equate-ranitidine-vs-zantac", reason: "Ranitidine was withdrawn from the Canadian market" },
  // Cleaning / household
  { slug: "great-value-dish-soap-vs-dawn", reason: DUPLICATE },
  { slug: "generic-interior-paint-vs-benjamin-moore", reason: NOT_EVERYDAY },
  { slug: "up-and-up-all-purpose-cleaner-vs-windex", reason: NOT_IN_CANADA },
  { slug: "up-and-up-magic-eraser-vs-mr-clean", reason: NOT_IN_CANADA },
  { slug: "boulder-paper-towels-vs-bounty", reason: NOT_IN_CANADA },
  { slug: "pc-green-cleaning-spray-vs-seventh-generation", reason: UNVERIFIED },
  { slug: "great-value-trash-bags-vs-glad", reason: DUPLICATE },
  { slug: "great-value-9v-batteries-vs-energizer", reason: DUPLICATE },
  { slug: "kirkland-mattress-vs-stearns-foster", reason: NOT_EVERYDAY },
  // Baby
  { slug: "up-and-up-formula-vs-enfamil", reason: NOT_IN_CANADA },
  { slug: "up-and-up-childrens-ibuprofen-vs-motrin", reason: NOT_IN_CANADA },
  // Personal care
  { slug: "kirkland-contact-lenses-vs-coopervision", reason: NOT_EVERYDAY },
  { slug: "kirkland-moisturizing-lotion-vs-lubriderm", reason: UNVERIFIED },
  { slug: "up-and-up-sunscreen-vs-coppertone", reason: NOT_IN_CANADA },
  { slug: "up-and-up-cotton-swabs-vs-q-tips", reason: NOT_IN_CANADA },
  { slug: "up-and-up-feminine-pads-vs-always", reason: NOT_IN_CANADA },
  { slug: "equate-toothpaste-vs-colgate", reason: DUPLICATE },
  // Pet
  { slug: "kirkland-puppy-food-vs-diamond-puppy", reason: DUPLICATE },
  { slug: "great-value-cat-food-vs-friskies", reason: UNVERIFIED },
  { slug: "great-value-dog-biscuits-vs-milk-bone", reason: UNVERIFIED },
  { slug: "great-value-cat-litter-vs-tidy-cats", reason: REPLACED },
  { slug: "petarmor-plus-vs-frontline-plus", reason: NOT_IN_CANADA },
  { slug: "ol-roy-dog-food-vs-purina-one", reason: NOT_IN_CANADA },
  // Electronics / other
  { slug: "kirkland-golf-balls-vs-titleist-pro-v1", reason: NOT_EVERYDAY },
  { slug: "great-value-copy-paper-vs-hammermill", reason: NOT_EVERYDAY },
  { slug: "kirkland-party-cups-vs-chinet", reason: UNVERIFIED },
];
