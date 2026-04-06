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
    <div className="glass rounded-2xl p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-emerald-700 mb-4">
        Generic Alternative
      </p>
      <div className="flex items-center gap-4">
        <ProductIcon icon={categoryIcon} brandName={genericBrand} size="sm" className="shrink-0" />
        <div>
          <p className="text-gray-900 font-semibold leading-snug">{genericProductName}</p>
          <p className="text-gray-500 text-sm mt-0.5">{genericBrand}</p>
          <p className="text-gray-400 text-sm">{genericStore}</p>
          {genericPrice !== null ? (
            <span className="inline-block mt-2 text-emerald-700 font-bold text-base bg-emerald-50 rounded-full px-3 py-0.5">
              ${Number(genericPrice).toFixed(2)}
            </span>
          ) : (
            <p className="text-gray-400 text-sm mt-1">Price not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
