import { Tag } from "lucide-react";

/** Brand lockup: a price-tag mark and the GenericOrNot wordmark. */
export function Logo({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-[11px] shadow-sm ${
          light ? "bg-tag text-brand" : "bg-brand text-tag"
        }`}
      >
        <Tag width={18} height={18} strokeWidth={2.4} className="-rotate-12" />
      </span>
      <span className={`text-[1.15rem] font-bold leading-none tracking-tight ${light ? "text-white" : "text-brand"}`}>
        Generic<span className="px-[0.05em] font-display text-[1.28em] font-normal italic">Or</span>Not
      </span>
    </span>
  );
}
