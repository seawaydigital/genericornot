import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About GenericOrNot",
  description: "Learn about GenericOrNot's editorial independence policy, how verdicts work, and our evidence confidence tiers.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-12">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">About GenericOrNot</h1>
          <p className="mt-3 text-gray-500 text-lg leading-relaxed">
            GenericOrNot is a community-driven resource that helps shoppers find out whether generic and store-brand products are genuinely equivalent to their name-brand counterparts — so you can save money without sacrificing quality.
          </p>
        </header>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">Our Promise: Editorial Independence</h2></div>
          <ul className="space-y-4 text-gray-600 text-sm leading-relaxed list-none">
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0">&#10003;</span><span><strong className="text-gray-900">Verdicts are 100% community-driven.</strong> They are calculated algorithmically from user votes. No sponsor, advertiser, or third party has any ability to influence a verdict — ever.</span></li>
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0">&#10003;</span><span><strong className="text-gray-900">Evidence is tiered by confidence level</strong> (Confirmed, Community Reported, Unverified) so you always know how much weight to give each piece of information.</span></li>
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0">&#10003;</span><span><strong className="text-gray-900">We will never accept payment to change a verdict.</strong> If a brand approaches us asking to alter a verdict or suppress community findings, we will decline.</span></li>
            <li className="flex gap-3"><span className="text-[#0d1b4a] font-bold mt-0.5 shrink-0">&#10003;</span><span><strong className="text-gray-900">Full transparency on monetization.</strong> If we ever add affiliate links, sponsored content, or advertising, it will be clearly labeled and kept entirely separate from verdicts and evidence.</span></li>
          </ul>
        </section>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">How Verdicts Work</h2></div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Every user can cast one vote per comparison, choosing from three options:
            <strong className="text-emerald-700"> Same Quality</strong>,{" "}
            <strong className="text-amber-700"> Close Enough</strong>, or{" "}
            <strong className="text-red-700"> Not Worth It</strong>.
          </p>
          <div className="glass rounded-2xl p-5 space-y-3 text-sm text-gray-600">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">Verdict</span>
              <span className="font-medium text-gray-900">Threshold</span>
            </div>
            <div className="flex justify-between items-center"><span className="text-gray-400">Pending</span><span>Fewer than 5 total votes</span></div>
            <div className="flex justify-between items-center"><span className="text-emerald-700">Same Quality / Close Enough / Not Worth It</span><span>Leading option has &gt;40% of votes</span></div>
            <div className="flex justify-between items-center"><span className="text-amber-700">Mixed</span><span>No single option exceeds 40%</span></div>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            The <strong className="text-gray-700">confidence score</strong> reflects both the number of votes and how decisive the community is.
          </p>
          <p className="text-gray-500 text-sm leading-relaxed">
            Formula: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 text-xs">min(100, totalVotes x 2) x (topVotePercent / 100)</code>
          </p>
        </section>

        <section className="space-y-5">
          <div className="accent-line"><h2 className="text-xl font-semibold text-gray-900">Evidence Confidence Tiers</h2></div>
          <p className="text-gray-500 text-sm leading-relaxed">Not all evidence is equal. We categorize each piece into one of three confidence tiers.</p>
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border-l-2 border-l-emerald-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 mb-2">&#10003; Confirmed</span>
              <p className="text-gray-600 text-sm leading-relaxed">The highest confidence tier. Applies to evidence backed by FDA documentation, directly disclosed manufacturer relationships, recall documents, or regulatory filings.</p>
            </div>
            <div className="glass rounded-2xl p-5 border-l-2 border-l-blue-500">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-2">Community Reported</span>
              <p className="text-gray-600 text-sm leading-relaxed">Multiple independent users have corroborated this finding. Strong community consensus but not officially documented.</p>
            </div>
            <div className="glass rounded-2xl p-5 border-l-2 border-l-gray-300">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 mb-2">Unverified</span>
              <p className="text-gray-600 text-sm leading-relaxed">A single report or anecdotal observation. May be accurate but has not been corroborated. Use with caution.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
