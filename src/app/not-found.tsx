import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SearchBar } from "@/components/layout/SearchBar";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/top-rated", label: "Best swaps" },
  { href: "/categories", label: "Categories" },
  { href: "/submit", label: "Submit" },
];

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-hero">
      <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:radial-gradient(closest-side,black,transparent)]" />
      <div className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <span aria-hidden="true" className="sale-tag -rotate-6 py-2 pr-5 font-display text-4xl font-normal">
          404
        </span>
        <p className="eyebrow mt-8">Page not found</p>
        <h1 className="mt-2 font-display text-5xl leading-none tracking-tight text-ink text-balance sm:text-6xl">
          This aisle is <em className="italic text-brand-500">empty</em>
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-8 w-full text-left">
          <p className="mb-2 text-center text-sm text-muted">Try searching for a product</p>
          <SearchBar />
        </div>

        <nav aria-label="Popular pages" className="mt-8 flex flex-wrap justify-center gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-line-strong"
            >
              {l.label}
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-subtle" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
