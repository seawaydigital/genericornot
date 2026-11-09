import {
  Baby,
  BatteryCharging,
  Droplets,
  House,
  Package,
  PawPrint,
  Pill,
  ShoppingBasket,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

// One consistent SVG icon family for categories (no emoji: they render
// differently on every platform and can't follow our colour tokens).
const ICONS: Record<string, LucideIcon> = {
  grocery: ShoppingBasket,
  "health-otc": Pill,
  cleaning: SprayCan,
  "baby-kids": Baby,
  "personal-care": Droplets,
  "pet-supplies": PawPrint,
  electronics: BatteryCharging,
  "home-garden": House,
};

// Soft tint per category: background + icon colour (both AA on each other).
const TINTS: Record<string, string> = {
  grocery: "bg-amber-100 text-amber-800",
  "health-otc": "bg-sky-100 text-sky-800",
  cleaning: "bg-teal-100 text-teal-800",
  "baby-kids": "bg-pink-100 text-pink-800",
  "personal-care": "bg-violet-100 text-violet-800",
  "pet-supplies": "bg-orange-100 text-orange-800",
  electronics: "bg-lime-100 text-lime-800",
  "home-garden": "bg-emerald-100 text-emerald-800",
};

export function categoryTint(slug?: string | null): string {
  return (slug && TINTS[slug]) || "bg-brand-50 text-brand";
}

interface CategoryIconProps {
  slug?: string | null;
  className?: string;
  /** Pixel size of the glyph. */
  size?: number;
  strokeWidth?: number;
}

export function CategoryIcon({ slug, className = "", size = 20, strokeWidth = 1.9 }: CategoryIconProps) {
  const Icon = (slug && ICONS[slug]) || Package;
  return <Icon aria-hidden="true" className={className} width={size} height={size} strokeWidth={strokeWidth} />;
}

/** Icon inside a rounded, tinted tile — used on category cards and headers. */
export function CategoryTile({
  slug,
  size = "md",
  className = "",
}: {
  slug?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "sm" ? "h-9 w-9 rounded-xl" : size === "lg" ? "h-16 w-16 rounded-2xl" : "h-12 w-12 rounded-2xl";
  const glyph = size === "sm" ? 18 : size === "lg" ? 30 : 22;
  return (
    <span className={`inline-grid shrink-0 place-items-center ${box} ${categoryTint(slug)} ${className}`}>
      <CategoryIcon slug={slug} size={glyph} />
    </span>
  );
}
