import { ProductIcon } from "@/components/ui/ProductIcon";

interface GenericAlternativeProps {
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  categoryIcon?: string;
}

export function GenericAlternative({
  genericProductName,
  genericBrand,
  genericStore,
  genericPrice,
  categoryIcon,
}: GenericAlternativeProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400 mb-4">
        Generic Alternative
      </p>
      <div className="flex items-center gap-4">
        <ProductIcon icon={categoryIcon} brandName={genericBrand} size="sm" className="shrink-0" />
        <div>
          <p className="text-white font-semibold leading-snug">{genericProductName}</p>
          <p className="text-gray-400 text-sm mt-0.5">{genericBrand}</p>
          <p className="text-gray-500 text-sm">{genericStore}</p>
          {genericPrice !== null ? (
            <p className="text-emerald-400 font-bold text-base mt-1">
              ${Number(genericPrice).toFixed(2)}
            </p>
          ) : (
            <p className="text-gray-600 text-sm mt-1">Price not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
