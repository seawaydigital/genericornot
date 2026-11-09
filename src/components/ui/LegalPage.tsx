import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";

/** Shared layout for policy pages so headings and spacing stay consistent. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden border-b border-line bg-hero">
        <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight text-ink sm:text-6xl">{title}</h1>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold text-muted">
            <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
            Last updated: {updated}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6 md:py-14">
        {intro && (
          <div className="space-y-4 border-l-4 border-tag pl-5 text-[17px] leading-relaxed text-ink">{intro}</div>
        )}
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 border-t border-line pt-8">
      <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.7] text-muted">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-none space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
