import type { ReactNode } from "react";

/** Shared layout for policy pages so headings and spacing stay consistent. */
export function LegalPage({ title, updated, intro, children }: { title: string; updated: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="mt-2 text-gray-500 text-sm">Last updated: {updated}</p>
          {intro && <div className="mt-5 text-gray-600 text-sm leading-relaxed space-y-3">{intro}</div>}
        </header>
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#0d1b4a]/60 shrink-0" aria-hidden="true">–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
