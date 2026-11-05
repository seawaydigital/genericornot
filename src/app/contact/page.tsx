import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — GenericOrNot",
  description: "Get in touch with the GenericOrNot team, report a problem, or make a privacy request.",
  alternates: { canonical: "/contact" },
};

const FAQ = [
  {
    q: "How do I submit a comparison?",
    a: "Sign in with Google, Facebook, Microsoft or an email link, then use the Contribute page. Every submission is reviewed by a moderator before it goes live.",
  },
  {
    q: "What's the difference between a research verdict and a community verdict?",
    a: "A research verdict appears only when there's objective evidence — like the same medicinal ingredient and strength, or a legal standard both products must meet. Once five people vote, the community verdict takes over. The page always tells you which one you're seeing.",
  },
  {
    q: "Are the prices accurate?",
    a: "They're approximate regular shelf prices in Canadian dollars. Prices vary by province, store and weekly sales, so use them as a guide and check the shelf tag.",
  },
  {
    q: "I found incorrect information. How do I report it?",
    a: "Use \"Report outdated info\" on the comparison page, or add evidence with a correction. You can also email us.",
  },
  {
    q: "Can brands pay to change a verdict?",
    a: "No. Verdicts are never influenced by sponsors, advertisers or brands. Brands that believe a page is factually wrong can email us with evidence, like anyone else.",
  },
  {
    q: "How do I see or delete my data?",
    a: "Email us with the subject \"Privacy\" from the address you sign in with. We'll respond within 30 days. See the Privacy Policy for details.",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-6 py-12 space-y-12">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contact</h1>
          <p className="mt-2 text-gray-500 text-sm">Have a question, suggestion, or found a bug? We&apos;d love to hear from you.</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="glass glass-hover rounded-2xl p-6 transition-all duration-200 block">
            <div className="text-2xl mb-3 opacity-40" aria-hidden="true">&#9993;</div>
            <h2 className="text-gray-900 font-semibold text-sm">Email</h2>
            <p className="text-[#0d1b4a] text-sm mt-1">{CONTACT_EMAIL}</p>
            <p className="text-gray-500 text-xs mt-2">General questions, corrections, privacy requests</p>
          </a>
          <a href="https://github.com/seawaydigital/genericornot/issues" target="_blank" rel="noopener noreferrer" className="glass glass-hover rounded-2xl p-6 transition-all duration-200 block">
            <div className="text-2xl mb-3 opacity-40" aria-hidden="true">&#128736;</div>
            <h2 className="text-gray-900 font-semibold text-sm">GitHub Issues</h2>
            <p className="text-[#0d1b4a] text-sm mt-1">Report bugs or request features</p>
            <p className="text-gray-500 text-xs mt-2">For technical issues — please don&apos;t post personal information</p>
          </a>
        </div>

        <section>
          <div className="accent-line"><h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Frequently Asked Questions</h2></div>
          <div className="mt-8 space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="glass rounded-2xl p-5">
                <h3 className="text-gray-900 font-medium text-sm">{item.q}</h3>
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="gradient-divider" />
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/about" className="text-gray-500 hover:text-gray-800 transition-colors">About</Link>
          <Link href="/privacy" className="text-gray-500 hover:text-gray-800 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-gray-500 hover:text-gray-800 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
