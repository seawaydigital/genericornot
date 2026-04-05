import { PrismaClient, ComparisonStatus, EvidenceType, UserRole } from "@prisma/client";
import { computeVerdict } from "../src/lib/verdict";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Step 1: Clear existing data in correct FK order
  await prisma.evidence.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.productComparison.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
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

  const [grocery, health, cleaning, baby, personalCare, petSupplies, electronics, homeGarden] = categories;
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

  // Helper: build vote counts and compute verdict
  function makeVotes(sameQuality: number, closeEnough: number, notWorthIt: number) {
    const result = computeVerdict({ sameQuality, closeEnough, notWorthIt });
    return {
      verdict: result.verdict,
      confidenceScore: result.confidenceScore,
      totalVotes: result.totalVotes,
    };
  }

  // Step 4: Create product comparisons
  // Grocery (11 comparisons)
  const groceryComparisons = [
    {
      slug: "kirkland-olive-oil-vs-california-olive-ranch",
      genericProductName: "Kirkland Signature Extra Virgin Olive Oil",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 12.99,
      nameBrandProductName: "California Olive Ranch Extra Virgin Olive Oil",
      nameBrand: "California Olive Ranch",
      nameBrandPrice: 21.99,
      ...makeVotes(62, 18, 8),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-honey-nut-os-vs-cheerios",
      genericProductName: "Great Value Honey Nut O's",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 2.98,
      nameBrandProductName: "Honey Nut Cheerios",
      nameBrand: "General Mills",
      nameBrandPrice: 5.49,
      ...makeVotes(58, 22, 10),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "simply-nature-mac-cheese-vs-annies",
      genericProductName: "SimplyNature Organic Mac & Cheese",
      genericBrand: "SimplyNature",
      genericStore: "Aldi",
      genericPrice: 1.49,
      nameBrandProductName: "Annie's Organic Mac & Cheese",
      nameBrand: "Annie's",
      nameBrandPrice: 3.29,
      ...makeVotes(45, 28, 15),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-maple-syrup-vs-grade-a-organic",
      genericProductName: "Kirkland Signature Pure Maple Syrup",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "365 Organic Grade A Maple Syrup",
      nameBrand: "365 by Whole Foods",
      nameBrandPrice: 18.99,
      ...makeVotes(72, 16, 5),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "trader-joes-peanut-butter-vs-jif",
      genericProductName: "Trader Joe's Creamy Peanut Butter",
      genericBrand: "Trader Joe's",
      genericStore: "Trader Joe's",
      genericPrice: 3.49,
      nameBrandProductName: "Jif Creamy Peanut Butter",
      nameBrand: "Jif",
      nameBrandPrice: 5.99,
      ...makeVotes(68, 20, 7),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-vanilla-extract-vs-mccormick",
      genericProductName: "Great Value Pure Vanilla Extract",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 4.97,
      nameBrandProductName: "McCormick Pure Vanilla Extract",
      nameBrand: "McCormick",
      nameBrandPrice: 9.98,
      ...makeVotes(55, 25, 12),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-greek-yogurt-vs-chobani",
      genericProductName: "Great Value Plain Greek Yogurt",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.48,
      nameBrandProductName: "Chobani Plain Greek Yogurt",
      nameBrand: "Chobani",
      nameBrandPrice: 5.79,
      ...makeVotes(30, 35, 20),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-canned-tuna-vs-starkist",
      genericProductName: "Kirkland Signature Albacore Tuna",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 1.09,
      nameBrandProductName: "StarKist Albacore White Tuna",
      nameBrand: "StarKist",
      nameBrandPrice: 1.89,
      ...makeVotes(78, 12, 5),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "clancys-chips-vs-lays",
      genericProductName: "Clancy's Classic Potato Chips",
      genericBrand: "Clancy's",
      genericStore: "Aldi",
      genericPrice: 1.85,
      nameBrandProductName: "Lay's Classic Potato Chips",
      nameBrand: "Lay's",
      nameBrandPrice: 4.29,
      ...makeVotes(48, 30, 18),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-pasta-vs-barilla",
      genericProductName: "Great Value Penne Pasta",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 1.18,
      nameBrandProductName: "Barilla Penne Pasta",
      nameBrand: "Barilla",
      nameBrandPrice: 2.28,
      ...makeVotes(80, 12, 5),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-orange-juice-vs-tropicana",
      genericProductName: "Simply Orange 100% Pure Squeezed OJ",
      genericBrand: "Simply Orange",
      genericStore: "Walmart",
      genericPrice: 3.98,
      nameBrandProductName: "Tropicana Pure Premium Orange Juice",
      nameBrand: "Tropicana",
      nameBrandPrice: 5.48,
      ...makeVotes(2, 1, 1),
      status: ComparisonStatus.PENDING,
    },
  ];

  // Health & OTC (8 comparisons)
  const healthComparisons = [
    {
      slug: "equate-ibuprofen-vs-advil",
      genericProductName: "Equate Ibuprofen 200mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 4.88,
      nameBrandProductName: "Advil Ibuprofen 200mg",
      nameBrand: "Advil",
      nameBrandPrice: 11.99,
      ...makeVotes(88, 8, 2),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-allergy-medicine-vs-claritin",
      genericProductName: "Kirkland Signature Loratadine 10mg",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 8.99,
      nameBrandProductName: "Claritin 24-Hour Allergy Relief",
      nameBrand: "Claritin",
      nameBrandPrice: 29.99,
      ...makeVotes(92, 5, 2),
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
      nameBrandPrice: 12.99,
      ...makeVotes(85, 10, 3),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-omeprazole-vs-prilosec",
      genericProductName: "Equate Omeprazole 20mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 7.97,
      nameBrandProductName: "Prilosec OTC 20mg",
      nameBrand: "Prilosec",
      nameBrandPrice: 24.97,
      ...makeVotes(90, 6, 2),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-daily-multi-vs-centrum",
      genericProductName: "Kirkland Signature Daily Multi",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 14.99,
      nameBrandProductName: "Centrum Adults Multivitamin",
      nameBrand: "Centrum",
      nameBrandPrice: 22.99,
      ...makeVotes(60, 22, 10),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "cvs-melatonin-vs-natrol",
      genericProductName: "CVS Health Melatonin 5mg",
      genericBrand: "CVS Health",
      genericStore: "CVS",
      genericPrice: 8.99,
      nameBrandProductName: "Natrol Melatonin 5mg",
      nameBrand: "Natrol",
      nameBrandPrice: 14.99,
      ...makeVotes(55, 28, 10),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-diphenhydramine-vs-benadryl",
      genericProductName: "Equate Diphenhydramine 25mg",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 3.97,
      nameBrandProductName: "Benadryl Antihistamine 25mg",
      nameBrand: "Benadryl",
      nameBrandPrice: 10.99,
      ...makeVotes(82, 10, 5),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "generic-cetirizine-vs-zyrtec",
      genericProductName: "Kirkland Signature Cetirizine 10mg",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 12.99,
      nameBrandProductName: "Zyrtec 24hr Allergy Relief",
      nameBrand: "Zyrtec",
      nameBrandPrice: 32.99,
      ...makeVotes(87, 8, 3),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // Cleaning (6 comparisons)
  const cleaningComparisons = [
    {
      slug: "kirkland-laundry-detergent-vs-tide",
      genericProductName: "Kirkland Signature Ultra Clean Laundry Detergent",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 19.99,
      nameBrandProductName: "Tide Original Laundry Detergent",
      nameBrand: "Tide",
      nameBrandPrice: 34.99,
      ...makeVotes(50, 32, 15),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "great-value-dish-soap-vs-dawn",
      genericProductName: "Great Value Ultra Dish Soap",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 2.47,
      nameBrandProductName: "Dawn Ultra Original Dish Soap",
      nameBrand: "Dawn",
      nameBrandPrice: 4.97,
      ...makeVotes(28, 35, 25),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "tandil-detergent-pods-vs-tide-pods",
      genericProductName: "Tandil Laundry Detergent Pods",
      genericBrand: "Tandil",
      genericStore: "Aldi",
      genericPrice: 7.99,
      nameBrandProductName: "Tide Pods Original",
      nameBrand: "Tide",
      nameBrandPrice: 19.99,
      ...makeVotes(22, 38, 28),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-all-purpose-cleaner-vs-lysol",
      genericProductName: "Up & Up All Purpose Cleaner",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 2.99,
      nameBrandProductName: "Lysol All Purpose Cleaner",
      nameBrand: "Lysol",
      nameBrandPrice: 5.49,
      ...makeVotes(48, 30, 18),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-bleach-vs-clorox",
      genericProductName: "Great Value Regular Bleach",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 3.47,
      nameBrandProductName: "Clorox Regular Bleach",
      nameBrand: "Clorox",
      nameBrandPrice: 5.97,
      ...makeVotes(75, 14, 5),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-dishwasher-pacs-vs-cascade",
      genericProductName: "Kirkland Signature Premium Dishwasher Pacs",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 17.99,
      nameBrandProductName: "Cascade Platinum ActionPacs",
      nameBrand: "Cascade",
      nameBrandPrice: 29.99,
      ...makeVotes(62, 25, 10),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // Personal Care (5 comparisons)
  const personalCareComparisons = [
    {
      slug: "equate-razors-vs-gillette",
      genericProductName: "Equate 5-Blade Disposable Razors",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 8.97,
      nameBrandProductName: "Gillette Fusion5 Disposable Razors",
      nameBrand: "Gillette",
      nameBrandPrice: 17.97,
      ...makeVotes(30, 35, 22),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-shampoo-vs-head-shoulders",
      genericProductName: "Equate Daily Dandruff Shampoo",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 3.97,
      nameBrandProductName: "Head & Shoulders Classic Clean",
      nameBrand: "Head & Shoulders",
      nameBrandPrice: 7.97,
      ...makeVotes(45, 32, 18),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-toothpaste-vs-colgate",
      genericProductName: "Up & Up Whitening Toothpaste",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 2.99,
      nameBrandProductName: "Colgate Total Whitening Toothpaste",
      nameBrand: "Colgate",
      nameBrandPrice: 5.99,
      ...makeVotes(55, 28, 12),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-deodorant-vs-dove",
      genericProductName: "Equate Advanced Protection Deodorant",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 3.47,
      nameBrandProductName: "Dove Advanced Care Deodorant",
      nameBrand: "Dove",
      nameBrandPrice: 7.97,
      ...makeVotes(25, 32, 28),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "cvs-sunscreen-vs-neutrogena",
      genericProductName: "CVS Health SPF 50 Sunscreen Lotion",
      genericBrand: "CVS Health",
      genericStore: "CVS",
      genericPrice: 7.99,
      nameBrandProductName: "Neutrogena Ultra Sheer SPF 50",
      nameBrand: "Neutrogena",
      nameBrandPrice: 15.99,
      ...makeVotes(50, 30, 15),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // Baby & Kids (5 comparisons)
  const babyComparisons = [
    {
      slug: "kirkland-diapers-vs-huggies",
      genericProductName: "Kirkland Signature Supreme Diapers",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 39.99,
      nameBrandProductName: "Huggies Little Snugglers Diapers",
      nameBrand: "Huggies",
      nameBrandPrice: 52.99,
      ...makeVotes(42, 38, 18),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-formula-vs-enfamil",
      genericProductName: "Up & Up Gentle Infant Formula",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 24.99,
      nameBrandProductName: "Enfamil NeuroPro Gentlease Formula",
      nameBrand: "Enfamil",
      nameBrandPrice: 43.99,
      ...makeVotes(35, 40, 20),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-wipes-vs-huggies-wipes",
      genericProductName: "Kirkland Signature Baby Wipes",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 22.99,
      nameBrandProductName: "Huggies Natural Care Wipes",
      nameBrand: "Huggies",
      nameBrandPrice: 34.99,
      ...makeVotes(65, 22, 8),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "up-and-up-diaper-rash-vs-desitin",
      genericProductName: "Up & Up Maximum Strength Diaper Rash Cream",
      genericBrand: "Up & Up",
      genericStore: "Target",
      genericPrice: 5.99,
      nameBrandProductName: "Desitin Maximum Strength Diaper Rash Cream",
      nameBrand: "Desitin",
      nameBrandPrice: 11.99,
      ...makeVotes(70, 18, 6),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-baby-shampoo-vs-johnson",
      genericProductName: "Equate Baby Shampoo",
      genericBrand: "Equate",
      genericStore: "Walmart",
      genericPrice: 3.47,
      nameBrandProductName: "Johnson's Baby Shampoo",
      nameBrand: "Johnson's",
      nameBrandPrice: 6.97,
      ...makeVotes(58, 24, 10),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // Pet Supplies (5 comparisons)
  const petComparisons = [
    {
      slug: "kirkland-dog-food-vs-blue-buffalo",
      genericProductName: "Kirkland Signature Adult Chicken & Rice Dog Food",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 36.99,
      nameBrandProductName: "Blue Buffalo Life Protection Adult Dog Food",
      nameBrand: "Blue Buffalo",
      nameBrandPrice: 59.99,
      ...makeVotes(55, 30, 12),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-cat-litter-vs-tidy-cats",
      genericProductName: "Great Value Clumping Cat Litter",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 9.97,
      nameBrandProductName: "Purina Tidy Cats Clumping Cat Litter",
      nameBrand: "Tidy Cats",
      nameBrandPrice: 16.97,
      ...makeVotes(20, 30, 35),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-cat-food-vs-fancy-feast",
      genericProductName: "Kirkland Signature Cat Food Variety Pack",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 19.99,
      nameBrandProductName: "Fancy Feast Classic Pate Variety Pack",
      nameBrand: "Fancy Feast",
      nameBrandPrice: 29.99,
      ...makeVotes(48, 32, 15),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-dog-treats-vs-milk-bone",
      genericProductName: "Great Value Small Dog Biscuits",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 5.47,
      nameBrandProductName: "Milk-Bone Original Dog Biscuits",
      nameBrand: "Milk-Bone",
      nameBrandPrice: 9.48,
      ...makeVotes(40, 32, 20),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "equate-flea-treatment-vs-frontline",
      genericProductName: "Sentry Fiproguard Flea Treatment",
      genericBrand: "Sentry",
      genericStore: "Walmart",
      genericPrice: 19.99,
      nameBrandProductName: "Frontline Plus Flea & Tick Treatment",
      nameBrand: "Frontline",
      nameBrandPrice: 38.99,
      ...makeVotes(28, 35, 30),
      status: ComparisonStatus.APPROVED,
    },
  ];

  // Electronics (5 comparisons)
  const electronicsComparisons = [
    {
      slug: "kirkland-batteries-vs-duracell",
      genericProductName: "Kirkland Signature AA Alkaline Batteries",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 17.99,
      nameBrandProductName: "Duracell Coppertop AA Batteries",
      nameBrand: "Duracell",
      nameBrandPrice: 26.99,
      ...makeVotes(72, 18, 8),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "amazonbasics-hdmi-vs-monster",
      genericProductName: "Amazon Basics High Speed HDMI Cable",
      genericBrand: "Amazon Basics",
      genericStore: "Amazon",
      genericPrice: 7.99,
      nameBrandProductName: "Monster Ultra HD HDMI Cable",
      nameBrand: "Monster",
      nameBrandPrice: 34.99,
      ...makeVotes(85, 8, 3),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "anker-charging-cable-vs-apple",
      genericProductName: "Anker Powerline USB-C Cable",
      genericBrand: "Anker",
      genericStore: "Amazon",
      genericPrice: 8.99,
      nameBrandProductName: "Apple USB-C Charge Cable",
      nameBrand: "Apple",
      nameBrandPrice: 29.00,
      ...makeVotes(68, 22, 8),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "onn-screen-protector-vs-zagg",
      genericProductName: "Onn Screen Protector",
      genericBrand: "Onn",
      genericStore: "Walmart",
      genericPrice: 9.88,
      nameBrandProductName: "ZAGG InvisibleShield Glass+ Screen Protector",
      nameBrand: "ZAGG",
      nameBrandPrice: 34.99,
      ...makeVotes(25, 35, 30),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-phone-case-vs-otterbox",
      genericProductName: "Onn Rugged Phone Case",
      genericBrand: "Onn",
      genericStore: "Walmart",
      genericPrice: 14.88,
      nameBrandProductName: "OtterBox Defender Series Case",
      nameBrand: "OtterBox",
      nameBrandPrice: 59.99,
      ...makeVotes(20, 28, 38),
      status: ComparisonStatus.PENDING,
    },
  ];

  // Home & Garden (6 comparisons)
  const homeGardenComparisons = [
    {
      slug: "store-brand-trash-bags-vs-glad",
      genericProductName: "Great Value Drawstring Trash Bags",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 9.97,
      nameBrandProductName: "Glad ForceFlex Trash Bags",
      nameBrand: "Glad",
      nameBrandPrice: 16.97,
      ...makeVotes(35, 35, 22),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-light-bulbs-vs-philips",
      genericProductName: "Great Value LED Light Bulbs 60W",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 6.97,
      nameBrandProductName: "Philips LED Daylight A19 Bulbs",
      nameBrand: "Philips",
      nameBrandPrice: 12.97,
      ...makeVotes(65, 22, 8),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-paper-towels-vs-bounty",
      genericProductName: "Great Value Paper Towels",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 8.97,
      nameBrandProductName: "Bounty Select-A-Size Paper Towels",
      nameBrand: "Bounty",
      nameBrandPrice: 18.99,
      ...makeVotes(22, 30, 35),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "kirkland-toilet-paper-vs-charmin",
      genericProductName: "Kirkland Signature Bath Tissue",
      genericBrand: "Kirkland Signature",
      genericStore: "Costco",
      genericPrice: 19.99,
      nameBrandProductName: "Charmin Ultra Strong Toilet Paper",
      nameBrand: "Charmin",
      nameBrandPrice: 29.97,
      ...makeVotes(60, 28, 10),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-aluminum-foil-vs-reynolds",
      genericProductName: "Great Value Heavy Duty Aluminum Foil",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 4.97,
      nameBrandProductName: "Reynolds Wrap Heavy Duty Aluminum Foil",
      nameBrand: "Reynolds",
      nameBrandPrice: 9.97,
      ...makeVotes(70, 18, 8),
      status: ComparisonStatus.APPROVED,
    },
    {
      slug: "store-brand-zip-bags-vs-ziploc",
      genericProductName: "Great Value Gallon Storage Bags",
      genericBrand: "Great Value",
      genericStore: "Walmart",
      genericPrice: 4.47,
      nameBrandProductName: "Ziploc Gallon Storage Bags",
      nameBrand: "Ziploc",
      nameBrandPrice: 8.97,
      ...makeVotes(55, 28, 12),
      status: ComparisonStatus.PENDING,
    },
  ];

  // Create all comparisons
  const allComparisons = [
    ...groceryComparisons.map(c => ({ ...c, categoryId: grocery.id })),
    ...healthComparisons.map(c => ({ ...c, categoryId: health.id })),
    ...cleaningComparisons.map(c => ({ ...c, categoryId: cleaning.id })),
    ...personalCareComparisons.map(c => ({ ...c, categoryId: personalCare.id })),
    ...babyComparisons.map(c => ({ ...c, categoryId: baby.id })),
    ...petComparisons.map(c => ({ ...c, categoryId: petSupplies.id })),
    ...electronicsComparisons.map(c => ({ ...c, categoryId: electronics.id })),
    ...homeGardenComparisons.map(c => ({ ...c, categoryId: homeGarden.id })),
  ];

  const createdComparisons: Record<string, string> = {};

  for (const comparison of allComparisons) {
    const { genericPrice, nameBrandPrice, ...rest } = comparison;
    const created = await prisma.productComparison.create({
      data: {
        ...rest,
        genericPrice: genericPrice !== undefined ? genericPrice : null,
        nameBrandPrice: nameBrandPrice !== undefined ? nameBrandPrice : null,
        submittedById: admin.id,
      },
    });
    createdComparisons[created.slug] = created.id;
  }

  console.log(`Created ${allComparisons.length} product comparisons.`);

  // Step 6: Create sample evidence entries
  const evidenceEntries = [
    {
      comparisonSlug: "kirkland-olive-oil-vs-california-olive-ranch",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Both pass IOC quality standards",
      content:
        "The Kirkland Signature Extra Virgin Olive Oil is verified by the International Olive Council and has passed independent lab tests. It meets the same chemical standards as California Olive Ranch.",
      url: "https://www.consumerreports.org/olive-oil/",
    },
    {
      comparisonSlug: "kirkland-olive-oil-vs-california-olive-ranch",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Identical ingredient list",
      content:
        "Both products contain 100% extra virgin olive oil with no additives. The acidity level of Kirkland's tested at 0.3% vs California Olive Ranch at 0.4% — both well within the EVOO standard of <0.8%.",
    },
    {
      comparisonSlug: "equate-ibuprofen-vs-advil",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "FDA requires identical active ingredients",
      content:
        "Equate Ibuprofen and Advil both contain 200mg of ibuprofen as the active ingredient. The FDA mandates that generic drugs have the same active ingredient, strength, dosage form, and route of administration as the brand-name drug.",
      url: "https://www.fda.gov/drugs/generic-drugs/generic-drug-facts",
    },
    {
      comparisonSlug: "equate-ibuprofen-vs-advil",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Same active ingredient, different inactive ingredients",
      content:
        "Both contain ibuprofen 200mg (active). Inactive ingredients differ slightly (Equate uses starch, Advil uses microcrystalline cellulose) but these do not affect efficacy for most people.",
    },
    {
      comparisonSlug: "kirkland-allergy-medicine-vs-claritin",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Same loratadine 10mg formulation",
      content:
        "Kirkland Signature Loratadine is manufactured to the same FDA standards as Claritin. Both contain loratadine 10mg as the sole active ingredient. Consumer Reports and pharmacists consistently recommend the generic.",
      url: "https://www.consumerreports.org/drugs/generic-vs-brand-name-drugs/",
    },
    {
      comparisonSlug: "kirkland-diapers-vs-huggies",
      type: EvidenceType.VIDEO_LINK,
      title: "Side-by-side absorbency test",
      content:
        "A popular YouTube test poured 200ml of water onto both diapers — Kirkland absorbed all of it as fast as Huggies. The SAP (superabsorbent polymer) core appears similar in composition.",
      url: "https://www.youtube.com/watch?v=example",
    },
    {
      comparisonSlug: "great-value-pasta-vs-barilla",
      type: EvidenceType.INGREDIENT_COMPARISON,
      title: "Same semolina wheat composition",
      content:
        "Both Great Value and Barilla penne are made from 100% semolina wheat flour. The protein content is identical at 7g per 2oz serving. Cooking time and texture are indistinguishable in blind taste tests.",
    },
    {
      comparisonSlug: "kirkland-batteries-vs-duracell",
      type: EvidenceType.MANUFACTURER_INFO,
      title: "Rumored to be manufactured by Duracell",
      content:
        "Industry sources and battery testing sites have long speculated that Kirkland AA batteries are made by Duracell at the same facility. Performance tests show nearly identical run times across high-drain devices.",
      url: "https://thewirecutter.com/reviews/best-aa-battery/",
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
          url: entry.url,
        },
      });
    }
  }

  console.log(`Created ${evidenceEntries.length} evidence entries.`);

  // Step 7: Update category comparisonCount
  const categoryCounts = [
    { id: grocery.id, count: groceryComparisons.length },
    { id: health.id, count: healthComparisons.length },
    { id: cleaning.id, count: cleaningComparisons.length },
    { id: personalCare.id, count: personalCareComparisons.length },
    { id: baby.id, count: babyComparisons.length },
    { id: petSupplies.id, count: petComparisons.length },
    { id: electronics.id, count: electronicsComparisons.length },
    { id: homeGarden.id, count: homeGardenComparisons.length },
  ];

  for (const { id, count } of categoryCounts) {
    await prisma.category.update({
      where: { id },
      data: { comparisonCount: count },
    });
  }

  console.log("Updated category comparison counts.");
  console.log("\nSeed complete!");
  console.log(`Total comparisons: ${allComparisons.length}`);
  console.log("  Grocery:       ", groceryComparisons.length);
  console.log("  Health & OTC:  ", healthComparisons.length);
  console.log("  Cleaning:      ", cleaningComparisons.length);
  console.log("  Personal Care: ", personalCareComparisons.length);
  console.log("  Baby & Kids:   ", babyComparisons.length);
  console.log("  Pet Supplies:  ", petComparisons.length);
  console.log("  Electronics:   ", electronicsComparisons.length);
  console.log("  Home & Garden: ", homeGardenComparisons.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
