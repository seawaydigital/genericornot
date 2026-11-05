import Link from "next/link";
import { ArrowRight, FlaskConical, Search, ShieldCheck, Users, Vote } from "lucide-react";
import { prisma } from "@/lib/db";
import { SearchBar } from "@/components/layout/SearchBar";
import { TrendingSection } from "@/components/home/TrendingSection";
import { HeroFaceOff } from "@/components/home/HeroFaceOff";
import { CategoryGrid } from "@/components/category/CategoryGrid";
import { RecentActivity } from "@/components/home/RecentActivity";
import { ProductIcon } from "@/components/ui/ProductIcon";
import { comparisonCardInclude, toCardData } from "@/lib/comparisons";
import { SYSTEM_USER_EMAIL } from "@/lib/catalogue/constants";

export const revalidate = 120;

const POPULAR_SEARCHES = [
  { label: "Advil", query: "advil" },
  { label: "Tylenol", query: "tylenol" },
  { label: "Kraft Dinner", query: "kraft dinner" },
  { label: "Butter", query: "butter" },
  { label: "Diapers", query: "diapers" },
];

const STORE_BRANDS = [
  { name: "No Name", store: "Loblaws · No Frills" },
  { name: "President's Choice", store: "Loblaws" },
  { name: "Great Value", store: "Walmart" },
  { name: "Kirkland Signature", store: "Costco" },
  { name: "Life Brand", store: "Shoppers Drug Mart" },
  { name: "Compliments", store: "Sobeys" },
  { name: "Selection", store: "Metro" },
  { name: "Equate", store: "Walmart" },
];

const STEPS = [
  {
    Icon: Search,
    title: "Look it up",
    body: "Search the name brand you usually buy and see the store-brand alternative at Loblaws, Walmart, Costco, Shoppers, Sobeys, Metro and more.",
  },
  {
    Icon: FlaskConical,
    title: "Check the verdict",
    body: "Where there's hard evidence — same medicinal ingredient, a legal standard, a disclosed maker — you see a research verdict. Five votes in, the community verdict takes over.",
  },
  {
    Icon: Vote,
    title: "Add your voice",
    body: "Tried both? Vote in one tap and share what you noticed. Every vote is a real person — we never pad the numbers.",
  },
];

async function getFeaturedComparisons() {
  try {
    const rows = await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ featured: "desc" }, { totalVotes: "desc" }, { createdAt: "desc" }],
      take: 7,
      include: comparisonCardInclude,
    });
    return rows.map(toCardData);
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    const rows = await prisma.category.findMany({ orderBy: { comparisonCount: "desc" } });
    return rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, comparisonCount: r.comparisonCount }));
  } catch {
    return [];
  }
}

async function getRecentEvidence() {
  try {
    const rows = await prisma.evidence.findMany({
      // Only moderated evidence on public comparisons, and only from real
      // contributors (not the editorial account that authors the catalogue).
      where: {
        status: "APPROVED",
        comparison: { status: "APPROVED" },
        user: { email: { not: SYSTEM_USER_EMAIL } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { comparison: { select: { slug: true, genericProductName: true, nameBrandProductName: true } } },
    });
    return rows.map((r) => ({ id: r.id, title: r.title, type: r.type, createdAt: r.createdAt, comparison: r.comparison }));
  } catch {
    return [];
  }
}

async function getRecentComparisons() {
  try {
    return await prisma.productComparison.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, slug: true, genericProductName: true, nameBrandProductName: true, createdAt: true },
    });
  } catch {
    return [];
  }
}

