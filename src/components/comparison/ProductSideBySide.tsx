interface ProductSideBySideProps {
  genericProductName: string;
  genericBrand: string;
  genericStore: string;
  genericPrice: number | null;
  nameBrandProductName: string;
  nameBrand: string;
  nameBrandPrice: number | null;
  categoryIcon?: string;
}

function formatPrice(price: number | null): string {
  if (price === null) return "Price not available";
  return `$${Number(price).toFixed(2)}`;
}

export function ProductSideBySide({
  genericProductName,
  genericBrand,
  genericStore,
  genericPrice,
  nameBrandProductName,
  nameBrand,
  nameBrandPrice,
  categoryIcon = "📦",
}: ProductSideBySideProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch gap-4">
      {/* Generic product */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Generic
        </span>
        <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center text-4xl">
          {categoryIcon}
        </div>
        <div>
          <p className="text-white font-semibold text-lg leading-snug">{genericProductName}</p>
          <p className="text-gray-400 text-sm mt-1">{genericBrand}</p>
          <p className="text-gray-500 text-sm">{genericStore}</p>
        </div>
        <p
          className={`text-lg font-bold ${genericPrice !== null ? "text-emerald-400" : "text-gray-500"}`}
        >
          {formatPrice(genericPrice)}
        </p>
      </div>

      {/* VS divider */}
      <div className="flex sm:flex-col items-center justify-center gap-2 sm:gap-0 py-2 sm:py-0">
        <div className="h-px w-12 sm:h-12 sm:w-px bg-gray-700" />
        <span className="text-gray-500 font-bold text-sm px-2 py-1">VS</span>
        <div className="h-px w-12 sm:h-12 sm:w-px bg-gray-700" />
      </div>

      {/* Name brand product */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center text-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Name Brand
        </span>
        <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center text-4xl">
          {categoryIcon}
        </div>
        <div>
          <p className="text-white font-semibold text-lg leading-snug">{nameBrandProductName}</p>
          <p className="text-gray-400 text-sm mt-1">{nameBrand}</p>
        </div>
        <p
          className={`text-lg font-bold ${nameBrandPrice !== null ? "text-amber-400" : "text-gray-500"}`}
        >
          {formatPrice(nameBrandPrice)}
        </p>
      </div>
    </div>
  );
}
