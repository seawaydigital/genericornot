import { computeSavings, savingsAreUnitBased } from "./verdict";

/**
 * One honest sentence about the price difference, e.g. "You save about 40%
 * per unit by choosing Life Brand." Returns null when prices are missing.
 */
export function describeSavings(input: {
  genericBrand: string;
  genericPrice: number | null;
  genericSize?: string | null;
  nameBrandPrice: number | null;
  nameBrandSize?: string | null;
}): string | null {
  const savings = computeSavings(input.genericPrice, input.nameBrandPrice, input.genericSize, input.nameBrandSize);
  if (savings === null) return null;

  const unitBased = savingsAreUnitBased(input.genericSize, input.nameBrandSize);
  const basis = unitBased ? " per unit" : "";
  let summary: string;
  if (savings >= 3) summary = `You save about ${savings}%${basis} by choosing ${input.genericBrand}.`;
  else if (savings <= -3) summary = `${input.genericBrand} costs about ${Math.abs(savings)}% more${basis} at these prices.`;
  else summary = `About the same price${basis}.`;

  if (!unitBased && input.genericSize && input.nameBrandSize && input.genericSize !== input.nameBrandSize) {
    summary += " Package sizes differ, so check the unit price on the shelf tag.";
  }
  return summary;
}
