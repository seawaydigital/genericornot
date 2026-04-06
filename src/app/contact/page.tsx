import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact — GenericOrNot", description: "Get in touch with the GenericOrNot team." };

const FAQ = [
  { q: "How do I submit a comparison?", a: "Sign in with your Google account, then visit the Submit page. All submissions are reviewed by moderators before going live." },
  { q: "How are verdicts calculated?", a: "Verdicts are 100% community-driven, computed algorithmically from user votes. When a leading vote option exceeds 40%, it becomes the verdict. See our About page for full details." },
  { q: "I found incorrect information. How do I report it?", a: "You can flag any comparison as outdated directly from the comparison page. You can also submit evidence with corrections." },
  { q: "Can brands pay to change a verdict?", a: "No. Verdicts are never influenced by sponsors, advertisers, or brands. See our editorial independence policy on the About page." },
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
          <a href="mailto:hello@genericornot.com" className="glass glass-hover rounded-2xl p-6 transition-all duration-200 block">
            <div className="text-2xl mb-3 opacity-40">&#9993;</div>
            <h2 className="text-gray-900 font-semibold text-sm">Email</h2>
            <p className="text-[#0d1b4a] text-sm mt-1">hello@genericornot.com</p>
            <p className="text-gray-400 text-xs mt-2">General inquiries and feedback</p>
          </a>
          <a href="https://github.com/seawaydigital/genericornot/issues" target="_blank" rel="noopener noreferrer" className="glass glass-hover rounded-2xl p-6 transition-all duration-200 block">
            <div className="text-2xl mb-3 opacity-40">&#128736;</div>
            <h2 className="text-gray-900 font-semibold text-sm">GitHub Issues</h2>
            <p className="text-[#0d1b4a] text-sm mt-1">Report bugs or request features</p>
            <p className="text-gray-400 text-xs mt-2">For technical issues and feature requests</p>
          </a>
        </div>

        <section>
          <div className="accent-line"><h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Frequently Asked Questions</h2></div>
          <div className="mt-8 space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5">
                <h3 className="text-gray-900 font-medium text-sm">{item.q}</h3>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="gradient-divider" />
        <div className="flex flex-wrap gap-6 text-sm">
          <Link href="/about" className="text-gray-400 hover:text-gray-600 transition-colors">About</Link>
          <Link href="/privacy" className="text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
