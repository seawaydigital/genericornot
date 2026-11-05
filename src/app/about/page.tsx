import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CircleHelp,
  Eye,
  FlaskConical,
  Flag,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SavingsTag } from "@/components/ui/SavingsTag";
import { VERDICT_STYLES } from "@/components/comparison/GenericStatusBadge";
import { VERDICT_LABELS } from "@/lib/verdict-labels";

export const metadata: Metadata = {
  title: "About GenericOrNot — How verdicts work",
  description:
    "How GenericOrNot works: research verdicts from hard evidence, community verdicts from real votes, evidence confidence tiers, and our editorial independence.",
  alternates: { canonical: "/about" },
};

const SECTIONS = [
  { id: "promise", label: "Our promise" },
  { id: "verdicts", label: "How verdicts work" },
  { id: "prices", label: "Prices and savings" },
  { id: "evidence", label: "Evidence tiers" },
];

const PROMISES: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: Users,
    title: "Every vote is a real person.",
    body: "Vote totals come only from signed-in shoppers, one vote each. We never seed, pad or estimate vote counts.",
  },
  {
    Icon: FlaskConical,
    title: "Research and opinion are labelled separately.",
    body: "When we show a research verdict, it says so, and the evidence behind it is on the page.",
  },
  {
    Icon: ShieldCheck,
    title: "We will never accept payment to change a verdict.",
    body: "If a brand asks us to alter a verdict or suppress community findings, we will decline.",
  },
  {
    Icon: Eye,
    title: "Full transparency on money.",
    body: "If we ever add affiliate links, sponsorships or ads, they will be clearly labelled and kept entirely separate from verdicts and evidence.",
  },
];

const THRESHOLDS: { verdicts: (keyof typeof VERDICT_STYLES)[]; rule: string }[] = [
  { verdicts: ["PENDING"], rule: "Fewer than 5 votes" },
  { verdicts: ["SAME_QUALITY", "CLOSE_ENOUGH", "NOT_WORTH_IT"], rule: "Leading option has more than 40% of votes" },
  { verdicts: ["MIXED"], rule: "No option above 40%" },
];

const TIERS: { Icon: LucideIcon; label: string; className: string; body: string }[] = [
  {
    Icon: BadgeCheck,
    label: "Confirmed",
    className: "bg-good-bg text-good ring-good-line",
    body: "Backed by an authoritative source we can point to: Health Canada or CFIA rules, a regulatory filing, a recall notice, or information printed on the product itself.",
  },
  {
    Icon: Users,
    label: "Community Reported",
    className: "bg-brand-50 text-brand-500 ring-brand-100",
    body: "Widely reported or corroborated by several independent people, but not officially documented.",
  },
  {
    Icon: CircleHelp,
    label: "Unverified",
    className: "bg-neutral-bg text-neutral ring-neutral-line",
    body: "A single report or personal experience. Often useful, but not corroborated. Weigh it accordingly.",
  },
];

