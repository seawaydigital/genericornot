import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — GenericOrNot", description: "How GenericOrNot collects, uses, and protects your information." };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-gray-400 text-sm">Last updated: April 2026</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Information We Collect</h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p>When you sign in with Google, we receive your name, email address, and profile photo from your Google account. We use this to create your GenericOrNot profile.</p>
            <p>When you use the site, we collect information about your activity including votes cast, comparisons submitted, and evidence contributed.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">How We Use Your Information</h2>
          <ul className="text-gray-600 text-sm leading-relaxed space-y-2 list-none">
            <li className="flex gap-2"><span className="text-[#0d1b4a]/60 shrink-0">-</span><span>To operate the voting and comparison platform</span></li>
            <li className="flex gap-2"><span className="text-[#0d1b4a]/60 shrink-0">-</span><span>To display your username on contributions you make</span></li>
            <li className="flex gap-2"><span className="text-[#0d1b4a]/60 shrink-0">-</span><span>To compute community verdicts from aggregated votes</span></li>
            <li className="flex gap-2"><span className="text-[#0d1b4a]/60 shrink-0">-</span><span>To prevent vote manipulation and enforce rate limits</span></li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Cookies &amp; Local Storage</h2>
          <p className="text-gray-600 text-sm leading-relaxed">We use session cookies to keep you signed in. We do not use tracking cookies or third-party analytics.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Third-Party Services</h2>
          <div className="text-gray-600 text-sm leading-relaxed space-y-3">
            <p><strong className="text-gray-700">Google OAuth</strong> — Used for authentication. See <a href="https://policies.google.com/privacy" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</p>
            <p><strong className="text-gray-700">Vercel</strong> — Hosts the site. See <a href="https://vercel.com/legal/privacy-policy" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors" target="_blank" rel="noopener noreferrer">Vercel&apos;s Privacy Policy</a>.</p>
            <p><strong className="text-gray-700">Neon</strong> — Hosts our database. Your data is stored securely on Neon&apos;s infrastructure.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Data Retention</h2>
          <p className="text-gray-600 text-sm leading-relaxed">Your account data is retained as long as your account is active. You may request full deletion by contacting us.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Rights</h2>
          <p className="text-gray-600 text-sm leading-relaxed">You have the right to access, correct, or delete your personal data. Contact us at the address below to exercise any of these rights.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Changes to This Policy</h2>
          <p className="text-gray-600 text-sm leading-relaxed">We may update this privacy policy from time to time. Continued use of the site after changes constitutes acceptance.</p>
        </section>

        <div className="gradient-divider" />
        <p className="text-gray-400 text-xs">Questions about this policy? <a href="/contact" className="text-[#0d1b4a] hover:text-[#1e3a7a] transition-colors">Contact us</a>.</p>
      </div>
    </div>
  );
}
