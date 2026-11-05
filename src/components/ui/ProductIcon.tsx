import Image from "next/image";
import { Package } from "lucide-react";
import { getBrandLogoUrl } from "@/lib/brand-logos";

interface ProductIconProps {
  /** Legacy emoji from the category record; no longer rendered. */
  icon?: string;
  imageUrl?: string;
  brandName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  xs: "h-8 w-8 rounded-lg text-[11px]",
  sm: "h-11 w-11 rounded-xl text-sm",
  md: "h-16 w-16 rounded-2xl text-lg",
  lg: "h-20 w-20 rounded-2xl text-xl",
};

const sizePx = { xs: 32, sm: 44, md: 64, lg: 80 };

// Deterministic, AA-contrast tints so a brand always gets the same colour.
const MONOGRAM_TINTS = [
  "bg-brand-100 text-brand",
  "bg-amber-100 text-amber-900",
  "bg-emerald-100 text-emerald-900",
  "bg-sky-100 text-sky-900",
  "bg-rose-100 text-rose-900",
  "bg-violet-100 text-violet-900",
  "bg-teal-100 text-teal-900",
  "bg-orange-100 text-orange-900",
];

export function brandInitials(brand: string): string {
  const words = brand
    .replace(/[^\p{L}\p{N}\s'&-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w && !["&", "-", "the"].includes(w.toLowerCase()));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

function tintFor(brand: string): string {
  let hash = 0;
  for (const ch of brand) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return MONOGRAM_TINTS[hash % MONOGRAM_TINTS.length];
}

/**
 * Brand mark: the brand's logo (via logo.dev) when we have one, otherwise a
 * clean monogram. Never an emoji.
 */
export function ProductIcon({ imageUrl, brandName, size = "md", className = "" }: ProductIconProps) {
  const logoUrl = imageUrl ?? (brandName ? getBrandLogoUrl(brandName, sizePx[size] * 2) : null);

  if (logoUrl) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-white p-1.5 ${sizeClasses[size]} ${className}`}
      >
        <Image
          src={logoUrl}
          alt={brandName ? `${brandName} logo` : "Brand logo"}
          width={sizePx[size]}
          height={sizePx[size]}
          className="h-full w-full object-contain"
          unoptimized
        />
      </span>
    );
  }

  if (!brandName) {
    return (
      <span
        role="img"
        aria-label="Product"
        className={`inline-flex shrink-0 items-center justify-center bg-paper-deep text-muted ${sizeClasses[size]} ${className}`}
      >
        <Package aria-hidden="true" className="h-1/2 w-1/2" strokeWidth={1.75} />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={`${brandName} logo`}
      className={`inline-flex shrink-0 select-none items-center justify-center font-bold tracking-tight ${tintFor(brandName)} ${sizeClasses[size]} ${className}`}
    >
      <span aria-hidden="true">{brandInitials(brandName)}</span>
    </span>
  );
}
