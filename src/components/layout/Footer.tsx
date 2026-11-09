import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE_TAGLINE } from "@/lib/site";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Best swaps", href: "/top-rated" },
      { label: "Categories", href: "/categories" },
      { label: "New comparisons", href: "/new" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Contribute",
    links: [
      { label: "Contribute", href: "/submit" },
      { label: "How verdicts work", href: "/about#verdicts" },
    ],
  },
  {
    title: "GenericOrNot",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-brand text-brand-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 py-14 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo tone="light" />
            <p className="mt-4 text-sm leading-relaxed text-brand-100/85">{SITE_TAGLINE}</p>
            <Link
              href="/submit"
              className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-tag px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-tag-deep"
            >
              Add a store-brand swap
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">{column.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-brand-100/85 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-brand-100/75 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {currentYear} GenericOrNot. Independent — not affiliated with any retailer or brand.
          </p>
          <p>Trademarks and brand names belong to their respective owners. Prices are approximate and in Canadian dollars.</p>
        </div>
        <p className="pb-8 text-[11px] uppercase tracking-[0.18em] text-brand-100/60">
          Made in Canada &middot; Transparency is our only product.
        </p>
      </div>
    </footer>
  );
}