export default async function Home() {
  const [featured, categories, recentEvidence, recentComparisons] = await Promise.all([
    getFeaturedComparisons(),
    getCategories(),
    getRecentEvidence(),
    getRecentComparisons(),
  ]);

  const totalComparisons = categories.reduce((sum, c) => sum + c.comparisonCount, 0);
  const [hero, ...popular] = featured;

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero">
        <div aria-hidden="true" className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div
          className={`relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20 ${
            hero ? "lg:grid-cols-[1.08fr_0.92fr]" : ""
          }`}
        >
          <div className={hero ? "" : "mx-auto max-w-3xl text-center"}>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold text-muted shadow-sm">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-good" />
              For Canadian shoppers · Prices in CAD
            </p>
            <h1 className="animate-fade-up delay-100 mt-6 font-display text-[3.25rem] leading-[0.95] tracking-tight text-ink text-balance sm:text-7xl lg:text-[5.25rem]">
              Is the generic version <em className="italic text-brand-500">worth it?</em>
            </h1>
            <p className="animate-fade-up delay-200 mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Community-powered comparisons of store-brand vs name-brand products sold in Canada. See when the cheaper
              option is just as good — and when it&apos;s worth paying for the brand.
            </p>

            <div className="animate-fade-up delay-300 mt-9 max-w-xl">
              <SearchBar popular={POPULAR_SEARCHES} size="hero" centerChips={!hero} />
            </div>

            <dl className="animate-fade-up delay-400 mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-muted">
              {totalComparisons > 0 && (
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Comparisons</dt>
                  <dd className="font-display text-3xl leading-none tabular-nums text-ink">{totalComparisons}</dd>
                  <span>comparisons</span>
                </div>
              )}
              {categories.length > 0 && (
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Categories</dt>
                  <dd className="font-display text-3xl leading-none tabular-nums text-ink">{categories.length}</dd>
                  <span>categories</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <dt className="sr-only">Votes</dt>
                <ShieldCheck aria-hidden="true" className="h-5 w-5 text-good" />
                <dd>Every vote is a real person</dd>
              </div>
            </dl>
          </div>

          {hero && (
            <div className="animate-fade-up delay-300 lg:pl-6">
              <HeroFaceOff comparison={hero} />
            </div>
          )}
        </div>
      </section>

      {/* ── Store-brand strip ───────────────────────────────── */}
      <section aria-labelledby="store-brands-heading" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <h2 id="store-brands-heading" className="eyebrow shrink-0">
              Store brands we compare
            </h2>
            <ul className="flex flex-wrap gap-2">
              {STORE_BRANDS.map((brand) => (
                <li key={brand.name}>
                  <Link
                    href={`/search?q=${encodeURIComponent(brand.name)}`}
                    className="group inline-flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-3.5 transition-colors hover:border-line-strong hover:bg-surface"
                    title={brand.store}
                  >
                    <ProductIcon brandName={brand.name} size="xs" className="!rounded-full" />
                    <span className="text-sm font-semibold text-ink">{brand.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:space-y-24 lg:px-8">
        <TrendingSection comparisons={popular.length > 0 ? popular : featured} />

        {/* ── How verdicts work ───────────────────────────── */}
        <section aria-labelledby="how-heading" className="overflow-hidden rounded-[1.75rem] border border-line bg-surface shadow-card">
          <div className="grid lg:grid-cols-[0.9fr_2fr]">
            <div className="border-b border-line bg-brand-50 p-8 lg:border-b-0 lg:border-r lg:p-10">
              <p className="eyebrow">How it works</p>
              <h2 id="how-heading" className="mt-2 font-display text-4xl leading-[1.05] tracking-tight text-ink">
                Real evidence, real votes, nothing padded.
              </h2>
              <Link href="/about#verdicts" className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand-500 hover:text-brand">
                How verdicts work
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ol className="grid gap-px bg-line sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex flex-col gap-4 bg-surface p-7 lg:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand text-white">
                      <step.Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="font-display text-3xl text-brand/25" aria-hidden="true">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <CategoryGrid categories={categories} />

        {/* ── Contribute band ─────────────────────────────── */}
        <section
          aria-labelledby="contribute-heading"
          className="relative overflow-hidden rounded-[1.75rem] bg-brand px-8 py-12 text-white sm:px-12 lg:py-14"
        >
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-tag/20 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-tag">Know a good swap?</p>
              <h2 id="contribute-heading" className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
                Help the next shopper save — it takes two minutes.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-brand-100">
                Add a comparison you&apos;ve spotted, or share what you noticed after trying both. Every submission is
                reviewed before it goes live.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/submit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tag px-6 font-semibold text-ink transition-colors hover:bg-tag-deep"
              >
                Submit a comparison
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                href="/top-rated"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Users aria-hidden="true" className="h-4 w-4" />
                See the best swaps
              </Link>
            </div>
          </div>
        </section>

        <RecentActivity evidence={recentEvidence} comparisons={recentComparisons} />
      </div>
    </div>
  );
}