function VerdictChip({ verdict }: { verdict: keyof typeof VERDICT_STYLES }) {
  const style = VERDICT_STYLES[verdict];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${style.chip}`}>
      <style.Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
      {VERDICT_LABELS[verdict]}
    </span>
  );
}

function SectionTitle({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-1.5 font-display text-4xl leading-none tracking-tight text-ink">
        {children}
      </h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="About GenericOrNot"
        title={
          <>
            Built for the <em className="italic text-brand-500">moment at the shelf</em>
          </>
        }
        description={
          <p>
            GenericOrNot is an independent, community-driven resource for Canadian shoppers. It answers one question
            before you reach the checkout: is the store brand as good as the name brand — and how much do you save?
          </p>
        }
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-16 lg:px-8">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1 border-l border-line">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm font-medium text-muted transition-colors hover:border-brand-500 hover:text-ink"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-16">
          <section aria-labelledby="promise" className="scroll-mt-24">
            <SectionTitle id="promise" eyebrow="Editorial independence">
              Our promise
            </SectionTitle>
            <ul className="grid gap-4 sm:grid-cols-2">
              {PROMISES.map(({ Icon, title, body }) => (
                <li key={title} className="card p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-tag">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <p className="mt-4 font-semibold leading-snug text-ink">{title}</p>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="verdicts" className="scroll-mt-24">
            <SectionTitle id="verdicts" eyebrow="Two kinds of verdict">
              How verdicts work
            </SectionTitle>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
              Each comparison can show one of two kinds of verdict. You&apos;ll always see which one you&apos;re looking
              at.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="card p-6">
                <p className="inline-flex items-center gap-2 font-semibold text-ink">
                  <FlaskConical aria-hidden="true" className="h-5 w-5 text-brand-500" />
                  Research verdict
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Shown only when there&apos;s objective evidence: the same medicinal ingredient and strength (Health
                  Canada requires generic medicines to match the brand), a legal standard that both products must meet
                  (for example, Canadian butter must contain at least 80% milk fat), or a manufacturer disclosed on the
                  package. Taste and performance questions don&apos;t get a research verdict — those are for the
                  community.
                </p>
              </div>
              <div className="card p-6">
                <p className="inline-flex items-center gap-2 font-semibold text-ink">
                  <Users aria-hidden="true" className="h-5 w-5 text-good" />
                  Community verdict
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Every signed-in shopper gets one vote per comparison: <strong className="text-ink">Same Quality</strong>,{" "}
                  <strong className="text-ink">Close Enough</strong> or <strong className="text-ink">Not Worth It</strong>.
                  Once a comparison has 5 votes, the community verdict replaces any research verdict.
                </p>
              </div>
            </div>

            <div className="card mt-4 overflow-hidden">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Community verdict thresholds</caption>
                <thead className="bg-surface-2 text-xs uppercase tracking-[0.12em] text-subtle">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Verdict
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Threshold
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {THRESHOLDS.map((row) => (
                    <tr key={row.rule}>
                      <td className="px-5 py-3.5">
                        <span className="flex flex-wrap gap-1.5">
                          {row.verdicts.map((v) => (
                            <VerdictChip key={v} verdict={v} />
                          ))}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{row.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">
                The <strong className="text-ink">confidence score</strong> reflects both how many people voted and how
                much they agree:{" "}
                <code className="rounded-md bg-paper-deep px-1.5 py-0.5 text-xs text-ink">min(100, votes × 2) × top share</code>.
              </p>
            </div>
          </section>

          <section aria-labelledby="prices" className="scroll-mt-24">
            <SectionTitle id="prices" eyebrow="Unit prices">
              Prices and savings
            </SectionTitle>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
              <p className="text-[15px] leading-relaxed text-muted">
                Prices are approximate regular shelf prices in Canadian dollars. They vary by province, store banner and
                weekly sales, so treat them as a guide. When we know both package sizes, savings compare the{" "}
                <em>unit</em> price — per 100 g, per 100 mL or per item — so a bulk pack isn&apos;t mistaken for the more
                expensive option.
              </p>
              <figure className="card p-5">
                <figcaption className="eyebrow">How the math works</figcaption>
                <dl className="mt-3 space-y-3 text-sm tabular-nums">
                  <div>
                    <dt className="text-muted">Name brand · 100 tablets</dt>
                    <dd className="mt-0.5 font-semibold text-ink">$16.99 — $0.17 each</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Store brand · 100 tablets</dt>
                    <dd className="mt-0.5 font-semibold text-good">$9.99 — $0.10 each</dd>
                  </div>
                </dl>
                <div className="mt-4 border-t border-line pt-4">
                  <SavingsTag percent={41} size="md" suffix="per unit" />
                </div>
              </figure>
            </div>
          </section>

          <section aria-labelledby="evidence" className="scroll-mt-24">
            <SectionTitle id="evidence" eyebrow="What we know">
              Evidence confidence tiers
            </SectionTitle>
            <p className="max-w-2xl text-[15px] leading-relaxed text-muted">
              Every piece of evidence is reviewed before it appears and labelled with one of three tiers.
            </p>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {TIERS.map(({ Icon, label, className, body }) => (
                <li key={label} className="card p-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
                    <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{body}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="flex flex-col gap-4 rounded-[1.5rem] bg-brand p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tag text-brand">
                <Flag aria-hidden="true" className="h-5 w-5" />
              </span>
              <p className="text-[15px] leading-relaxed text-white/85">
                <strong className="block text-lg font-semibold text-white">Spotted something wrong or out of date?</strong>
                Use &ldquo;Report outdated info&rdquo; on the comparison, add evidence, or contact us.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-tag px-5 text-sm font-semibold text-brand transition-colors hover:bg-tag-deep"
            >
              Contact us
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
