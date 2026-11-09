/**
 * Package-size parsing so prices can be compared per unit.
 *
 * Shelf prices alone mislead when package sizes differ (a Costco multipack vs
 * a single box). Sizes are free text written by editors and contributors, e.g.
 * "200 g", "1.89 L", "2 x 1.89 L", "100 tablets", "1,320 sheets (6 rolls)".
 * We parse the first quantity+unit we recognise and normalise it to grams,
 * millilitres or a plain count. Anything we can't parse returns null, and
 * callers fall back to comparing package prices.
 */

export type UnitKind = "g" | "ml" | "count" | "m2" | "m";

export interface ParsedSize {
  quantity: number;
  unit: UnitKind;
}

const UNIT_FACTORS: Record<string, { unit: UnitKind; factor: number }> = {
  g: { unit: "g", factor: 1 },
  gr: { unit: "g", factor: 1 },
  gram: { unit: "g", factor: 1 },
  grams: { unit: "g", factor: 1 },
  kg: { unit: "g", factor: 1000 },
  kilo: { unit: "g", factor: 1000 },
  kilos: { unit: "g", factor: 1000 },
  lb: { unit: "g", factor: 453.592 },
  lbs: { unit: "g", factor: 453.592 },
  ml: { unit: "ml", factor: 1 },
  l: { unit: "ml", factor: 1000 },
  litre: { unit: "ml", factor: 1000 },
  litres: { unit: "ml", factor: 1000 },
  liter: { unit: "ml", factor: 1000 },
  liters: { unit: "ml", factor: 1000 },
  // Area (foil, wrap, parchment) — normalised to square metres.
  sqm: { unit: "m2", factor: 1 },
  sqft: { unit: "m2", factor: 0.09290304 },
  // Length (floss, cling wrap).
  m: { unit: "m", factor: 1 },
  metres: { unit: "m", factor: 1 },
  meters: { unit: "m", factor: 1 },
};

const COUNT_UNITS = new Set([
  "ct", "count", "tablets", "tablet", "caplets", "caplet", "capsules", "capsule",
  "softgels", "softgel", "gelcaps", "gelcap", "liquid-gels", "pills", "pill",
  "lozenges", "pieces", "piece", "pcs", "pack", "pk", "rolls", "roll", "sheets",
  "sheet", "wipes", "wipe", "bags", "bag", "pods", "pod", "pacs", "pac", "loads",
  "load", "diapers", "diaper", "batteries", "battery", "bulbs", "bulb", "sponges",
  "sponge", "filters", "filter", "cups", "cup", "units", "unit", "doses", "dose",
  "pieces", "strips", "strip", "bars", "bar", "cans", "can", "bottles", "bottle",
  "boxes", "box", "pads", "pad", "tampons", "tampon", "sticks", "stick", "cables",
  "cable", "pairs", "pair", "tissues", "tissue", "pouches", "pouch", "k-cups",
  "pants", "liners", "liner", "packets", "packet", "biscuits", "treats",
  "bandages", "bandage", "rolls", "pacs", "capsules",
]);

function parseNumber(raw: string): number {
  // "1,320" is a thousands separator; "1,89" is a decimal comma (Quebec labels).
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(raw)) return Number(raw.replace(/,/g, ""));
  return Number(raw.replace(",", "."));
}

export function parseSize(size: string | null | undefined): ParsedSize | null {
  if (!size) return null;
  const text = size
    .toLowerCase()
    .replace(/×/g, "x")
    // Fold area spellings into single tokens: "sq. ft.", "ft²" -> sqft; "m²" -> sqm.
    .replace(/sq\.?\s*ft\.?/g, "sqft")
    .replace(/ft²|ft2\b/g, "sqft")
    .replace(/sq\.?\s*m\b\.?/g, "sqm")
    .replace(/m²|\bm2\b/g, "sqm")
    .trim();
  if (!text) return null;

  const NUMBER = String.raw`(\d+(?:[.,]\d+)*)`;
  const UNIT = String.raw`([a-z][a-z-]*)`;
  const re = new RegExp(String.raw`(?:${NUMBER}\s*x\s*)?${NUMBER}\s*${UNIT}`, "g");

  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const multiplier = match[1] ? parseNumber(match[1]) : 1;
    const amount = parseNumber(match[2]);
    const unitWord = match[3];
    if (!Number.isFinite(multiplier) || !Number.isFinite(amount) || amount <= 0 || multiplier <= 0) {
      continue;
    }
    const metric = UNIT_FACTORS[unitWord];
    if (metric) {
      return { quantity: multiplier * amount * metric.factor, unit: metric.unit };
    }
    if (COUNT_UNITS.has(unitWord)) {
      return { quantity: multiplier * amount, unit: "count" };
    }
  }
  return null;
}

/** Price per gram / millilitre / item, or null if the size can't be parsed. */
export function unitPrice(price: number, size: string | null | undefined): { value: number; unit: UnitKind } | null {
  const parsed = parseSize(size);
  if (!parsed || parsed.quantity <= 0) return null;
  return { value: price / parsed.quantity, unit: parsed.unit };
}

/**
 * Human label in the style of Canadian shelf tags: "$0.45 / 100 g",
 * "$0.21 / 100 mL" or "$0.12 each".
 */
export function formatUnitPrice(
  price: number | null | undefined,
  size: string | null | undefined,
  formatMoney: (amount: number) => string
): string | null {
  if (price == null) return null;
  const up = unitPrice(price, size);
  if (!up) return null;
  switch (up.unit) {
    case "count":
      return `${formatMoney(up.value)} each`;
    case "g":
      return `${formatMoney(up.value * 100)} / 100 g`;
    case "ml":
      return `${formatMoney(up.value * 100)} / 100 mL`;
    case "m2":
      return `${formatMoney(up.value)} / m²`;
    case "m":
      return `${formatMoney(up.value)} / m`;
  }
}
