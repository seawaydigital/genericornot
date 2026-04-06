import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — GenericOrNot", description: "Terms and conditions for using GenericOrNot." };

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-gray-400 text-sm">Last updated: April 2026</p>
        </header>

        <section className="space-y-4"><h2 className="text-lg font-semibold text-gray-900">Acceptance of Terms</h2><p className="text-gray-600 text-sm leading-relaxed">By accessing or using GenericOrNot, you agree to be bound by these terms. If you do not agree, please do not use the site.</p></section>

        <section className="space-y-4"><h2 className="text-lg font-semibold text-gray-900">What GenericOrNot Is</h2><p className="text-gray-600 text-sm leading-relaxed">GenericOrNot is a community platform where users share opinions and evidence about whether generic or store-brand products are comparable to name-brand equivalents. Verdicts are based on community votes and should not be taken as professional, medical, or safety advice.</p></section>

        <section className="space-y-4"><h2 className="text-lg font-semibold text-gray-900">User Accounts</h2><div className="text-gray-600 text-sm leading-relaxed space-y-3"><p>You must sign in with a valid Google account to vote, submit comparisons, or contribute evidence.</p><p>We reserve the right to suspend or terminate accounts that violate these terms.</p></div></section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">User Conduct</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">When contributing to GenericOrNot, you agree not to:</p>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-none">
            <li className="flex gap-2"><span className="text-red-500/60 shrink-0">-</span><span>Submit false, misleading, or spam content</span></li>
            <li className="flex gap-2"><span className="text-red-500/60 shrink-0">-</span><span>Manipulate votes through multiple accounts or automated means</span></li>
            <li className="flex gap-2"><span className="text-red-500/60 shrink-0">-</span><span>Harass, defame, or impersonate other users</span></li>
            <li className="flex gap-2"><span className="text-red-500/60 shrink-0">-</span><span>Attempt to disrupt the service or access it through unauthorized means</span></li>
            <li className="flex gap-2"><span className="text-red-500/60 shrink-0">-</span><span>Submit content that infringes on intellectual property rights</span></li>
          </ul>
        </section>

        <section className="space-y-4"><h2 className="text-lg font-semibold text-gray-900">Content Submissions</h2><div className="text-gray-600 text-sm leading-relaxed space-y-3"><p>By submitting comparisons, evidence, or votes, you grant GenericOrNot a non-exclusive, worldwide, royalty-free license to display and use that content as part of the platform.</p><p>All submissions are reviewed by moderators before publication.</p></div></section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Disclaimer</h2>
          <div className="glass rounded-2xl p-5 text-gray-600 text-sm leading-relaxed space-y-3">
            <p>GenericOrNot provides community opinions, not professional advice. Product formulations, manufacturers, and prices change over time. Always check current product labels and consult professionals for medical or safety decisions.</p>
            <p>The site is provided &ldquo;as is&rdquo; without warranty of any kind.</p>
          </div>
        </section>

        <section className="space-y-4"><h2 className="text-lg font-semibold text-gray-900">Limitation of Liability</h2><p className="text-gray-600 text-sm leading-relaxed">GenericOrNot and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.</p></section>

        <section className="space-y-4"><h2 className="text-lg font-semibold text-gray-900">Changes to These Terms</h2><p className="text-gray-600 text-sm leading-relaxed">We may modify these terms at any time. Your continued use constitutes acceptance of the revised terms.</p></section>

        <div className="gradient-divider" />
        <p className="text-gray-400 text-xs">Questions about these terms? <a href="/contact" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors">Contact us</a>.</p>
      </div>
    </div>
  );
}
