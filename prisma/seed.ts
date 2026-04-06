import "dotenv/config";
import { PrismaClient, ComparisonStatus, EvidenceType, EvidenceConfidence, UserRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { computeVerdict } from "../src/lib/verdict";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Generate vote distributions that produce the target verdict.
// SAME_QUALITY: ~70% same, 20% close, 10% not
// CLOSE_ENOUGH: ~25% same, 50% close, 25% not
// NOT_WORTH_IT: ~10% same, 20% close, 70% not
function generateVotes(
  targetVerdict: "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT",
  totalVotes: number
): { sameQuality: number; closeEnough: number; notWorthIt: number } {
  let sameQuality: number, closeEnough: number, notWorthIt: number;
  if (targetVerdict === "SAME_QUALITY") {
    sameQuality = Math.round(totalVotes * 0.70);
    closeEnough = Math.round(totalVotes * 0.20);
    notWorthIt = totalVotes - sameQuality - closeEnough;
  } else if (targetVerdict === "CLOSE_ENOUGH") {
    closeEnough = Math.round(totalVotes * 0.50);
    sameQuality = Math.round(totalVotes * 0.25);
    notWorthIt = totalVotes - sameQuality - closeEnough;
  } else {
    notWorthIt = Math.round(totalVotes * 0.70);
    closeEnough = Math.round(totalVotes * 0.20);
    sameQuality = totalVotes - notWorthIt - closeEnough;
  }
  // Clamp negatives
  sameQuality = Math.max(0, sameQuality);
  closeEnough = Math.max(0, closeEnough);
  notWorthIt = Math.max(0, notWorthIt);
  return { sameQuality, closeEnough, notWorthIt };
}

function makeVotes(
  targetVerdict: "SAME_QUALITY" | "CLOSE_ENOUGH" | "NOT_WORTH_IT",
  totalVotes: number
) {
  const votes = generateVotes(targetVerdict, totalVotes);
  const result = computeVerdict(votes);
  return {
    verdict: result.verdict,
    confidenceScore: result.confidenceScore,
    totalVotes: result.totalVotes,
  };
}

async function main() {
  console.log("Seeding database...");

  // Step 1: Clear existing data in correct FK order
  await prisma.evidence.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.productComparison.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("Cleared existing data.");

  // Step 2: Create 8 categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Grocery", slug: "grocery", icon: "🛒" } }),
    prisma.category.create({ data: { name: "Health & OTC", slug: "health-otc", icon: "💊" } }),
    prisma.category.create({ data: { name: "Cleaning", slug: "cleaning", icon: "🧹" } }),
    prisma.category.create({ data: { name: "Baby & Kids", slug: "baby-kids", icon: "👶" } }),
    prisma.category.create({ data: { name: "Personal Care", slug: "personal-care", icon: "🧴" } }),
    prisma.category.create({ data: { name: "Pet Supplies", slug: "pet-supplies", icon: "🐕" } }),
    prisma.category.create({ data: { name: "Electronics", slug: "electronics", icon: "🔋" } }),
    prisma.category.create({ data: { name: "Home & Garden", slug: "home-garden", icon: "🏠" } }),
  ]);

  const [grocery, health, cleaning, baby, personalCare, petSupplies, electronics, homeGarden] =
    categories;
  console.log("Created 8 categories.");

  // Step 3: Create 1 admin user
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@genericornot.com",
      name: "Admin",
      role: UserRole.ADMIN,
    },
  });
  console.log("Created admin user.");

  // ─── GROCERY (25 products) ───────────────────────────────────────────────

  const groceryComparisons = [
    {
      slug: "kirkland-tuna-vs-bumble-bee-tuna",
      genericProductName: "Kirkland Signature Chunk Light Tuna",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 2.50,
      nameBrandProductName: "Bumble Bee Chunk Light Tuna",
      nameBrand: "Bumble Bee",
      nameBrandPrice: 3.29,
      ...makeVotes("SAME_QUALITY", 312),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2026-02-15"),
    },
    {
      slug: "kirkland-cranberry-juice-vs-ocean-spray",
      genericProductName: "Kirkland Signature Cranberry Juice Cocktail",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 6.99,
      nameBrandProductName: "Ocean Spray Cranberry Juice Cocktail",
      nameBrand: "Ocean Spray",
      nameBrandPrice: 4.49,
      ...makeVotes("SAME_QUALITY", 247),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2026-03-10"),
    },
    {
      slug: "kirkland-k-cups-vs-green-mountain",
      genericProductName: "Kirkland Signature K-Cup Pods",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 0.30,
      nameBrandProductName: "Green Mountain Coffee K-Cup Pods",
      nameBrand: "Green Mountain",
      nameBrandPrice: 0.55,
      ...makeVotes("SAME_QUALITY", 489),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2026-02-20"),
    },
    {
      slug: "kirkland-coffee-vs-starbucks",
      genericProductName: "Kirkland Signature Custom Roast Medium Coffee",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "Starbucks House Blend",
      nameBrand: "Starbucks",
      nameBrandPrice: 11.99,
      ...makeVotes("SAME_QUALITY", 378),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-frozen-pizza-vs-palermos",
      genericProductName: "Kirkland Signature Pepperoni Pizza",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 10.99,
      nameBrandProductName: "Palermo's Primo Thin Pepperoni Pizza",
      nameBrand: "Palermo's",
      nameBrandPrice: 5.99,
      ...makeVotes("SAME_QUALITY", 201),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-bacon-vs-hormel",
      genericProductName: "Kirkland Signature Fully Cooked Bacon",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "Hormel Black Label Fully Cooked Bacon",
      nameBrand: "Hormel",
      nameBrandPrice: 6.99,
      ...makeVotes("SAME_QUALITY", 265),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-jelly-beans-vs-jelly-belly",
      genericProductName: "Kirkland Signature Gourmet Jelly Beans",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 11.99,
      nameBrandProductName: "Jelly Belly Jelly Beans",
      nameBrand: "Jelly Belly",
      nameBrandPrice: 9.99,
      ...makeVotes("SAME_QUALITY", 183),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-ice-cream-vs-blue-bunny",
      genericProductName: "Great Value Ice Cream",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.42,
      nameBrandProductName: "Blue Bunny Ice Cream",
      nameBrand: "Wells Dairy",
      nameBrandPrice: 4.98,
      ...makeVotes("CLOSE_ENOUGH", 154),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-chicken-nuggets-vs-perdue",
      genericProductName: "Great Value Frozen Chicken Nuggets",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 5.96,
      nameBrandProductName: "Perdue Chicken Breast Nuggets",
      nameBrand: "Perdue Farms",
      nameBrandPrice: 8.99,
      ...makeVotes("SAME_QUALITY", 220),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "millville-cereal-vs-honey-bunches-of-oats",
      genericProductName: "Millville Honey Crunch 'n Oats",
      genericBrand: "Millville",
      genericStore: "Aldi",
      genericPrice: 2.29,
      nameBrandProductName: "Honey Bunches of Oats",
      nameBrand: "Post",
      nameBrandPrice: 4.99,
      ...makeVotes("SAME_QUALITY", 308),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "trader-joes-pita-chips-vs-stacys",
      genericProductName: "Trader Joe's Pita Chips with Sea Salt",
      genericBrand: "Trader Joe's",
      genericStore: "Trader Joe's",
      genericPrice: 2.49,
      nameBrandProductName: "Stacy's Simply Naked Pita Chips",
      nameBrand: "Stacy's",
      nameBrandPrice: 4.99,
      ...makeVotes("SAME_QUALITY", 275),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "trader-joes-pistachios-vs-wonderful",
      genericProductName: "Trader Joe's Dry Roasted & Salted Pistachios",
      genericBrand: "Trader Joe's",
      genericStore: "Trader Joe's",
      genericPrice: 6.99,
      nameBrandProductName: "Wonderful Pistachios Roasted & Salted",
      nameBrand: "Wonderful",
      nameBrandPrice: 9.98,
      ...makeVotes("SAME_QUALITY", 192),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "trader-joes-yogurt-vs-stonyfield",
      genericProductName: "Trader Joe's Organic Yogurt",
      genericBrand: "Trader Joe's",
      genericStore: "Trader Joe's",
      genericPrice: 0.99,
      nameBrandProductName: "Stonyfield Organic Yogurt",
      nameBrand: "Stonyfield Farm",
      nameBrandPrice: 1.59,
      ...makeVotes("SAME_QUALITY", 231),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "trader-joes-salad-kits-vs-taylor-farms",
      genericProductName: "Trader Joe's Lemony Basil Arugula Salad Kit",
      genericBrand: "Trader Joe's",
      genericStore: "Trader Joe's",
      genericPrice: 3.99,
      nameBrandProductName: "Taylor Farms Salad Kits",
      nameBrand: "Taylor Farms",
      nameBrandPrice: 4.49,
      ...makeVotes("SAME_QUALITY", 167),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "friendly-farms-yogurt-vs-ehrmann",
      genericProductName: "Friendly Farms Greek Yogurt",
      genericBrand: "Friendly Farms",
      genericStore: "Aldi",
      genericPrice: 0.79,
      nameBrandProductName: "Green Mountain Creamery Greek Yogurt",
      nameBrand: "Ehrmann Commonwealth Dairy",
      nameBrandPrice: 1.29,
      ...makeVotes("SAME_QUALITY", 144),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-cinnamon-rolls-vs-sara-lee",
      genericProductName: "Great Value Cinnamon Rolls",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.48,
      nameBrandProductName: "Sara Lee Cinnamon Rolls",
      nameBrand: "Sara Lee",
      nameBrandPrice: 5.49,
      ...makeVotes("SAME_QUALITY", 178),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-bourbon-vs-1792",
      genericProductName: "Kirkland Signature Small Batch Bourbon",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 24.99,
      nameBrandProductName: "1792 Small Batch Bourbon",
      nameBrand: "Barton 1792",
      nameBrandPrice: 30.99,
      ...makeVotes("CLOSE_ENOUGH", 120),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "market-pantry-ketchup-vs-heinz",
      genericProductName: "Market Pantry Ketchup",
      genericBrand: "Market Pantry",
      genericStore: "Target",
      genericPrice: 1.79,
      nameBrandProductName: "Heinz Tomato Ketchup",
      nameBrand: "Heinz",
      nameBrandPrice: 4.29,
      ...makeVotes("CLOSE_ENOUGH", 310),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-mac-cheese-vs-kraft",
      genericProductName: "Great Value Macaroni & Cheese",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 0.78,
      nameBrandProductName: "Kraft Macaroni & Cheese",
      nameBrand: "Kraft",
      nameBrandPrice: 1.48,
      ...makeVotes("NOT_WORTH_IT", 495),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "sams-choice-cola-vs-coca-cola",
      genericProductName: "Sam's Choice Cola",
      genericBrand: "Sam's Choice",
      genericStore: "Walmart",
      genericPrice: 0.78,
      nameBrandProductName: "Coca-Cola Classic",
      nameBrand: "Coca-Cola",
      nameBrandPrice: 2.18,
      ...makeVotes("NOT_WORTH_IT", 487),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-pasta-sauce-vs-raos",
      genericProductName: "Great Value Traditional Pasta Sauce",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 1.76,
      nameBrandProductName: "Rao's Homemade Marinara",
      nameBrand: "Rao's",
      nameBrandPrice: 8.99,
      ...makeVotes("NOT_WORTH_IT", 402),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "bakers-corner-flour-vs-gold-medal",
      genericProductName: "Baker's Corner All-Purpose Flour",
      genericBrand: "Baker's Corner",
      genericStore: "Aldi",
      genericPrice: 1.99,
      nameBrandProductName: "Gold Medal All-Purpose Flour",
      nameBrand: "General Mills",
      nameBrandPrice: 3.49,
      ...makeVotes("SAME_QUALITY", 189),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "trader-joes-baguettes-vs-la-boulangerie",
      genericProductName: "Trader Joe's Cranberry Twist Baguettes",
      genericBrand: "Trader Joe's",
      genericStore: "Trader Joe's",
      genericPrice: 3.49,
      nameBrandProductName: "La Boulangerie Bakery Baguettes",
      nameBrand: "La Boulangerie",
      nameBrandPrice: 5.99,
      ...makeVotes("SAME_QUALITY", 143),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-frozen-vegetables-vs-birds-eye",
      genericProductName: "Great Value Frozen Mixed Vegetables",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 1.00,
      nameBrandProductName: "Birds Eye Steamfresh Mixed Vegetables",
      nameBrand: "Birds Eye",
      nameBrandPrice: 2.78,
      ...makeVotes("SAME_QUALITY", 334),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-vegetable-oil-vs-wesson",
      genericProductName: "Great Value Vegetable Oil",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.44,
      nameBrandProductName: "Wesson Vegetable Oil",
      nameBrand: "Wesson",
      nameBrandPrice: 5.28,
      ...makeVotes("SAME_QUALITY", 156),
      // PENDING for admin queue testing
      status: ComparisonStatus.PENDING,
    },
  ];

  // ─── HEALTH & OTC (18 products) ─────────────────────────────────────────

  const healthComparisons = [
    {
      slug: "equate-ibuprofen-vs-advil",
      genericProductName: "Equate Ibuprofen 200mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 4.88,
      nameBrandProductName: "Advil Ibuprofen 200mg",
      nameBrand: "Advil",
      nameBrandPrice: 14.99,
      ...makeVotes("SAME_QUALITY", 500),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2026-03-01"),
    },
    {
      slug: "up-and-up-acetaminophen-vs-tylenol",
      genericProductName: "Up & Up Acetaminophen 500mg",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 5.99,
      nameBrandProductName: "Tylenol Extra Strength 500mg",
      nameBrand: "Tylenol",
      nameBrandPrice: 13.99,
      ...makeVotes("SAME_QUALITY", 482),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-allerclear-vs-claritin",
      genericProductName: "Kirkland Signature AllerClear (Loratadine 10mg)",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "Claritin 24-Hour (Loratadine 10mg)",
      nameBrand: "Claritin",
      nameBrandPrice: 29.99,
      ...makeVotes("SAME_QUALITY", 418),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2024-12-01"), // ~16 months ago — red
    },
    {
      slug: "kirkland-diphenhydramine-vs-benadryl",
      genericProductName: "Kirkland Signature Allergy Medicine (Diphenhydramine 25mg)",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 8.99,
      nameBrandProductName: "Benadryl Allergy Ultratab (Diphenhydramine 25mg)",
      nameBrand: "Benadryl",
      nameBrandPrice: 12.99,
      ...makeVotes("SAME_QUALITY", 371),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-omeprazole-vs-prilosec",
      genericProductName: "Equate Omeprazole 20mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 14.98,
      nameBrandProductName: "Prilosec OTC (Omeprazole 20mg)",
      nameBrand: "Prilosec",
      nameBrandPrice: 25.99,
      ...makeVotes("SAME_QUALITY", 345),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "cvs-cetirizine-vs-zyrtec",
      genericProductName: "CVS Health Cetirizine 10mg",
      genericBrand: "CVS Health",
      genericStore: "CVS",
      genericPrice: 16.99,
      nameBrandProductName: "Zyrtec (Cetirizine 10mg)",
      nameBrand: "Zyrtec",
      nameBrandPrice: 32.99,
      ...makeVotes("SAME_QUALITY", 298),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-sleep-aid-vs-unisom",
      genericProductName: "Kirkland Signature Sleep Aid (Doxylamine Succinate 25mg)",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 7.99,
      nameBrandProductName: "Unisom SleepTabs (Doxylamine Succinate 25mg)",
      nameBrand: "Unisom",
      nameBrandPrice: 11.99,
      ...makeVotes("SAME_QUALITY", 267),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-naproxen-vs-aleve",
      genericProductName: "Equate Naproxen Sodium 220mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 6.97,
      nameBrandProductName: "Aleve (Naproxen Sodium 220mg)",
      nameBrand: "Aleve",
      nameBrandPrice: 14.97,
      ...makeVotes("SAME_QUALITY", 319),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "cvs-mucus-relief-vs-mucinex",
      genericProductName: "CVS Health Mucus Relief (Guaifenesin 600mg ER)",
      genericBrand: "CVS Health",
      genericStore: "CVS",
      genericPrice: 12.99,
      nameBrandProductName: "Mucinex 12-Hour (Guaifenesin 600mg ER)",
      nameBrand: "Mucinex",
      nameBrandPrice: 23.99,
      ...makeVotes("SAME_QUALITY", 241),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-famotidine-vs-pepcid",
      genericProductName: "Equate Acid Reducer (Famotidine 20mg)",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 7.48,
      nameBrandProductName: "Pepcid AC (Famotidine 20mg)",
      nameBrand: "Pepcid",
      nameBrandPrice: 16.99,
      ...makeVotes("SAME_QUALITY", 203),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-minoxidil-vs-rogaine",
      genericProductName: "Kirkland Signature Minoxidil 5% Foam",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 19.99,
      nameBrandProductName: "Rogaine Men's 5% Minoxidil Foam",
      nameBrand: "Rogaine",
      nameBrandPrice: 49.99,
      ...makeVotes("SAME_QUALITY", 388),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-fexofenadine-vs-allegra",
      genericProductName: "Equate Non-Drowsy Allergy Relief (Fexofenadine 180mg)",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 14.97,
      nameBrandProductName: "Allegra 24-Hour (Fexofenadine 180mg)",
      nameBrand: "Allegra",
      nameBrandPrice: 34.99,
      ...makeVotes("SAME_QUALITY", 276),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-nicotine-gum-vs-nicorette",
      genericProductName: "Equate Nicotine Polacrilex Gum 4mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 29.97,
      nameBrandProductName: "Nicorette Gum 4mg",
      nameBrand: "Nicorette",
      nameBrandPrice: 52.99,
      ...makeVotes("SAME_QUALITY", 157),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-loperamide-vs-imodium",
      genericProductName: "Up & Up Loperamide 2mg",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 4.99,
      nameBrandProductName: "Imodium A-D (Loperamide 2mg)",
      nameBrand: "Imodium",
      nameBrandPrice: 10.99,
      ...makeVotes("SAME_QUALITY", 184),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-aspirin-vs-bayer",
      genericProductName: "Equate Aspirin 325mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 3.47,
      nameBrandProductName: "Bayer Aspirin 325mg",
      nameBrand: "Bayer",
      nameBrandPrice: 9.97,
      ...makeVotes("SAME_QUALITY", 421),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-calcium-vs-caltrate",
      genericProductName: "Kirkland Signature Calcium 600mg + D3",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 11.99,
      nameBrandProductName: "Caltrate 600+D3",
      nameBrand: "Caltrate",
      nameBrandPrice: 14.99,
      ...makeVotes("SAME_QUALITY", 198),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-melatonin-vs-natrol",
      genericProductName: "Equate Melatonin 5mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 4.47,
      nameBrandProductName: "Natrol Melatonin 5mg",
      nameBrand: "Natrol",
      nameBrandPrice: 9.99,
      ...makeVotes("SAME_QUALITY", 312),
      status: ComparisonStatus.APPROVED,
    },
    // #41 — ranitidine recalled, use null prices
    {
      slug: "equate-ranitidine-vs-zantac",
      genericProductName: "Equate Ranitidine",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: null,
      nameBrandProductName: "Zantac (Ranitidine)",
      nameBrand: "Zantac",
      nameBrandPrice: null,
      ...makeVotes("SAME_QUALITY", 88),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // ─── CLEANING (10 products) ──────────────────────────────────────────────

  const cleaningComparisons = [
    {
      slug: "kirkland-laundry-pacs-vs-tide-pods",
      genericProductName: "Kirkland Signature Ultra Clean Laundry Pacs",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 19.99,
      nameBrandProductName: "Tide PODS Laundry Detergent",
      nameBrand: "Tide",
      nameBrandPrice: 24.99,
      ...makeVotes("CLOSE_ENOUGH", 295),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-bleach-vs-clorox",
      genericProductName: "Great Value Bleach",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 2.97,
      nameBrandProductName: "Clorox Disinfecting Bleach",
      nameBrand: "Clorox",
      nameBrandPrice: 5.49,
      ...makeVotes("SAME_QUALITY", 387),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-dish-soap-vs-dawn",
      genericProductName: "Great Value Ultra Concentrated Dish Soap",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 2.97,
      nameBrandProductName: "Dawn Ultra Platinum Dish Soap",
      nameBrand: "Dawn",
      nameBrandPrice: 4.97,
      ...makeVotes("NOT_WORTH_IT", 412),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "generic-interior-paint-vs-benjamin-moore",
      genericProductName: "Great Value / Budget Interior Latex Paint",
      genericBrand: "Various store brands",
      genericStore: "Various",
      genericPrice: 25.00,
      nameBrandProductName: "Benjamin Moore Regal Select",
      nameBrand: "Benjamin Moore",
      nameBrandPrice: 65.00,
      ...makeVotes("NOT_WORTH_IT", 231),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-dryer-sheets-vs-bounce",
      genericProductName: "Kirkland Signature Fabric Softener Sheets",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 12.99,
      nameBrandProductName: "Bounce Dryer Sheets",
      nameBrand: "Bounce",
      nameBrandPrice: 11.99,
      ...makeVotes("CLOSE_ENOUGH", 176),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-aluminum-foil-vs-reynolds",
      genericProductName: "Kirkland Signature Foodservice Foil",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 29.99,
      nameBrandProductName: "Reynolds Wrap Aluminum Foil",
      nameBrand: "Reynolds",
      nameBrandPrice: 7.99,
      ...makeVotes("SAME_QUALITY", 253),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-all-purpose-cleaner-vs-windex",
      genericProductName: "Up & Up All-Purpose Cleaner",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 2.99,
      nameBrandProductName: "Windex Multi-Surface Cleaner",
      nameBrand: "Windex",
      nameBrandPrice: 4.99,
      ...makeVotes("CLOSE_ENOUGH", 201),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-magic-eraser-vs-mr-clean",
      genericProductName: "Up & Up Cleaning Eraser Pads",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 3.99,
      nameBrandProductName: "Mr. Clean Magic Eraser",
      nameBrand: "Mr. Clean",
      nameBrandPrice: 6.99,
      ...makeVotes("CLOSE_ENOUGH", 189),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-paper-towels-vs-bounty",
      genericProductName: "Great Value Paper Towels",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 0.75,
      nameBrandProductName: "Bounty Select-A-Size",
      nameBrand: "Bounty",
      nameBrandPrice: 1.50,
      ...makeVotes("NOT_WORTH_IT", 347),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "boulder-paper-towels-vs-bounty",
      genericProductName: "Boulder Paper Towels",
      genericBrand: "Boulder",
      genericStore: "Aldi",
      genericPrice: 0.89,
      nameBrandProductName: "Bounty Select-A-Size",
      nameBrand: "Bounty",
      nameBrandPrice: 1.50,
      ...makeVotes("CLOSE_ENOUGH", 128),
      // PENDING for admin queue testing
      status: ComparisonStatus.PENDING,
    },
  ];

  // ─── BABY & KIDS (8 products) ────────────────────────────────────────────

  const babyComparisons = [
    {
      slug: "kirkland-diapers-vs-huggies",
      genericProductName: "Kirkland Signature Supreme Diapers",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 0.18,
      nameBrandProductName: "Huggies Little Snugglers",
      nameBrand: "Huggies",
      nameBrandPrice: 0.35,
      ...makeVotes("SAME_QUALITY", 465),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2025-07-01"), // ~9 months ago — amber
    },
    {
      slug: "parents-choice-formula-vs-similac",
      genericProductName: "Parent's Choice Infant Formula",
      genericBrand: "Parent's Choice",
      genericStore: "Walmart",
      genericPrice: 19.98,
      nameBrandProductName: "Similac Pro-Advance",
      nameBrand: "Similac",
      nameBrandPrice: 35.99,
      ...makeVotes("SAME_QUALITY", 312),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-formula-vs-enfamil",
      genericProductName: "Up & Up Infant Formula with Iron",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 22.99,
      nameBrandProductName: "Enfamil NeuroPro",
      nameBrand: "Enfamil",
      nameBrandPrice: 37.99,
      ...makeVotes("SAME_QUALITY", 278),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-baby-wipes-vs-huggies",
      genericProductName: "Kirkland Signature Baby Wipes",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 0.02,
      nameBrandProductName: "Huggies Natural Care Baby Wipes",
      nameBrand: "Huggies",
      nameBrandPrice: 0.04,
      ...makeVotes("CLOSE_ENOUGH", 234),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-childrens-acetaminophen-vs-tylenol",
      genericProductName: "Equate Children's Acetaminophen",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 4.47,
      nameBrandProductName: "Children's Tylenol",
      nameBrand: "Tylenol",
      nameBrandPrice: 8.97,
      ...makeVotes("SAME_QUALITY", 321),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-childrens-ibuprofen-vs-motrin",
      genericProductName: "Up & Up Children's Ibuprofen",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 4.99,
      nameBrandProductName: "Children's Motrin",
      nameBrand: "Motrin",
      nameBrandPrice: 9.49,
      ...makeVotes("SAME_QUALITY", 289),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-diaper-rash-cream-vs-desitin",
      genericProductName: "Equate Diaper Rash Cream (Zinc Oxide 40%)",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 4.97,
      nameBrandProductName: "Desitin Maximum Strength (Zinc Oxide 40%)",
      nameBrand: "Desitin",
      nameBrandPrice: 8.49,
      ...makeVotes("SAME_QUALITY", 198),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "parents-choice-training-pants-vs-pull-ups",
      genericProductName: "Parent's Choice Training Pants",
      genericBrand: "Parent's Choice",
      genericStore: "Walmart",
      genericPrice: 0.25,
      nameBrandProductName: "Huggies Pull-Ups",
      nameBrand: "Huggies",
      nameBrandPrice: 0.50,
      ...makeVotes("CLOSE_ENOUGH", 156),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // ─── PERSONAL CARE (10 products) ────────────────────────────────────────

  const personalCareComparisons = [
    {
      slug: "kirkland-contact-lenses-vs-coopervision",
      genericProductName: "Kirkland Signature Daily Contact Lenses",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 30.00,
      nameBrandProductName: "CooperVision clariti 1 day",
      nameBrand: "CooperVision",
      nameBrandPrice: 55.00,
      ...makeVotes("SAME_QUALITY", 234),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-moisturizing-lotion-vs-lubriderm",
      genericProductName: "Kirkland Signature Daily Moisturizing Lotion",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "Lubriderm Daily Moisture Lotion",
      nameBrand: "Lubriderm",
      nameBrandPrice: 10.99,
      ...makeVotes("CLOSE_ENOUGH", 178),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-sunscreen-vs-coppertone",
      genericProductName: "Up & Up Sport Sunscreen SPF 50",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 7.99,
      nameBrandProductName: "Coppertone Sport SPF 50",
      nameBrand: "Coppertone",
      nameBrandPrice: 10.99,
      ...makeVotes("CLOSE_ENOUGH", 201),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-cotton-swabs-vs-q-tips",
      genericProductName: "Up & Up Cotton Swabs",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 2.99,
      nameBrandProductName: "Q-tips Cotton Swabs",
      nameBrand: "Q-tips",
      nameBrandPrice: 4.99,
      ...makeVotes("CLOSE_ENOUGH", 267),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-bandages-vs-band-aid",
      genericProductName: "Equate Adhesive Bandages",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 2.97,
      nameBrandProductName: "Band-Aid Brand Flexible Fabric",
      nameBrand: "Band-Aid",
      nameBrandPrice: 5.49,
      ...makeVotes("NOT_WORTH_IT", 312),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-dental-floss-vs-oral-b-glide",
      genericProductName: "Equate Mint Dental Floss",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 1.97,
      nameBrandProductName: "Oral-B Glide Pro-Health",
      nameBrand: "Oral-B",
      nameBrandPrice: 4.99,
      ...makeVotes("CLOSE_ENOUGH", 189),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-feminine-pads-vs-always",
      genericProductName: "Up & Up Ultra Thin Pads",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 5.99,
      nameBrandProductName: "Always Ultra Thin Pads",
      nameBrand: "Always",
      nameBrandPrice: 8.99,
      ...makeVotes("NOT_WORTH_IT", 378),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-toothpaste-vs-colgate",
      genericProductName: "Equate Cavity Protection Toothpaste",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 1.97,
      nameBrandProductName: "Colgate Cavity Protection",
      nameBrand: "Colgate",
      nameBrandPrice: 3.49,
      ...makeVotes("CLOSE_ENOUGH", 245),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-mouthwash-vs-listerine",
      genericProductName: "Equate Antiseptic Mouthwash (Blue Mint)",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 3.97,
      nameBrandProductName: "Listerine Cool Mint Antiseptic",
      nameBrand: "Listerine",
      nameBrandPrice: 7.97,
      ...makeVotes("CLOSE_ENOUGH", 214),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-body-wash-vs-dove",
      genericProductName: "Equate Beauty Moisturizing Body Wash",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 4.97,
      nameBrandProductName: "Dove Deep Moisture Body Wash",
      nameBrand: "Dove",
      nameBrandPrice: 7.97,
      ...makeVotes("CLOSE_ENOUGH", 231),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // ─── PET SUPPLIES (8 products) ───────────────────────────────────────────

  const petComparisons = [
    {
      slug: "kirkland-dog-food-vs-diamond-naturals",
      genericProductName: "Kirkland Signature Super Premium Adult Dog Food",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 39.99,
      nameBrandProductName: "Diamond Naturals Adult Dog Food",
      nameBrand: "Diamond Pet Foods",
      nameBrandPrice: 42.99,
      ...makeVotes("SAME_QUALITY", 312),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-puppy-food-vs-diamond-puppy",
      genericProductName: "Kirkland Signature Puppy Chicken & Rice",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 32.99,
      nameBrandProductName: "Diamond Naturals Puppy Food",
      nameBrand: "Diamond Pet Foods",
      nameBrandPrice: 38.99,
      ...makeVotes("SAME_QUALITY", 198),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-cat-food-vs-friskies",
      genericProductName: "Great Value Cat Food",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 9.98,
      nameBrandProductName: "Friskies Cat Food",
      nameBrand: "Friskies",
      nameBrandPrice: 13.98,
      ...makeVotes("NOT_WORTH_IT", 234),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-dog-biscuits-vs-milk-bone",
      genericProductName: "Great Value Dog Biscuits",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 4.97,
      nameBrandProductName: "Milk-Bone Original Dog Biscuits",
      nameBrand: "Milk-Bone",
      nameBrandPrice: 7.48,
      ...makeVotes("CLOSE_ENOUGH", 176),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-cat-litter-vs-tidy-cats",
      genericProductName: "Great Value Clumping Cat Litter",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 7.47,
      nameBrandProductName: "Tidy Cats Clumping Cat Litter",
      nameBrand: "Tidy Cats",
      nameBrandPrice: 12.98,
      ...makeVotes("CLOSE_ENOUGH", 201),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-natures-domain-vs-taste-of-the-wild",
      genericProductName: "Kirkland Signature Nature's Domain Grain-Free",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 33.99,
      nameBrandProductName: "Taste of the Wild High Prairie",
      nameBrand: "Taste of the Wild",
      nameBrandPrice: 49.99,
      ...makeVotes("SAME_QUALITY", 267),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "petarmor-plus-vs-frontline-plus",
      genericProductName: "PetArmor Plus for Dogs",
      genericBrand: "PetArmor",
      genericStore: "Walmart",
      genericPrice: 19.97,
      nameBrandProductName: "Frontline Plus for Dogs",
      nameBrand: "Frontline",
      nameBrandPrice: 38.99,
      ...makeVotes("SAME_QUALITY", 189),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "ol-roy-dog-food-vs-purina-one",
      genericProductName: "Ol' Roy Dog Food",
      genericBrand: "Ol' Roy",
      genericStore: "Walmart",
      genericPrice: 17.98,
      nameBrandProductName: "Purina ONE SmartBlend",
      nameBrand: "Purina",
      nameBrandPrice: 26.48,
      ...makeVotes("NOT_WORTH_IT", 287),
      // PENDING for admin queue testing
      status: ComparisonStatus.PENDING,
    },
  ];

  // ─── ELECTRONICS (8 products) ────────────────────────────────────────────

  const electronicsComparisons = [
    {
      slug: "kirkland-batteries-vs-duracell",
      genericProductName: "Kirkland Signature AA Alkaline Batteries",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 16.99,
      nameBrandProductName: "Duracell CopperTop AA Batteries",
      nameBrand: "Duracell",
      nameBrandPrice: 22.99,
      ...makeVotes("SAME_QUALITY", 478),
      status: ComparisonStatus.APPROVED,
      lastVerifiedAt: new Date("2026-01-10"),
    },
    {
      slug: "amazon-basics-batteries-vs-duracell",
      genericProductName: "Amazon Basics AA Alkaline Batteries",
      genericBrand: "Amazon Basics",
      genericStore: "Amazon",
      genericPrice: 13.99,
      nameBrandProductName: "Duracell CopperTop AA",
      nameBrand: "Duracell",
      nameBrandPrice: 22.99,
      ...makeVotes("CLOSE_ENOUGH", 312),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "amazon-basics-hdmi-vs-monster",
      genericProductName: "Amazon Basics High-Speed HDMI Cable",
      genericBrand: "Amazon Basics",
      genericStore: "Amazon",
      genericPrice: 7.99,
      nameBrandProductName: "Monster Ultra High Speed HDMI Cable",
      nameBrand: "Monster",
      nameBrandPrice: 24.99,
      ...makeVotes("SAME_QUALITY", 489),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "amazon-basics-usb-c-vs-apple",
      genericProductName: "Amazon Basics USB-C to Lightning Cable",
      genericBrand: "Amazon Basics",
      genericStore: "Amazon",
      genericPrice: 8.99,
      nameBrandProductName: "Apple USB-C to Lightning Cable",
      nameBrand: "Apple",
      nameBrandPrice: 19.00,
      ...makeVotes("CLOSE_ENOUGH", 267),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-golf-balls-vs-titleist-pro-v1",
      genericProductName: "Kirkland Signature Performance+ v3.0 Golf Balls",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 21.00,
      nameBrandProductName: "Titleist Pro V1",
      nameBrand: "Titleist",
      nameBrandPrice: 58.00,
      ...makeVotes("CLOSE_ENOUGH", 198),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-copy-paper-vs-hammermill",
      genericProductName: "Great Value Copy Paper",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 5.97,
      nameBrandProductName: "Hammermill Premium Copy Paper",
      nameBrand: "Hammermill",
      nameBrandPrice: 9.99,
      ...makeVotes("CLOSE_ENOUGH", 145),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "amazon-basics-phone-case-vs-otterbox",
      genericProductName: "Amazon Basics Shockproof Phone Case",
      genericBrand: "Amazon Basics",
      genericStore: "Amazon",
      genericPrice: 14.99,
      nameBrandProductName: "OtterBox Defender Series",
      nameBrand: "OtterBox",
      nameBrandPrice: 49.99,
      ...makeVotes("NOT_WORTH_IT", 231),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-party-cups-vs-chinet",
      genericProductName: "Kirkland Signature Party Cups",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 18.99,
      nameBrandProductName: "Chinet Comfort Cup",
      nameBrand: "Chinet",
      nameBrandPrice: 6.99,
      ...makeVotes("SAME_QUALITY", 167),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // ─── HOME & GARDEN (13 products) ─────────────────────────────────────────

  const homeGardenComparisons = [
    {
      slug: "kirkland-mattress-vs-stearns-foster",
      genericProductName: "Kirkland Signature by Stearns & Foster Mattress",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 799.00,
      nameBrandProductName: "Stearns & Foster Estate Mattress",
      nameBrand: "Stearns & Foster",
      nameBrandPrice: 1999.00,
      ...makeVotes("CLOSE_ENOUGH", 134),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-trash-bags-vs-glad",
      genericProductName: "Great Value Tall Kitchen Drawstring Bags",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 7.97,
      nameBrandProductName: "Glad ForceFlex Tall Kitchen Drawstring",
      nameBrand: "Glad",
      nameBrandPrice: 13.47,
      ...makeVotes("NOT_WORTH_IT", 356),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-slider-bags-vs-ziploc",
      genericProductName: "Great Value Slider Bags",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.97,
      nameBrandProductName: "Ziploc Slider Bags",
      nameBrand: "Ziploc",
      nameBrandPrice: 5.47,
      ...makeVotes("NOT_WORTH_IT", 289),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-toilet-paper-vs-charmin",
      genericProductName: "Great Value Ultra Strong Bath Tissue",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 0.50,
      nameBrandProductName: "Charmin Ultra Strong",
      nameBrand: "Charmin",
      nameBrandPrice: 1.25,
      ...makeVotes("CLOSE_ENOUGH", 312),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-led-bulbs-vs-philips",
      genericProductName: "Great Value LED Light Bulbs",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 1.50,
      nameBrandProductName: "Philips LED Light Bulbs",
      nameBrand: "Philips",
      nameBrandPrice: 3.00,
      ...makeVotes("CLOSE_ENOUGH", 223),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-9v-batteries-vs-energizer",
      genericProductName: "Great Value 9V Batteries",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 5.97,
      nameBrandProductName: "Energizer MAX 9V",
      nameBrand: "Energizer",
      nameBrandPrice: 10.97,
      ...makeVotes("NOT_WORTH_IT", 145),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "earth-grown-frozen-dessert-vs-ben-jerrys",
      genericProductName: "Earth Grown Vegan Almond-Based Frozen Dessert",
      genericBrand: "Earth Grown",
      genericStore: "Aldi",
      genericPrice: 3.49,
      nameBrandProductName: "Ben & Jerry's Non-Dairy Frozen Dessert",
      nameBrand: "Ben & Jerry's",
      nameBrandPrice: 5.99,
      ...makeVotes("NOT_WORTH_IT", 167),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-scrub-sponges-vs-scotch-brite",
      genericProductName: "Great Value Scrub Sponges",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 2.97,
      nameBrandProductName: "Scotch-Brite Non-Scratch Scrub Sponges",
      nameBrand: "Scotch-Brite",
      nameBrandPrice: 4.97,
      ...makeVotes("CLOSE_ENOUGH", 189),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-plastic-wrap-vs-glad-cling",
      genericProductName: "Great Value Plastic Wrap",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 2.47,
      nameBrandProductName: "Glad ClingWrap",
      nameBrand: "Glad",
      nameBrandPrice: 3.97,
      ...makeVotes("NOT_WORTH_IT", 245),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-garbage-bags-vs-glad",
      genericProductName: "Kirkland Signature Drawstring Kitchen Bags",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "Glad ForceFlex Kitchen Bags",
      nameBrand: "Glad",
      nameBrandPrice: 13.47,
      ...makeVotes("CLOSE_ENOUGH", 178),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-fabric-softener-vs-downy",
      genericProductName: "Great Value Liquid Fabric Softener",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.97,
      nameBrandProductName: "Downy Ultra Concentrated",
      nameBrand: "Downy",
      nameBrandPrice: 9.97,
      ...makeVotes("CLOSE_ENOUGH", 156),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-air-filters-vs-filtrete",
      genericProductName: "Great Value Air Filters MERV 8",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 4.97,
      nameBrandProductName: "Filtrete MERV 12 Air Filter",
      nameBrand: "Filtrete",
      nameBrandPrice: 14.97,
      ...makeVotes("NOT_WORTH_IT", 198),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-parchment-paper-vs-reynolds",
      genericProductName: "Great Value Parchment Paper",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.97,
      nameBrandProductName: "Reynolds Kitchens Parchment Paper",
      nameBrand: "Reynolds",
      nameBrandPrice: 5.97,
      ...makeVotes("CLOSE_ENOUGH", 134),
      // PENDING for admin queue testing
      status: ComparisonStatus.PENDING,
    },
  ];

  // ─── Assemble and create all comparisons ────────────────────────────────

  // Spread of recent lastVerifiedAt dates to give variety (within last 3 months)
  const recentDates = [
    new Date("2026-01-05"), new Date("2026-01-18"), new Date("2026-02-02"),
    new Date("2026-02-14"), new Date("2026-02-22"), new Date("2026-03-01"),
    new Date("2026-03-08"), new Date("2026-03-15"), new Date("2026-03-20"),
    new Date("2026-03-28"), new Date("2026-04-01"), new Date("2026-04-03"),
  ];
  let dateIndex = 0;

  function nextVerifiedDate() {
    const d = recentDates[dateIndex % recentDates.length];
    dateIndex++;
    return d;
  }

  const allComparisons = [
    ...groceryComparisons.map((c) => ({ ...c, categoryId: grocery.id })),
    ...healthComparisons.map((c) => ({ ...c, categoryId: health.id })),
    ...cleaningComparisons.map((c) => ({ ...c, categoryId: cleaning.id })),
    ...babyComparisons.map((c) => ({ ...c, categoryId: baby.id })),
    ...personalCareComparisons.map((c) => ({ ...c, categoryId: personalCare.id })),
    ...petComparisons.map((c) => ({ ...c, categoryId: petSupplies.id })),
    ...electronicsComparisons.map((c) => ({ ...c, categoryId: electronics.id })),
    ...homeGardenComparisons.map((c) => ({ ...c, categoryId: homeGarden.id })),
  ].map((c) => ({
    ...c,
    // Assign lastVerifiedAt to all APPROVED comparisons that don't already have one
    lastVerifiedAt: c.status === ComparisonStatus.APPROVED && !c.lastVerifiedAt
      ? nextVerifiedDate()
      : c.lastVerifiedAt ?? null,
  }));

  const createdComparisons: Record<string, string> = {};

  for (const comparison of allComparisons) {
    const { genericPrice, nameBrandPrice, ...rest } = comparison;
    const created = await prisma.productComparison.create({
      data: {
        ...rest,
        genericPrice: genericPrice != null ? genericPrice : null,
        nameBrandPrice: nameBrandPrice != null ? nameBrandPrice : null,
        submittedById: admin.id,
      },
    });
    createdComparisons[created.slug] = created.id;
  }

  console.log(`Created ${allComparisons.length} product comparisons.`);

  // ─── Evidence entries ────────────────────────────────────────────────────

  const evidenceEntries = [
    // ── GROCERY ──────────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-tuna-vs-bumble-bee-tuna",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Confirmed same manufacturer: Bumble Bee",
      content:
        "Costco partnered with Bumble Bee to pack Kirkland tuna. Same manufacturer, firmer texture with less water than standard Bumble Bee cans. Confirmed via public sourcing information.",
    },
    {
      comparisonSlug: "kirkland-cranberry-juice-vs-ocean-spray",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Ocean Spray",
      content:
        "Kirkland Signature Cranberry Juice Cocktail is made by Ocean Spray. The juice is sourced and packaged by Ocean Spray under contract. Same fruit content and recipe as the name-brand product sold alongside it at retail.",
    },
    {
      comparisonSlug: "kirkland-k-cups-vs-green-mountain",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Green Mountain Coffee confirmed as manufacturer",
      content:
        "Green Mountain Coffee Roasters signed a deal with Costco in 2012 to produce Kirkland K-Cups. Same roaster and equipment. Publicly disclosed partnership that continues to this day.",
    },
    {
      comparisonSlug: "kirkland-coffee-vs-starbucks",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Custom-roasted by Starbucks for Costco",
      content:
        "Kirkland Signature Custom Roast Medium Coffee is custom-roasted by Starbucks. This is a publicly confirmed partnership between Starbucks and Costco. The beans are roasted at Starbucks facilities.",
    },
    {
      comparisonSlug: "kirkland-frozen-pizza-vs-palermos",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Palermo's",
      content:
        "Kirkland Signature frozen pizzas are manufactured by Palermo's, one of the largest frozen pizza companies in the US. Same facilities and similar recipes. Community consensus confirms comparable quality.",
    },
    {
      comparisonSlug: "kirkland-bacon-vs-hormel",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Manufactured by Hormel",
      content:
        "Kirkland Signature Fully Cooked Bacon is made by Hormel, the same company that makes Hormel Black Label. Confirmed manufacturer relationship. The bacon is produced on the same lines, just packaged under the Kirkland label.",
    },
    {
      comparisonSlug: "kirkland-jelly-beans-vs-jelly-belly",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Jelly Belly Candy Company",
      content:
        "Kirkland Signature Gourmet Jelly Beans are manufactured by Jelly Belly. The Jelly Belly brand name is printed on the packaging. Same flavors and candy-shell process as the name-brand product sold at retail.",
    },
    {
      comparisonSlug: "great-value-ice-cream-vs-blue-bunny",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Decent quality but lower butterfat content",
      content:
        "Great Value ice cream uses less butterfat and more air (overrun) than premium brands, resulting in a slightly icier texture. Community consensus rates it as close enough for everyday use, particularly for kids or mixed-in desserts, but noticeable for plain scooping.",
    },
    {
      comparisonSlug: "great-value-chicken-nuggets-vs-perdue",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Same white meat chicken, similar breading",
      content:
        "Great Value Frozen Chicken Nuggets use white breast meat and a similar breading process to Perdue. Blind taste tests by consumer communities show difficulty distinguishing the two when baked. Both USDA-inspected under the same standards.",
    },
    {
      comparisonSlug: "millville-cereal-vs-honey-bunches-of-oats",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical ingredients, same cluster texture",
      content:
        "Millville Honey Crunch 'n Oats has an almost identical ingredient list to Honey Bunches of Oats. Both use whole grain oats, corn flakes, and honey clusters. Long-time Aldi shoppers consistently rate it as a near-perfect duplicate.",
    },
    {
      comparisonSlug: "trader-joes-pita-chips-vs-stacys",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by the same manufacturer as Stacy's",
      content:
        "Trader Joe's Pita Chips with Sea Salt are widely reported to be manufactured by the same company that produces Stacy's Simply Naked Pita Chips. Identical ingredient list and texture. The TJ's version costs about half as much.",
    },
    {
      comparisonSlug: "trader-joes-pistachios-vs-wonderful",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Sourced from same California pistachio growers",
      content:
        "Trader Joe's Dry Roasted Pistachios are sourced from California's San Joaquin Valley, the same growing region used by Wonderful. Blind taste tests consistently show identical flavor and texture at a significantly lower price per ounce.",
    },
    {
      comparisonSlug: "trader-joes-yogurt-vs-stonyfield",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Stonyfield Farm",
      content:
        "Trader Joe's Organic Yogurt is made by Stonyfield Farm, one of the largest organic dairy producers in the US. Confirmed manufacturer relationship. Same USDA Organic certification and identical culture strains.",
    },
    {
      comparisonSlug: "trader-joes-salad-kits-vs-taylor-farms",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Taylor Farms",
      content:
        "Multiple Trader Joe's salad kit lines are manufactured by Taylor Farms, the largest producer of fresh-cut vegetables in North America. Same facilities, same fresh produce supply chain, different packaging.",
    },
    {
      comparisonSlug: "friendly-farms-yogurt-vs-ehrmann",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Ehrmann Commonwealth Dairy",
      content:
        "Friendly Farms Greek Yogurt at Aldi is manufactured by Ehrmann Commonwealth Dairy, the same company behind Green Mountain Creamery. Same cultures, same protein content, same process. The Aldi version costs about 40% less.",
    },
    {
      comparisonSlug: "great-value-cinnamon-rolls-vs-sara-lee",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Same dough recipe, nearly identical flavor",
      content:
        "Consumer comparisons find the Great Value cinnamon rolls use a comparable enriched dough and icing to Sara Lee. Both use the same bake-from-refrigerated format. Community verdict is that the taste difference is minimal, making the Great Value version a clear winner on value.",
    },
    {
      comparisonSlug: "kirkland-bourbon-vs-1792",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Widely believed to be distilled at Barton 1792 Distillery",
      content:
        "Industry analysts and bourbon enthusiasts widely attribute Kirkland Small Batch Bourbon to Barton 1792 Distillery, the same facility that produces 1792 Small Batch. The mash bill and flavor profile are very similar. Costco does not officially disclose the distillery.",
    },
    {
      comparisonSlug: "market-pantry-ketchup-vs-heinz",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar flavor but Heinz has a distinct tanginess",
      content:
        "Consumer taste tests find Market Pantry ketchup is a reasonable substitute but Heinz has a distinctive tangy-sweet ratio that most consumers notice in blind tests. The difference is most apparent when used on its own rather than as an ingredient.",
    },
    {
      comparisonSlug: "great-value-mac-cheese-vs-kraft",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Kraft cheese powder flavor is proprietary and irreplaceable",
      content:
        "Consumer consensus: no generic brand matches the distinctive Kraft cheese powder flavor. Repeatedly listed on 'never buy generic' lists. The flavor profile comes from a proprietary blend that no store brand has successfully replicated.",
    },
    {
      comparisonSlug: "sams-choice-cola-vs-coca-cola",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Coca-Cola's proprietary recipe cannot be replicated",
      content:
        "Consumer consensus is strong that generic colas never match the flavor profile of Coca-Cola. Proprietary recipe — including the exact ratio of natural flavors — cannot be replicated. Sam's Choice made by Cott Beverages as a close imitation.",
    },
    {
      comparisonSlug: "great-value-pasta-sauce-vs-raos",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Rao's uses premium ingredients Great Value can't match",
      content:
        "Great Value pasta sauce uses tomato paste and puree while Rao's starts with whole peeled San Marzano-style tomatoes, olive oil, and no added sugar. The ingredient quality gap is real and obvious to most palates. Community consensus firmly rates Rao's as worth the premium.",
    },
    {
      comparisonSlug: "bakers-corner-flour-vs-gold-medal",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "All-purpose flour is a commodity product",
      content:
        "All-purpose flour is milled wheat with standardized protein content (10-11% for AP). Aldi's Baker's Corner is sourced from the same mills and meets the same FDA standards as Gold Medal. Blind taste tests in baking applications show no discernible difference.",
    },
    {
      comparisonSlug: "trader-joes-baguettes-vs-la-boulangerie",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Baked fresh by contracted bakeries",
      content:
        "Trader Joe's baguettes are baked by contracted artisan bakeries that also supply regional brands like La Boulangerie. Community consensus finds them equally fresh and flavorful. The Trader Joe's version is about 40% cheaper.",
    },
    {
      comparisonSlug: "great-value-frozen-vegetables-vs-birds-eye",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Flash-frozen vegetables are identical",
      content:
        "Frozen vegetables are harvested at peak ripeness and flash-frozen within hours. The nutritional content and quality of Great Value and Birds Eye are identical by USDA standards — the only difference is the steamable bag technology in some Birds Eye lines.",
    },
    {
      comparisonSlug: "great-value-vegetable-oil-vs-wesson",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Commodity soybean oil with identical specs",
      content:
        "Vegetable oil is a commodity product refined to industry-standard smoke points and neutral flavor. Great Value Vegetable Oil meets the same FDA standards as Wesson. Refined soybean oil is interchangeable regardless of brand.",
    },

    // ── HEALTH & OTC ─────────────────────────────────────────────────────
    {
      comparisonSlug: "equate-ibuprofen-vs-advil",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "FDA requires identical active ingredients — ibuprofen 200mg",
      content:
        "The FDA mandates that generic drugs have the same active ingredient, strength, dosage form, and route of administration. Both contain ibuprofen 200mg. Equate manufactured by Perrigo, the largest store-brand OTC manufacturer. Inactive ingredients differ but don't affect efficacy.",
      url: "https://www.fda.gov/drugs/generic-drugs/generic-drug-facts",
    },
    {
      comparisonSlug: "up-and-up-acetaminophen-vs-tylenol",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same active ingredient: acetaminophen 500mg, FDA-regulated",
      content:
        "Up & Up Acetaminophen 500mg contains the same active ingredient at the same dosage as Tylenol Extra Strength. Generic acetaminophen is FDA-approved. Manufactured by Perrigo. Pharmacists consistently recommend generics as equivalent to name-brand OTC pain relievers.",
    },
    {
      comparisonSlug: "kirkland-allerclear-vs-claritin",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical loratadine 10mg formulation — Perrigo-manufactured",
      content:
        "Kirkland Signature AllerClear contains loratadine 10mg, identical to Claritin. Loratadine's patent expired; generics are legally required to be bioequivalent. Manufactured by Perrigo. Pharmacists unanimously recommend this as the best value antihistamine available.",
      url: "https://www.consumerreports.org/drugs/generic-vs-brand-name-drugs/",
    },
    {
      comparisonSlug: "kirkland-diphenhydramine-vs-benadryl",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same active ingredient: diphenhydramine 25mg",
      content:
        "Kirkland Signature Allergy Medicine contains diphenhydramine 25mg, identical to Benadryl Allergy. Diphenhydramine is an off-patent drug; FDA-approved generics are required to be bioequivalent. Manufactured by Perrigo. One of the best-known examples of overpaying for a name brand.",
    },
    {
      comparisonSlug: "equate-omeprazole-vs-prilosec",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "FDA-approved generic: omeprazole 20mg delayed-release",
      content:
        "Equate Omeprazole 20mg Delayed-Release is FDA-approved with the same active ingredient, dose, and delayed-release enteric coating as Prilosec OTC. Generic omeprazole is widely stocked by hospitals and prescribed by gastroenterologists in lieu of brand-name Prilosec.",
    },
    {
      comparisonSlug: "cvs-cetirizine-vs-zyrtec",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical cetirizine 10mg — FDA bioequivalent",
      content:
        "CVS Health Cetirizine 10mg contains the same active ingredient at the same dose as Zyrtec. Cetirizine went off patent in 2008. Generic versions are FDA-approved bioequivalents. Pharmacists routinely recommend the generic as functionally identical.",
    },
    {
      comparisonSlug: "kirkland-sleep-aid-vs-unisom",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same active ingredient: doxylamine succinate 25mg",
      content:
        "Kirkland Signature Sleep Aid contains doxylamine succinate 25mg, the same active ingredient as Unisom SleepTabs. Off-patent OTC sleep aid. FDA-approved generic. Costco members consistently rate this as one of the best value Kirkland products.",
    },
    {
      comparisonSlug: "equate-naproxen-vs-aleve",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same naproxen sodium 220mg — FDA-approved generic",
      content:
        "Equate Naproxen Sodium 220mg contains the same active ingredient, dose, and formulation as Aleve. Naproxen sodium is off-patent. FDA-approved generic. Manufactured by Perrigo. The active ingredient and pharmacokinetics are identical.",
    },
    {
      comparisonSlug: "cvs-mucus-relief-vs-mucinex",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical guaifenesin 600mg extended-release formulation",
      content:
        "CVS Health Mucus Relief contains guaifenesin 600mg ER, identical to Mucinex 12-Hour. Guaifenesin's extended-release patent expired. FDA-approved generics use the same polymer matrix for 12-hour release. Pharmacists consistently recommend generic guaifenesin.",
    },
    {
      comparisonSlug: "equate-famotidine-vs-pepcid",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same famotidine 20mg — identical H2 blocker",
      content:
        "Equate Acid Reducer famotidine 20mg is the same active ingredient and dose as Pepcid AC. Famotidine is off-patent; FDA-approved generics are bioequivalent. Standard H2 blocker used in hospitals as an interchangeable substitute.",
    },
    {
      comparisonSlug: "kirkland-minoxidil-vs-rogaine",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same 5% minoxidil foam — FDA-approved generic",
      content:
        "Kirkland Signature Minoxidil 5% Foam contains the same active ingredient, concentration, and vehicle formulation as Rogaine Men's 5%. FDA-approved generic. Dermatologists widely recommend Kirkland as the best value minoxidil — same clinical efficacy at roughly 1/5 the price.",
    },
    {
      comparisonSlug: "equate-fexofenadine-vs-allegra",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical fexofenadine 180mg — FDA-approved generic",
      content:
        "Equate Fexofenadine 180mg is FDA-approved as bioequivalent to Allegra 24-Hour. Fexofenadine's patent expired. Same dosage, same non-drowsy profile, same 24-hour duration. Allergy specialists and pharmacists recommend this generic as the definitive best-value antihistamine.",
    },
    {
      comparisonSlug: "equate-nicotine-gum-vs-nicorette",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same nicotine polacrilex 4mg — FDA-approved NRT",
      content:
        "Equate Nicotine Gum contains the same active ingredient (nicotine polacrilex 4mg) as Nicorette. FDA-approved nicotine replacement therapy (NRT). The FDA requires generic NRT to meet the same safety and efficacy standards. Quit rates are identical between branded and generic NRT.",
    },
    {
      comparisonSlug: "up-and-up-loperamide-vs-imodium",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same loperamide 2mg — FDA-approved generic",
      content:
        "Up & Up Loperamide 2mg is FDA-approved with the same active ingredient as Imodium A-D. Loperamide is off-patent. Generic versions are bioequivalent and stocked by hospitals as the standard antidiarrheal. Pharmacists recommend generic loperamide universally.",
    },
    {
      comparisonSlug: "equate-aspirin-vs-bayer",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Aspirin is aspirin: acetylsalicylic acid 325mg",
      content:
        "Aspirin (acetylsalicylic acid) is one of the oldest generic medicines. Bayer's patent expired over a century ago. Equate Aspirin 325mg meets the same USP standards as Bayer. Pharmacists and cardiologists make no distinction between branded and generic aspirin.",
    },
    {
      comparisonSlug: "kirkland-calcium-vs-caltrate",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same calcium 600mg + D3 formulation",
      content:
        "Kirkland Signature Calcium 600mg + D3 contains the same active ingredients (calcium carbonate 600mg, vitamin D3 800IU) as Caltrate 600+D3. USP-verified supplement. No meaningful difference between branded and store-brand calcium supplements.",
    },
    {
      comparisonSlug: "equate-melatonin-vs-natrol",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same melatonin 5mg — unregulated supplement but equivalent",
      content:
        "Equate Melatonin 5mg contains the same synthetic melatonin as Natrol. Melatonin is classified as a supplement, not a drug, so it's not FDA-approved, but both brands use the same synthetic melatonin in identical doses. USP verification programs confirm consistent dosing.",
    },
    {
      comparisonSlug: "equate-ranitidine-vs-zantac",
      type: EvidenceType.OTHER,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Ranitidine recalled — both products withdrawn from market",
      content:
        "Both Equate Ranitidine and Zantac (ranitidine) were recalled and withdrawn from the market in 2020 after FDA testing found unacceptable NDMA (a potential carcinogen) levels in ranitidine products from all manufacturers. Neither product is currently available. Alternatives: famotidine (Pepcid/Equate) or omeprazole.",
    },

    // ── CLEANING ──────────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-laundry-pacs-vs-tide-pods",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar cleaning power, slightly different scent",
      content:
        "Consumer testing finds Kirkland Ultra Clean Pacs remove everyday stains as effectively as Tide PODS in standard washing conditions. The scent profile differs, and Tide PODS have a slight edge on heavily soiled laundry. For normal laundry, the Kirkland version is an excellent value.",
    },
    {
      comparisonSlug: "great-value-bleach-vs-clorox",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Sodium hypochlorite in water — a commodity product",
      content:
        "Bleach is sodium hypochlorite diluted in water at 6-8.25% concentration. It's a commodity product with identical chemistry regardless of brand. The EPA registers bleach by active ingredient only. This is widely cited as the textbook example of 'always buy generic.'",
    },
    {
      comparisonSlug: "great-value-dish-soap-vs-dawn",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Dawn's proprietary formula is meaningfully more concentrated",
      content:
        "Consumer consensus: Great Value dish soap is watery and requires significantly more product per wash. Dawn's proprietary surfactant blend is more concentrated and notably more effective at cutting grease. Consistently appears on 'never buy generic' lists. The price-per-use gap narrows considerably.",
    },
    {
      comparisonSlug: "generic-interior-paint-vs-benjamin-moore",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Premium paint has higher pigment load and better coverage",
      content:
        "Benjamin Moore Regal Select uses higher titanium dioxide (TiO2) content and premium binders vs. budget paints. Independent tests show budget paint requires 2-3 coats to achieve what premium paint does in 1-2. Long-term durability and washability are significantly better with premium paint. Professionals almost universally avoid budget paint for finished rooms.",
    },
    {
      comparisonSlug: "kirkland-dryer-sheets-vs-bounce",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Comparable softening, slightly different scent",
      content:
        "Consumer testing finds Kirkland dryer sheets provide similar static reduction and fabric softening to Bounce. The scent is lighter and dissipates faster. For most households, the performance difference is negligible. A solid value despite the slightly higher bulk price.",
    },
    {
      comparisonSlug: "kirkland-aluminum-foil-vs-reynolds",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Reynolds name printed on Kirkland foil box",
      content:
        "Reynolds name appears on the Kirkland Signature Foodservice Foil packaging. Same manufacturer confirmed. The Kirkland version is heavier-gauge commercial foil — many consumers consider it superior to standard Reynolds Wrap for heavy cooking tasks.",
    },
    {
      comparisonSlug: "up-and-up-all-purpose-cleaner-vs-windex",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar ammonia-based formula, comparable glass cleaning",
      content:
        "Up & Up All-Purpose Cleaner uses an ammonia-based formula similar to Windex Multi-Surface. Consumer testing on glass and mirrors shows comparable streak-free results. Windex's marketing targets specific surfaces more effectively, but for general cleaning the store brand performs well.",
    },
    {
      comparisonSlug: "up-and-up-magic-eraser-vs-mr-clean",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Same melamine foam technology, slightly less dense",
      content:
        "Mr. Clean Magic Eraser and Up & Up Cleaning Eraser Pads both use melamine foam — a micro-abrasive material. Consumer testing finds Up & Up slightly less dense, which means it may wear down faster on heavy scrubbing tasks. For light everyday cleaning, they're essentially equivalent.",
    },
    {
      comparisonSlug: "great-value-paper-towels-vs-bounty",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Generic towels are thinner and less absorbent",
      content:
        "Consumer testing consistently shows Great Value paper towels are thinner, tear more easily, and absorb less per sheet than Bounty. You typically need 2 Great Value sheets to do what 1 Bounty does, narrowing the price advantage significantly. Consistently appears on 'never buy generic' lists.",
    },
    {
      comparisonSlug: "boulder-paper-towels-vs-bounty",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Aldi's paper towels: better than most store brands",
      content:
        "Aldi's Boulder paper towels are considered among the better store-brand paper towels. Consumer tests find them thicker than typical store brands, though still not matching Bounty's absorbency and strength. A good middle ground: better value than Bounty, better quality than cheapest generics.",
    },

    // ── BABY & KIDS ───────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-diapers-vs-huggies",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Kimberly-Clark (Huggies manufacturer)",
      content:
        "Confirmed by Costco CFO Richard Galanti in a 2017 Wall Street Journal interview. Kimberly-Clark, the manufacturer of Huggies, also manufactures Kirkland Signature Supreme Diapers. Same SAP (superabsorbent polymer) core technology.",
    },
    {
      comparisonSlug: "kirkland-diapers-vs-huggies",
      type: EvidenceType.VIDEO_LINK,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Side-by-side absorbency comparison tests",
      content:
        "Multiple YouTube tests show Kirkland diapers absorbing identically to Huggies in standard pour tests. The SAP core appears similar in composition. Parent communities overwhelmingly recommend Kirkland as the best value diaper.",
      url: "https://www.youtube.com/results?search_query=kirkland+vs+huggies+diaper+test",
    },
    {
      comparisonSlug: "parents-choice-formula-vs-similac",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Infant Formula Act mandates nutritional equivalence",
      content:
        "The Infant Formula Act (1980, updated 2014) requires all infant formulas sold in the US — including store brands — to meet identical nutritional standards. Parent's Choice is made by Perrigo, the largest US store-brand formula manufacturer. Same FDA-regulated nutritional profile as Similac.",
    },
    {
      comparisonSlug: "up-and-up-formula-vs-enfamil",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "FDA-regulated nutritional equivalence with Enfamil",
      content:
        "Up & Up Infant Formula meets the same FDA Infant Formula Act nutritional requirements as Enfamil NeuroPro. Target's Up & Up formula is also made by Perrigo. Pediatricians and AAP guidelines confirm store-brand formulas are nutritionally equivalent to premium brands.",
    },
    {
      comparisonSlug: "kirkland-baby-wipes-vs-huggies",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Thinner than Huggies but still effective",
      content:
        "Kirkland baby wipes are slightly thinner than Huggies Natural Care, but consumer consensus finds them sufficiently gentle and effective for diaper changes. Most parents find them a good value, though the thinner texture means slightly more sheets used per change.",
    },
    {
      comparisonSlug: "equate-childrens-acetaminophen-vs-tylenol",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same acetaminophen dose — FDA-approved generic",
      content:
        "Equate Children's Acetaminophen is FDA-approved with the same active ingredient, dose, and formulation as Children's Tylenol. Pediatricians routinely recommend generic children's acetaminophen. Same concentration, same dosing chart, same safety profile.",
    },
    {
      comparisonSlug: "up-and-up-childrens-ibuprofen-vs-motrin",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical ibuprofen concentration — FDA-approved generic",
      content:
        "Up & Up Children's Ibuprofen contains the same active ingredient, concentration, and formulation as Children's Motrin. FDA-approved generic. Pharmacists and pediatricians recommend generic children's ibuprofen as fully equivalent.",
    },
    {
      comparisonSlug: "equate-diaper-rash-cream-vs-desitin",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same zinc oxide 40% concentration — identical formulation",
      content:
        "Equate Diaper Rash Cream and Desitin Maximum Strength both contain zinc oxide 40% as the active ingredient. Same concentration, same protective barrier mechanism. FDA-regulated OTC drug. Dermatologists confirm generic zinc oxide creams are clinically equivalent.",
    },
    {
      comparisonSlug: "parents-choice-training-pants-vs-pull-ups",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Good absorbency but tearaway sides less smooth",
      content:
        "Parent's Choice Training Pants offer comparable absorbency to Huggies Pull-Ups, but parent reviews note the tearaway sides are slightly stiffer and the character designs are less appealing to toddlers. For potty training focused on function over novelty, they're an excellent value.",
    },

    // ── PERSONAL CARE ─────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-contact-lenses-vs-coopervision",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by CooperVision — identical lens technology",
      content:
        "Kirkland Signature Daily Contact Lenses are made by CooperVision, one of the world's top three contact lens manufacturers. Confirmed manufacturer relationship. The lenses use the same silicone hydrogel material as CooperVision's retail lines.",
    },
    {
      comparisonSlug: "kirkland-moisturizing-lotion-vs-lubriderm",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Very similar formula, great for daily use",
      content:
        "Kirkland Signature Daily Moisturizing Lotion has a nearly identical ingredient profile to Lubriderm Daily Moisture Lotion. Community consensus finds it slightly less greasy and equally effective for everyday dry skin. A dermatologist-recommended basic moisturizer formula at bulk pricing.",
    },
    {
      comparisonSlug: "up-and-up-sunscreen-vs-coppertone",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Same active UV filters — FDA-regulated equivalence",
      content:
        "Up & Up Sport SPF 50 uses the same FDA-approved UV filters (avobenzone, homosalate, octinoxate, octocrylene) as Coppertone Sport SPF 50. FDA regulates sunscreen as an OTC drug requiring the same active ingredients and SPF rating to be equivalent.",
    },
    {
      comparisonSlug: "up-and-up-cotton-swabs-vs-q-tips",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar but slightly less dense cotton tip",
      content:
        "Up & Up Cotton Swabs are comparable to Q-tips for most household uses. Consumer feedback notes the cotton tip is slightly less densely packed than Q-tips, which can mean more cotton fiber release during use. For cosmetic or general cleaning use, the difference is minimal.",
    },
    {
      comparisonSlug: "equate-bandages-vs-band-aid",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Adhesive falls off faster — especially when wet",
      content:
        "Consumer consensus: generic bandages including Equate don't adhere as well and fall off more easily, particularly when wet or on sweaty skin. Band-Aid's proprietary adhesive technology is noticeably superior for active use. Consistently appears on 'never buy generic' lists. The savings aren't worth the re-application hassle.",
    },
    {
      comparisonSlug: "equate-dental-floss-vs-oral-b-glide",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Basic floss works, but Glide's PTFE coating is better",
      content:
        "Equate mint dental floss is standard nylon floss that works adequately. Oral-B Glide uses PTFE (Teflon-like) coating that glides more easily between tight contacts without shredding. Consumers with tight teeth notice a clear difference. For normal spacing, Equate floss is a fine substitute.",
    },
    {
      comparisonSlug: "up-and-up-feminine-pads-vs-always",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Less absorbent core and thicker than Always",
      content:
        "Consumer consensus: Up & Up Ultra Thin pads are noticeably less absorbent than Always Ultra Thin and feel slightly thicker. Always pads use proprietary absorbent polymer technology that competitors haven't matched. Frequently cited in 'never buy generic' product lists.",
    },
    {
      comparisonSlug: "equate-toothpaste-vs-colgate",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Same fluoride concentration, slightly different feel",
      content:
        "Equate Cavity Protection and Colgate Cavity Protection both contain sodium fluoride 0.243% (950ppm), meeting the same ADA accepted cavity protection standard. Texture and flavor differ slightly. Dentists confirm all ADA-accepted fluoride toothpastes are functionally equivalent for cavity prevention.",
    },
    {
      comparisonSlug: "equate-mouthwash-vs-listerine",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Same antiseptic actives, slightly different flavor strength",
      content:
        "Equate Antiseptic Mouthwash contains the same active ingredients as Listerine Cool Mint (eucalyptol, menthol, methyl salicylate, thymol) at comparable concentrations. The flavor intensity is slightly less potent. ADA-accepted for antiseptic claims. A well-regarded store-brand substitute.",
    },
    {
      comparisonSlug: "equate-body-wash-vs-dove",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar moisturizing ingredients, comparable lather",
      content:
        "Equate Moisturizing Body Wash uses a similar surfactant base and moisturizer blend (glycerin, dimethicone) to Dove Deep Moisture. Community testing finds lather and skin feel comparable for everyday use. Dove's 'moisturizing cream' marketing outpaces the actual formula difference.",
    },

    // ── PET SUPPLIES ──────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-dog-food-vs-diamond-naturals",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Diamond Pet Foods — same facility",
      content:
        "Diamond Pet Foods is the confirmed manufacturer of all Kirkland Signature dry pet foods. Same production facilities and similar formulations as Diamond Naturals. Chicken meal is the first ingredient in both. Veterinary nutritionists rate both as quality mid-tier pet foods.",
    },
    {
      comparisonSlug: "kirkland-puppy-food-vs-diamond-puppy",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Diamond Pet Foods — same puppy formula",
      content:
        "Diamond Pet Foods manufactures both Kirkland Signature Puppy and Diamond Naturals Puppy formulas. The Kirkland version uses chicken and rice as primary ingredients — identical to the Diamond Naturals recipe. AAFCO complete and balanced for puppy growth.",
    },
    {
      comparisonSlug: "great-value-cat-food-vs-friskies",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Lower quality ingredients and less palatability",
      content:
        "Great Value Cat Food uses a high proportion of grain fillers and meat by-products compared to Friskies. Many cats refuse Great Value wet food or eat significantly less. Friskies, while not a premium brand, has better palatability and ingredient consistency. Veterinary nutritionists recommend Friskies-tier or better.",
    },
    {
      comparisonSlug: "great-value-dog-biscuits-vs-milk-bone",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar ingredients, dogs generally accept both",
      content:
        "Great Value Dog Biscuits use a similar wheat flour and beef by-products recipe to Milk-Bone Original. Most dogs consume both without distinction. The main difference is texture: Milk-Bone is slightly harder and longer-lasting. A good value for everyday treats.",
    },
    {
      comparisonSlug: "great-value-cat-litter-vs-tidy-cats",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Acceptable clumping but less odor control",
      content:
        "Great Value Clumping Cat Litter forms adequate clumps but consumer testing finds odor control noticeably weaker than Tidy Cats, particularly after 3-4 days of use. Tidy Cats uses proprietary odor-lock technology. For single-cat households with daily scooping, Great Value works well.",
    },
    {
      comparisonSlug: "kirkland-natures-domain-vs-taste-of-the-wild",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Diamond Pet Foods — same grain-free formula",
      content:
        "Kirkland Signature Nature's Domain is manufactured by Diamond Pet Foods using a nearly identical recipe to Taste of the Wild High Prairie. Both feature buffalo and sweet potato as primary ingredients. Veterinary nutritionists confirm equivalent nutritional profiles.",
    },
    {
      comparisonSlug: "petarmor-plus-vs-frontline-plus",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Identical active ingredients: fipronil + (S)-methoprene",
      content:
        "PetArmor Plus contains fipronil 9.8% and (S)-methoprene 8.8%, the exact same active ingredients and concentrations as Frontline Plus. Generic became available after Frontline's patent expired. EPA-registered. Veterinarians confirm identical efficacy for flea and tick prevention.",
    },
    {
      comparisonSlug: "ol-roy-dog-food-vs-purina-one",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Low-quality fillers — veterinarians advise against it",
      content:
        "Ol' Roy consistently ranks near the bottom of dog food quality indexes. Primary ingredients are ground corn and poultry by-product meal rather than named protein sources. Multiple veterinary nutritionists and organizations advise against cheapest-tier pet foods for long-term health. Purina ONE has named protein as the first ingredient.",
    },

    // ── ELECTRONICS ───────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-batteries-vs-duracell",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Manufactured by Duracell — confirmed relationship",
      content:
        "Kirkland Signature AA batteries are manufactured by Duracell. Confirmed manufacturer relationship. Performance tests (Wirecutter, Consumer Reports) show nearly identical run times in both low-drain and high-drain devices.",
      url: "https://thewirecutter.com/reviews/best-aa-battery/",
    },
    {
      comparisonSlug: "amazon-basics-batteries-vs-duracell",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Good performance but slightly shorter run time on high-drain devices",
      content:
        "Amazon Basics AA batteries perform comparably to Duracell in low-drain devices (remotes, clocks) but testing shows slightly shorter run times in high-drain devices (cameras, gaming controllers). For most household use, they're an excellent value. Consumer Reports ratings put them in the same tier.",
    },
    {
      comparisonSlug: "amazon-basics-hdmi-vs-monster",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "HDMI is a digital standard — bit-perfect or no signal",
      content:
        "HDMI is a digital protocol. Data either transmits correctly or it doesn't — there's no analog degradation. Amazon Basics cables meet the same HDMI specification as Monster cables. Independent testing confirms identical performance. Monster cables are widely considered the defining example of consumer electronics price gouging.",
    },
    {
      comparisonSlug: "amazon-basics-usb-c-vs-apple",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Functional but build quality is lower than Apple MFi",
      content:
        "Amazon Basics USB-C to Lightning Cable functions identically to Apple's cable for charging and data transfer but lacks the Apple MFi certification. Community reports note the cable feels flimsier and may develop connectivity issues after heavy use. For occasional use, it's a fine value.",
    },
    {
      comparisonSlug: "kirkland-golf-balls-vs-titleist-pro-v1",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Tour-quality performance at recreational price",
      content:
        "Kirkland Signature Performance+ v3.0 golf balls have earned serious attention from golf enthusiasts. MyGolfSpy testing placed them competitively with Pro V1 on distance and spin. For recreational golfers, the performance gap vs. Pro V1 is negligible. For tour-level play, Titleist still leads.",
    },
    {
      comparisonSlug: "great-value-copy-paper-vs-hammermill",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Works in most printers but slightly more prone to jams",
      content:
        "Great Value Copy Paper (20lb, 92 brightness) is functionally adequate for most printing. Consumer feedback notes slightly higher jam rates in high-speed printers compared to Hammermill's Premium (24lb, 98 brightness). For light office and home use, the price difference rarely justifies the upgrade.",
    },
    {
      comparisonSlug: "amazon-basics-phone-case-vs-otterbox",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Basic protection only — OtterBox drop protection is superior",
      content:
        "Amazon Basics phone cases offer basic scratch and minor impact protection. Drop testing shows OtterBox Defender significantly outperforms in multi-angle drop tests and resists damage from falls that would destroy Amazon Basics cases. For high-risk environments (construction, outdoors, kids), OtterBox's protection is worth the premium.",
    },
    {
      comparisonSlug: "kirkland-party-cups-vs-chinet",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Chinet — same cups, Kirkland branding",
      content:
        "Kirkland Signature Party Cups are manufactured by Chinet, the same company that produces Comfort Cup. Confirmed manufacturer relationship. Same mold, same paper/plastic composite construction, same insulation properties. The Kirkland bulk pack is a better value per cup.",
    },

    // ── HOME & GARDEN ─────────────────────────────────────────────────────
    {
      comparisonSlug: "kirkland-mattress-vs-stearns-foster",
      type: EvidenceType.MANUFACTURER_INFO,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "Made by Stearns & Foster — same manufacturer",
      content:
        "The Kirkland Signature mattress is confirmed to be made by Stearns & Foster (a Tempur-Sealy brand). Different model specs than the S&F retail line, but same manufacturer, coil systems, and material quality. Widely cited as one of Costco's best value products.",
    },
    {
      comparisonSlug: "great-value-trash-bags-vs-glad",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Generic bags tear when bags are heavy",
      content:
        "Consumer consensus: Great Value trash bags tear more easily when lifting heavy, full bags from the bin. Glad ForceFlex's stretchable low-density polyethylene formula is meaningfully stronger and more puncture-resistant. Appears on virtually every 'never buy generic' list for household products.",
    },
    {
      comparisonSlug: "great-value-slider-bags-vs-ziploc",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Slider mechanism less reliable — bags leak more often",
      content:
        "Consumer feedback consistently finds Great Value Slider Bags have a less reliable slider mechanism and leak more often than Ziploc Sliders. The seal track is narrower and wears out faster with repeated use. For food storage and freezer use, Ziploc's reliability is worth the premium.",
    },
    {
      comparisonSlug: "great-value-toilet-paper-vs-charmin",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Softer than cheapest generics but not Charmin-level",
      content:
        "Great Value Ultra Strong is a step above single-ply generics in strength and softness, but consumer testing consistently finds it noticeably less soft than Charmin Ultra Strong. For households prioritizing softness, Charmin wins. Great Value works well for guest bathrooms or high-use commercial applications.",
    },
    {
      comparisonSlug: "great-value-led-bulbs-vs-philips",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Similar brightness, lower rated lifespan",
      content:
        "Great Value LED bulbs produce comparable lumen output to Philips LEDs at 2700K, but have a lower stated lifespan (10,000 hrs vs. 15,000 hrs). Consumer reports note some Great Value bulbs fail earlier than rated. For frequently replaced fixtures, the cost difference is minimal over bulb lifetime.",
    },
    {
      comparisonSlug: "great-value-9v-batteries-vs-energizer",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Lower capacity — avoid for smoke detectors",
      content:
        "Great Value 9V batteries test lower in capacity (mAh) than Energizer MAX in independent tests. Consumer feedback reports early failures in smoke detectors and musical equipment. For safety devices like smoke and CO detectors, name-brand alkalines are strongly recommended. The savings are not worth the risk.",
    },
    {
      comparisonSlug: "earth-grown-frozen-dessert-vs-ben-jerrys",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Icier texture and plainer flavor than Ben & Jerry's",
      content:
        "Earth Grown Vegan Frozen Dessert uses an almond milk base but has a notably icier texture and plainer flavor than Ben & Jerry's Non-Dairy line. Ben & Jerry's uses sunflower butter and coconut oil for a creamier mouthfeel. For non-dairy shoppers who prioritize taste, the quality gap is real.",
    },
    {
      comparisonSlug: "great-value-scrub-sponges-vs-scotch-brite",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Comparable for light scrubbing, wears faster",
      content:
        "Great Value Scrub Sponges perform adequately for light everyday dish scrubbing. Consumer feedback notes the scrubbing side is less durable and frays faster than Scotch-Brite on heavy pots and pans. For normal daily use, the value proposition is good. For heavy-duty scrubbing, Scotch-Brite holds up better.",
    },
    {
      comparisonSlug: "great-value-plastic-wrap-vs-glad-cling",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Clings poorly — a common grocery complaint",
      content:
        "Plastic wrap cling quality varies significantly by brand. Great Value Plastic Wrap is consistently rated as having poor cling — it tends to stick to itself rather than to bowls and containers. Glad ClingWrap's formulation provides noticeably better adhesion to smooth surfaces. This is one of the most cited generic failures.",
    },
    {
      comparisonSlug: "kirkland-garbage-bags-vs-glad",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Comparable strength to Glad ForceFlex at similar price",
      content:
        "Kirkland Signature Drawstring Kitchen Bags are well-regarded among Costco members for their puncture resistance and reliable drawstring closure. Consumer comparisons find them nearly equal to Glad ForceFlex in tear and puncture testing. Note: the Kirkland bulk price works out slightly higher per bag.",
    },
    {
      comparisonSlug: "great-value-fabric-softener-vs-downy",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Softens adequately but weaker scent and shorter-lasting",
      content:
        "Great Value Liquid Fabric Softener provides basic fabric softening and static reduction. Consumer testing finds the scent dissipates much faster than Downy Ultra Concentrated and the softness is slightly less pronounced on successive washes. A solid everyday value for scent-sensitive households.",
    },
    {
      comparisonSlug: "great-value-air-filters-vs-filtrete",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.CONFIRMED,
      title: "MERV 8 vs. MERV 12 — a real filtration difference",
      content:
        "MERV 8 (Great Value) captures particles down to 3 microns; MERV 12 (Filtrete) captures particles down to 1 micron including fine dust, pollen, and pet dander. For allergy sufferers, the higher MERV rating provides meaningfully better air quality. Professionals and HVAC technicians recommend MERV 11+ for allergy-sensitive households.",
    },
    {
      comparisonSlug: "great-value-parchment-paper-vs-reynolds",
      type: EvidenceType.INGREDIENT_COMPARISON,
      confidence: EvidenceConfidence.COMMUNITY,
      title: "Same silicone coating, equivalent non-stick performance",
      content:
        "Parchment paper is a commodity product: paper coated with silicone for non-stick baking. Great Value Parchment Paper has the same silicone coating and temperature rating (425°F) as Reynolds Kitchens. Baking tests show identical non-stick performance. One of the easiest store-brand swaps.",
    },
  ];

  for (const entry of evidenceEntries) {
    const comparisonId = createdComparisons[entry.comparisonSlug];
    if (comparisonId) {
      await prisma.evidence.create({
        data: {
          comparisonId,
          userId: admin.id,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          url: "url" in entry ? entry.url : undefined,
          confidence: "confidence" in entry ? entry.confidence as EvidenceConfidence : EvidenceConfidence.UNVERIFIED,
        },
      });
    }
  }

  console.log(`Created ${evidenceEntries.length} evidence entries.`);

  // ─── Update category comparisonCount ────────────────────────────────────

  const categoryCounts = [
    { id: grocery.id, count: groceryComparisons.length },
    { id: health.id, count: healthComparisons.length },
    { id: cleaning.id, count: cleaningComparisons.length },
    { id: baby.id, count: babyComparisons.length },
    { id: personalCare.id, count: personalCareComparisons.length },
    { id: petSupplies.id, count: petComparisons.length },
    { id: electronics.id, count: electronicsComparisons.length },
    { id: homeGarden.id, count: homeGardenComparisons.length },
  ];

  for (const { id, count } of categoryCounts) {
    await prisma.category.update({ where: { id }, data: { comparisonCount: count } });
  }

  console.log("Updated category comparison counts.");
  console.log("\nSeed complete!");
  console.log(`Total comparisons: ${allComparisons.length}`);
  console.log("  Grocery:        ", groceryComparisons.length);
  console.log("  Health & OTC:   ", healthComparisons.length);
  console.log("  Cleaning:       ", cleaningComparisons.length);
  console.log("  Baby & Kids:    ", babyComparisons.length);
  console.log("  Personal Care:  ", personalCareComparisons.length);
  console.log("  Pet Supplies:   ", petComparisons.length);
  console.log("  Electronics:    ", electronicsComparisons.length);
  console.log("  Home & Garden:  ", homeGardenComparisons.length);

  const verdictCounts = allComparisons.reduce(
    (acc, c) => {
      acc[c.verdict as string] = (acc[c.verdict as string] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  console.log("\nVerdict distribution:");
  for (const [verdict, count] of Object.entries(verdictCounts)) {
    console.log(`  ${verdict}: ${count}`);
  }

  const pendingCount = allComparisons.filter((c) => c.status === ComparisonStatus.PENDING).length;
  console.log(`\nPending (admin queue): ${pendingCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
