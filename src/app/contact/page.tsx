import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Bug, ChevronDown, Mail } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/site";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description={<p>Have a question, suggestion, or found a bug? We&apos;d love to hear from you.</p>}
      />

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="group card card-interactive block p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-tag">
              <Mail aria-hidden="true" className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-semibold text-ink">Email</h2>
            <p className="mt-1 break-all font-medium text-brand-500 group-hover:underline">{CONTACT_EMAIL}</p>
            <p className="mt-2 text-sm text-muted">General questions, corrections, privacy requests</p>
          </a>
          <a
            href="https://github.com/seawaydigital/genericornot/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="group card card-interactive relative block p-6"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-paper-deep text-ink">
              <Bug aria-hidden="true" className="h-5 w-5" />
            </span>
            <ArrowUpRight aria-hidden="true" className="absolute right-5 top-5 h-4 w-4 text-subtle" />
            <h2 className="mt-4 font-semibold text-ink">
              GitHub Issues <span className="sr-only">(opens in a new tab)</span>
            </h2>
            <p className="mt-1 font-medium text-brand-500 group-hover:underline">Report bugs or request features</p>
            <p className="mt-2 text-sm text-muted">For technical issues — please don&apos;t post personal information</p>
          </a>
        </div>

        <section aria-labelledby="faq-heading">
          <p className="eyebrow">Answers</p>
          <h2 id="faq-heading" className="mt-1.5 font-display text-4xl leading-none tracking-tight text-ink">
            Frequently Asked Questions
          </h2>
          <div className="card mt-6 divide-y divide-line overflow-hidden">
            {FAQ.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                  <span className="text-[15px]">{item.q}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <nav aria-label="More about GenericOrNot" className="flex flex-wrap gap-x-6 border-t border-line pt-4 text-sm">
          <Link href="/about" className="inline-flex min-h-11 items-center font-medium text-muted transition-colors hover:text-ink">
            About
          </Link>
          <Link href="/privacy" className="inline-flex min-h-11 items-center font-medium text-muted transition-colors hover:text-ink">
            Privacy Policy
          </Link>
          <Link href="/terms" className="inline-flex min-h-11 items-center font-medium text-muted transition-colors hover:text-ink">
            Terms of Service
          </Link>
        </nav>
      </div>
    </div>
  );
}
