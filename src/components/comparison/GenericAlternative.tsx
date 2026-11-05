import { ProductIcon } from "@/components/ui/ProductIcon";
import { formatCAD, formatCADPrecise } from "@/lib/format";
import { formatUnitPrice } from "@/lib/units";

interface GenericAlternativeProps {
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  genericSize?: string | null;
  categoryIcon?: string;
}

export function GenericAlternative({
  genericProductName,
  genericBrand,
  genericStore,
  genericPrice,
  genericSize,
  categoryIcon,
}: GenericAlternativeProps) {
  const unit = formatUnitPrice(genericPrice, genericSize, formatCADPrecise);

  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-xs font-medium uppercase tracking-widest text-emerald-700 mb-4">
        Generic Alternative
      </p>
      <div className="flex items-center gap-4">
        <ProductIcon icon={categoryIcon} brandName={genericBrand} size="sm" className="shrink-0" />
        <div className="min-w-0">
          <p className="text-gray-900 font-semibold leading-snug">{genericProductName}</p>
          <p className="text-gray-500 text-sm mt-0.5">{genericBrand}</p>
          <p className="text-gray-500 text-sm">{genericStore}</p>
          {genericPrice !== null ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-block text-emerald-700 font-bold text-base bg-emerald-50 rounded-full px-3 py-0.5">
                {formatCAD(genericPrice)}
              </span>
              {genericSize && <span className="text-gray-500 text-sm">{genericSize}</span>}
              {unit && <span className="text-gray-400 text-xs">({unit})</span>}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mt-1">Price not available</p>
          )}
        </div>
      </div>
    </div>
  );
}
