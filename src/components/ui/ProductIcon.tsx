import Image from "next/image";
import { getBrandLogoUrl } from "@/lib/brand-logos";

interface ProductIconProps {
  icon?: string;
  imageUrl?: string;
  brandName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12 text-2xl",
  md: "w-20 h-20 text-4xl",
  lg: "w-[120px] h-[120px] text-5xl",
};

const sizePx = {
  sm: 48,
  md: 80,
  lg: 120,
};

export function ProductIcon({
  icon = "📦",
  imageUrl,
  brandName,
  size = "md",
  className = "",
}: ProductIconProps) {
  // Resolve logo URL: explicit imageUrl wins, then brandName lookup, then null
  const logoUrl = imageUrl ?? (brandName ? getBrandLogoUrl(brandName, sizePx[size] * 2) : null);

  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gray-800/50 border border-gray-700/50 ${sizeClasses[size]} ${className}`}
    >
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={brandName ?? "brand logo"}
          width={sizePx[size]}
          height={sizePx[size]}
          className="object-contain rounded-lg"
          unoptimized
        />
      ) : (
        <span role="img">{icon}</span>
      )}
    </div>
  );
}
