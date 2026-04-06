// Maps brand names to their website domains for logo lookup
const BRAND_DOMAINS: Record<string, string> = {
  // Name brands
  "Advil": "advil.com",
  "Tylenol": "tylenol.com",
  "Claritin": "claritin.com",
  "Benadryl": "benadryl.com",
  "Prilosec": "prilosec.com",
  "Zyrtec": "zyrtec.com",
  "Aleve": "aleve.com",
  "Mucinex": "mucinex.com",
  "Rogaine": "rogaine.com",
  "Unisom": "unisom.com",
  "Allegra": "allegra.com",
  "Pepcid": "pepcid.com",
  "Coca-Cola": "coca-cola.com",
  "Kraft": "kraftheinzcompany.com",
  "Heinz": "heinz.com",
  "Starbucks": "starbucks.com",
  "Duracell": "duracell.com",
  "Energizer": "energizer.com",
  "Tide": "tide.com",
  "Dawn": "dawn.com",
  "Clorox": "clorox.com",
  "Cascade": "cascadeclean.com",
  "Lysol": "lysol.com",
  "Gillette": "gillette.com",
  "Huggies": "huggies.com",
  "Pampers": "pampers.com",
  "Enfamil": "enfamil.com",
  "Glad": "glad.com",
  "Bounty": "bfrbrands.com",
  "Reynolds": "reynoldsbrands.com",
  "Jelly Belly": "jellybelly.com",
  "Hormel": "hormel.com",
  "Bumble Bee": "bumblebee.com",
  "Ocean Spray": "oceanspray.com",
  "Green Mountain": "keurig.com",
  "Blue Buffalo": "bluebuffalo.com",
  "Purina": "purina.com",
  "Iams": "iams.com",
  "OtterBox": "otterbox.com",
  "Monster": "monsterstore.com",
  "Oral-B": "oralb.com",
  "Dove": "dove.com",
  "Head & Shoulders": "headandshoulders.com",
  "Old Spice": "oldspice.com",
  "Barilla": "barilla.com",
  "Birds Eye": "birdseye.com",
  "Sara Lee": "saraleebread.com",
  "Gold Medal": "goldmedalflour.com",
  "McCormick": "mccormick.com",
  "Chobani": "chobani.com",
  "Jif": "jif.com",
  "Post": "postfoods.com",
  "Stacy's": "stacyssnacks.com",
  "Wonderful": "wonderful.com",
  "Stonyfield Farm": "stonyfield.com",
  "Taylor Farms": "taylorfarms.com",
  // Generic store brands
  "Kirkland Signature": "costco.com",
  "Great Value": "walmart.com",
  "Equate": "walmart.com",
  "Up & Up": "target.com",
  "Market Pantry": "target.com",
  "Sam's Choice": "walmart.com",
  "CVS Health": "cvs.com",
  "Trader Joe's": "traderjoes.com",
  "Millville": "aldi.us",
  "Friendly Farms": "aldi.us",
  "Baker's Corner": "aldi.us",
  "Amazon Basics": "amazon.com",
  "Solimo": "amazon.com",
  "Costco": "costco.com",
  "Walmart": "walmart.com",
  "Target": "target.com",
  "Aldi": "aldi.us",
};

export function getBrandLogoUrl(brandName: string, size: number = 128): string | null {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  if (!token) return null;

  const domain = BRAND_DOMAINS[brandName];
  if (!domain) return null;

  return `https://img.logo.dev/${domain}?token=${token}&size=${size}&format=png`;
}

export function hasBrandLogo(brandName: string): boolean {
  return brandName in BRAND_DOMAINS;
}
