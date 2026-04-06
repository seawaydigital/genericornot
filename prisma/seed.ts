import { PrismaClient, ComparisonStatus, EvidenceType, UserRole } from "@prisma/client";
import { computeVerdict } from "../src/lib/verdict";

const prisma = new PrismaClient();

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

  const allComparisons = [
    ...groceryComparisons.map((c) => ({ ...c, categoryId: grocery.id })),
    ...healthComparisons.map((c) => ({ ...c, categoryId: health.id })),
    ...cleaningComparisons.map((c) => ({ ...c, categoryId: cleaning.id })),
    ...babyComparisons.map((c) => ({ ...c, categoryId: baby.id })),
    ...personalCareComparisons.map((c) => ({ ...c, categoryId: personalCare.id })),
    ...petComparisons.map((c) => ({ ...c, categoryId: petSupplies.id })),
    ...electronicsComparisons.map((c) => ({ ...c, categoryId: electronics.id })),
    ...homeGardenComparisons.map((c) => ({ ...c, categoryId: homeGarden.id })),
  ];

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
    // Grocery
    {
      comparisonSlug: "kirkland-tuna-vs-bumble-bee-tuna",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Confirmed same manufacturer: Bumble Bee",
      content:
        "Costco partnered with Bumble Bee to pack Kirkland tuna. Same manufacturer, firmer texture with less water than standard Bumble Bee cans. Confirmed via public sourcing information.",
    },
    {
      comparisonSlug: "kirkland-cranberry-juice-vs-ocean-spray",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Made by Ocean Spray",
      content: "Kirkland Signature Cranberry Juice Cocktail is made by Ocean Spray. Confirmed manufacturer relationship.",
    },
    {
      comparisonSlug: "kirkland-k-cups-vs-green-mountain",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Green Mountain Coffee confirmed as manufacturer",
      content:
        "Green Mountain Coffee Roasters signed a deal with Costco in 2012 to produce Kirkland K-Cups. Same roaster and equipment. Publicly disclosed partnership.",
    },
    {
      comparisonSlug: "kirkland-coffee-vs-starbucks",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Custom-roasted by Starbucks for Costco",
      content:
        "Kirkland Signature Custom Roast Medium Coffee is custom-roasted by Starbucks. Publicly confirmed partnership between Starbucks and Costco.",
    },
    {
      comparisonSlug: "great-value-mac-cheese-vs-kraft",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Kraft cheese powder flavor is proprietary",
      content:
        "Consumer consensus: no generic brand matches the distinctive Kraft cheese powder flavor. Repeatedly listed on 'never buy generic' lists. The flavor profile is from a proprietary blend that generics cannot replicate.",
    },
    {
      comparisonSlug: "sams-choice-cola-vs-coca-cola",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Coca-Cola recipe cannot be replicated",
      content:
        "Consumer consensus is strong that generic colas never match the flavor profile of Coca-Cola. Proprietary recipe cannot be replicated. Sam's Choice made by Cott Beverages.",
    },
    // Health & OTC
    {
      comparisonSlug: "equate-ibuprofen-vs-advil",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "FDA requires identical active ingredients",
      content:
        "The FDA mandates that generic drugs have the same active ingredient, strength, dosage form, and route of administration as the brand-name drug. Equate Ibuprofen manufactured by Perrigo, the largest store-brand OTC manufacturer.",
      url: "https://www.fda.gov/drugs/generic-drugs/generic-drug-facts",
    },
    {
      comparisonSlug: "equate-ibuprofen-vs-advil",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Same active ingredient: ibuprofen 200mg",
      content:
        "Both contain ibuprofen 200mg (active). Inactive ingredients differ slightly (Equate uses starch, Advil uses microcrystalline cellulose) but these do not affect efficacy for most people.",
    },
    {
      comparisonSlug: "kirkland-allerclear-vs-claritin",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Identical loratadine 10mg formulation",
      content:
        "Kirkland Signature AllerClear contains loratadine 10mg — identical to Claritin. Patent expired; generics are legally required to be bioequivalent. Manufactured by Perrigo.",
      url: "https://www.consumerreports.org/drugs/generic-vs-brand-name-drugs/",
    },
    {
      comparisonSlug: "kirkland-minoxidil-vs-rogaine",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Same active ingredient, FDA-approved generic",
      content:
        "Kirkland Signature Minoxidil 5% contains the same active ingredient as Rogaine Men's 5%. FDA-approved generic. Widely recommended by dermatologists as identical efficacy at roughly 1/5 the price.",
    },
    // Cleaning
    {
      comparisonSlug: "great-value-bleach-vs-clorox",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Bleach is bleach: sodium hypochlorite in water",
      content:
        "Bleach is sodium hypochlorite in water at 6-8.25% concentration. A commodity product with identical chemistry regardless of brand. Widely cited as the textbook example of 'always buy generic.'",
    },
    {
      comparisonSlug: "kirkland-aluminum-foil-vs-reynolds",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Reynolds appears on Kirkland foil packaging",
      content:
        "Reynolds name appears on Kirkland Signature Foodservice Foil packaging. Same manufacturer confirmed.",
    },
    {
      comparisonSlug: "great-value-dish-soap-vs-dawn",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Dawn's formula is proprietary and superior",
      content:
        "Consumer consensus: generic dish soaps are watery and require significantly more product per wash. Dawn's formula is proprietary and notably more effective at cutting grease. Cited on multiple 'never buy generic' lists.",
    },
    // Baby & Kids
    {
      comparisonSlug: "kirkland-diapers-vs-huggies",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Made by Kimberly-Clark (Huggies manufacturer)",
      content:
        "Confirmed by Costco CFO Richard Galanti in a 2017 Wall Street Journal interview. Kimberly-Clark, the manufacturer of Huggies, also makes Kirkland Signature Supreme Diapers.",
    },
    {
      comparisonSlug: "kirkland-diapers-vs-huggies",
      type: EvidenceType.VIDEO_LINK,
      title: "Side-by-side absorbency comparison",
      content:
        "Multiple YouTube tests show Kirkland diapers absorbing identically to Huggies. The SAP (superabsorbent polymer) core appears similar in composition.",
      url: "https://www.youtube.com/results?search_query=kirkland+vs+huggies+diaper+test",
    },
    {
      comparisonSlug: "parents-choice-formula-vs-similac",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Infant Formula Act mandates nutritional equivalence",
      content:
        "The Infant Formula Act (1980, updated 2014) requires all formulas — including store brands — to be nutritionally identical. Parent's Choice made by Perrigo, the largest store brand formula manufacturer. FDA regulated to identical standards.",
    },
    // Personal Care
    {
      comparisonSlug: "kirkland-contact-lenses-vs-coopervision",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Made by CooperVision",
      content:
        "Kirkland Signature Daily Contact Lenses are made by CooperVision, one of the top contact lens manufacturers in the world. Confirmed manufacturer relationship.",
    },
    {
      comparisonSlug: "equate-bandages-vs-band-aid",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Adhesive quality is noticeably inferior",
      content:
        "Consumer consensus: generic bandages don't stick as well and fall off more easily, especially when wet. Band-Aid's adhesive is noticeably superior and stays on longer. Consistently appears on 'never buy generic' lists.",
    },
    // Pet Supplies
    {
      comparisonSlug: "kirkland-dog-food-vs-diamond-naturals",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Made by Diamond Pet Foods",
      content:
        "Diamond Pet Foods is the confirmed manufacturer of all Kirkland Signature dry pet foods. Same factory and similar formulations as Diamond Naturals.",
    },
    {
      comparisonSlug: "petarmor-plus-vs-frontline-plus",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Same active ingredients after patent expiry",
      content:
        "PetArmor Plus contains the same active ingredients as Frontline Plus: fipronil and (S)-methoprene at identical concentrations. Generic became available after Frontline's patent expired. EPA-registered.",
    },
    {
      comparisonSlug: "ol-roy-dog-food-vs-purina-one",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Low-quality ingredients: corn and by-products",
      content:
        "Ol' Roy consistently rated among the lowest quality dog foods. Primary ingredients are corn and meat by-products rather than named protein sources. Veterinary nutritionists advise against cheapest-tier pet foods.",
    },
    // Electronics
    {
      comparisonSlug: "kirkland-batteries-vs-duracell",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Manufactured by Duracell",
      content:
        "Kirkland Signature AA batteries are manufactured by Duracell. Confirmed manufacturer relationship. Performance tests show nearly identical run times across high-drain devices.",
      url: "https://thewirecutter.com/reviews/best-aa-battery/",
    },
    {
      comparisonSlug: "amazon-basics-hdmi-vs-monster",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "HDMI is a digital standard — cables are interchangeable",
      content:
        "HDMI is a digital standard. The cable either transmits the signal or it doesn't. No quality difference in digital transmission at the same spec. Premium cables are widely considered one of the biggest consumer electronics markups.",
    },
    // Home & Garden
    {
      comparisonSlug: "kirkland-mattress-vs-stearns-foster",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Made by Stearns & Foster",
      content:
        "The Kirkland Signature mattress is confirmed to be made by Stearns & Foster. Different model specs than the S&F retail line but same manufacturer, materials, and construction expertise at a fraction of the price.",
    },
    {
      comparisonSlug: "great-value-trash-bags-vs-glad",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Generic bags tear when lifting heavy loads",
      content:
        "Consumer consensus: generic trash bags tear more easily when lifting from bin, especially when heavy. Glad ForceFlex's stretchable material is notably stronger. Cited on multiple 'never buy generic' lists.",
    },
    {
      comparisonSlug: "great-value-air-filters-vs-filtrete",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "MERV rating difference is significant",
      content:
        "MERV 8 (generic) vs MERV 12 (Filtrete) is a meaningful difference. Higher MERV filters capture more particles per cubic foot of air. For allergy sufferers or air quality sensitive households, Filtrete provides meaningfully better filtration.",
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
