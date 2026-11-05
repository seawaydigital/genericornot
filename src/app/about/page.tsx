import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About GenericOrNot — How verdicts work",
  description:
    "How GenericOrNot works: research verdicts from hard evidence, community verdicts from real votes, evidence confidence tiers, and our editorial independence.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-12">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">About GenericOrNot</h1>
          <p className="mt-3 text-gray-600 text-lg leading-relaxed">
            GenericOrNot is an independent, community-driven resource for Canadian shoppers. It answers one question
            before you reach the checkout: is the store brand as good as the name brand — and how much do you save?
          </p>
        </header>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">Our Promise: Editorial Independence</h2></div>
          <ul className="space-y-4 text-gray-600 text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0" aria-hidden="true">&#10003;</span><span><strong className="text-gray-900">Every vote is a real person.</strong> Vote totals come only from signed-in shoppers, one vote each. We never seed, pad or estimate vote counts.</span></li>
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0" aria-hidden="true">&#10003;</span><span><strong className="text-gray-900">Research and opinion are labelled separately.</strong> When we show a research verdict, it says so, and the evidence behind it is on the page.</span></li>
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0" aria-hidden="true">&#10003;</span><span><strong className="text-gray-900">We will never accept payment to change a verdict.</strong> If a brand asks us to alter a verdict or suppress community findings, we will decline.</span></li>
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0" aria-hidden="true">&#10003;</span><span><strong className="text-gray-900">Full transparency on money.</strong> If we ever add affiliate links, sponsorships or ads, they will be clearly labelled and kept entirely separate from verdicts and evidence.</span></li>
          </ul>
        </section>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">How Verdicts Work</h2></div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Each comparison can show one of two kinds of verdict. You&apos;ll always see which one you&apos;re looking at.
          </p>

          <div className="glass rounded-2xl p-5 space-y-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Research verdict</p>
            <p className="leading-relaxed">
              Shown only when there&apos;s objective evidence: the same medicinal ingredient and strength (Health Canada
              requires generic medicines to match the brand), a legal standard that both products must meet (for
              example, Canadian butter must contain at least 80% milk fat), or a manufacturer disclosed on the package.
              Taste and performance questions don&apos;t get a research verdict — those are for the community.
            </p>
          </div>

          <div className="glass rounded-2xl p-5 space-y-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Community verdict</p>
            <p className="leading-relaxed">
              Every signed-in shopper gets one vote per comparison:
              <strong className="text-emerald-700"> Same Quality</strong>,
              <strong className="text-amber-700"> Close Enough</strong> or
              <strong className="text-red-700"> Not Worth It</strong>. Once a comparison has 5 votes, the community
              verdict replaces any research verdict.
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="font-medium text-gray-900">Verdict</span>
                <span className="font-medium text-gray-900">Threshold</span>
              </div>
              <div className="flex justify-between items-center gap-4"><span className="text-gray-500">Awaiting votes</span><span className="text-right">Fewer than 5 votes</span></div>
              <div className="flex justify-between items-center gap-4"><span className="text-emerald-700">Generic Worth It / Close Enough / Stick with Brand</span><span className="text-right">Leading option has more than 40% of votes</span></div>
              <div className="flex justify-between items-center gap-4"><span className="text-amber-700">Mixed Reviews</span><span className="text-right">No option above 40%</span></div>
            </div>
            <p className="text-gray-500 leading-relaxed">
              The <strong className="text-gray-700">confidence score</strong> reflects both how many people voted and how
              much they agree:{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 text-xs">min(100, votes × 2) × top share</code>.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">Prices and Savings</h2></div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Prices are approximate regular shelf prices in Canadian dollars. They vary by province, store banner and
            weekly sales, so treat them as a guide. When we know both package sizes, savings compare the{" "}
            <em>unit</em> price — per 100 g, per 100 mL or per item — so a bulk pack isn&apos;t mistaken for the more
            expensive option.
          </p>
        </section>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">Evidence Confidence Tiers</h2></div>
          <p className="text-gray-500 text-sm leading-relaxed">Every piece of evidence is reviewed before it appears and labelled with one of three tiers.</p>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border-l-2 border-l-emerald-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 mb-2">&#10003; Confirmed</span>
              <p className="text-gray-600 text-sm leading-relaxed">Backed by an authoritative source we can point to: Health Canada or CFIA rules, a regulatory filing, a recall notice, or information printed on the product itself.</p>
            </div>
            <div className="glass rounded-2xl p-5 border-l-2 border-l-blue-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-2">Community Reported</span>
              <p className="text-gray-600 text-sm leading-relaxed">Widely reported or corroborated by several independent people, but not officially documented.</p>
            </div>
            <div className="glass rounded-2xl p-5 border-l-2 border-l-gray-300">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 mb-2">Unverified</span>
              <p className="text-gray-600 text-sm leading-relaxed">A single report or personal experience. Often useful, but not corroborated. Weigh it accordingly.</p>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-6 text-sm text-gray-600 leading-relaxed">
          <p>
            Spotted something wrong or out of date? Use &ldquo;Report outdated info&rdquo; on the comparison, add
            evidence, or <Link href="/contact" className="text-[#0d1b4a] hover:underline">contact us</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
