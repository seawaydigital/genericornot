import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GenericOrNot",
  description:
    "Learn about GenericOrNot's editorial independence policy, how verdicts work, and our evidence confidence tiers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-12">
        <header>
          <h1 className="text-white font-bold text-3xl mb-3">About GenericOrNot</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            GenericOrNot is a community-driven resource that helps shoppers find out whether
            generic and store-brand products are genuinely equivalent to their name-brand
            counterparts — so you can save money without sacrificing quality.
          </p>
        </header>

        {/* Editorial Independence */}
        <section className="space-y-4">
          <h2 className="text-white font-semibold text-xl border-b border-gray-800 pb-3">
            Our Promise: Editorial Independence
          </h2>
          <ul className="space-y-3 text-gray-300 text-sm leading-relaxed list-none">
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>
                <strong className="text-white">Verdicts are 100% community-driven.</strong> They
                are calculated algorithmically from user votes. No sponsor, advertiser, or third
                party has any ability to influence a verdict — ever.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>
                <strong className="text-white">Evidence is tiered by confidence level</strong>{" "}
                (Confirmed, Community Reported, Unverified) so you always know how much weight to
                give each piece of information.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>
                <strong className="text-white">We will never accept payment to change a verdict.</strong>{" "}
                If a brand approaches us asking to alter a verdict or suppress community findings,
                we will decline.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-emerald-400 font-bold mt-0.5 flex-shrink-0">✓</span>
              <span>
                <strong className="text-white">Full transparency on monetization.</strong> If we
                ever add affiliate links, sponsored content, or advertising, it will be clearly
                labeled and kept entirely separate from verdicts and evidence. You will always know
                what is editorial and what is paid.
              </span>
            </li>
          </ul>
        </section>

        {/* How Verdicts Work */}
        <section className="space-y-4">
          <h2 className="text-white font-semibold text-xl border-b border-gray-800 pb-3">
            How Verdicts Work
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Every user can cast one vote per comparison, choosing from three options:
            <strong className="text-emerald-400"> Same Quality</strong>,{" "}
            <strong className="text-amber-400"> Close Enough</strong>, or{" "}
            <strong className="text-red-400"> Not Worth It</strong>.
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3 text-sm text-gray-300">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="font-medium text-white">Verdict</span>
              <span className="font-medium text-white">Threshold</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pending</span>
              <span>Fewer than 5 total votes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Same Quality / Close Enough / Not Worth It</span>
              <span>Leading option has &gt;40% of votes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-amber-400">Mixed</span>
              <span>No single option exceeds 40%</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            The <strong className="text-white">confidence score</strong> reflects both the number
            of votes and how decisive the community is. A comparison with 500 votes all pointing
            one way scores much higher than one with 10 votes split evenly.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Formula:{" "}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-gray-200 text-xs">
              min(100, totalVotes × 2) × (topVotePercent / 100)
            </code>
          </p>
        </section>

        {/* Evidence Tiers */}
        <section className="space-y-4">
          <h2 className="text-white font-semibold text-xl border-b border-gray-800 pb-3">
            Evidence Confidence Tiers
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Not all evidence is equal. We categorize each piece of community-submitted evidence
            into one of three confidence tiers so you can quickly judge its reliability.
          </p>
          <div className="space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Confirmed
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                The highest confidence tier. Applies to evidence backed by FDA documentation,
                directly disclosed manufacturer relationships (e.g., a brand confirmed on
                packaging or in a public statement), recall documents, or regulatory filings.
                This is the most trustworthy category.
              </p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Community Reported
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Multiple independent users have corroborated this finding without a single
                authoritative source. Strong community consensus but not officially documented.
                Treat as reliable, but verify for high-stakes decisions.
              </p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                  Unverified
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                A single report or anecdotal observation. May be accurate but has not been
                corroborated by other community members or official sources. Use with caution.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
