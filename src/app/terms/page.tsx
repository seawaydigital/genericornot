import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/ui/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service — GenericOrNot",
  description: "The rules for using and contributing to GenericOrNot.",
  alternates: { canonical: "/terms" },
};

const linkClass = "font-medium text-brand-500 underline underline-offset-2 hover:text-brand";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="November 5, 2026"
      intro={
        <p>
          These terms apply when you use GenericOrNot (the &ldquo;site&rdquo;). By using the site you agree to them. If
          you don&apos;t agree, please don&apos;t use the site.
        </p>
      }
    >
      <LegalSection title="What GenericOrNot is — and isn't">
        <p>
          GenericOrNot is a community platform where people share opinions and evidence about whether store-brand
          products sold in Canada are comparable to name-brand equivalents. Community verdicts come from votes; research
          verdicts summarize the evidence shown on each page.
        </p>
        <div className="glass rounded-2xl p-5 space-y-3">
          <p>
            <strong className="text-gray-800">Not professional advice.</strong> Nothing on the site is medical,
            pharmaceutical, nutritional or safety advice. Formulations, manufacturers and prices change, and prices shown
            are approximate. Always read the current product label, and ask a pharmacist or doctor before switching
            medicines, infant formula or anything health-related.
          </p>
        </div>
      </LegalSection>

      <LegalSection title="Accounts">
        <LegalList
          items={[
            "You need an account to vote or contribute. You can sign in with Google, Facebook, Microsoft or an emailed link, where available.",
            "You must be at least 14 years old.",
            "One account per person. Don't share your account or create extra accounts.",
            "We may suspend or close accounts that break these terms.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Voting fairly">
        <p>
          Vote based on your own experience. One vote per person per comparison. Don&apos;t vote, or ask others to vote,
          in exchange for money, products or other rewards, and don&apos;t use automated tools. We may remove votes we
          believe are not genuine.
        </p>
        <p>
          <strong className="text-gray-800">Connections must be disclosed.</strong> If you work for, are paid by, or
          receive free products from a brand or retailer in a comparison, say so in any evidence you submit, and
          don&apos;t vote on that comparison. Undisclosed endorsements can be deceptive marketing under Canada&apos;s{" "}
          <em>Competition Act</em>.
        </p>
      </LegalSection>

      <LegalSection title="Your contributions">
        <p>
          You keep ownership of what you submit. By submitting a comparison or evidence, you give GenericOrNot a
          non-exclusive, worldwide, royalty-free licence to host, display, adapt (for example, fix formatting) and
          distribute it as part of the site. You confirm that it is accurate to the best of your knowledge, reflects
          your genuine experience, and that you have the right to share it.
        </p>
        <p>
          Every new comparison and piece of evidence is reviewed before it is published. We may decline, edit for
          clarity, or remove content at our discretion — including content that was previously approved.
        </p>
      </LegalSection>

      <LegalSection title="Don't post">
        <LegalList
          items={[
            "False or misleading claims, or statements about a company or person you can't back up",
            "Advertising, spam, affiliate or referral links",
            "Anyone's personal information, including your own contact details",
            "Harassment, hate, or content that's illegal in Canada",
            "Content you don't have the right to share, such as copied articles or photos",
          ]}
        />
        <p>
          Also don&apos;t scrape the site, overload it, or try to get around rate limits or moderation.
        </p>
      </LegalSection>

      <LegalSection title="Reporting problems">
        <p>
          Use &ldquo;Report outdated info&rdquo; on any comparison, or email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>{CONTACT_EMAIL}</a>. Brands and rights holders can
          use the same address to raise concerns about specific content; we review every request.
        </p>
      </LegalSection>

      <LegalSection title="Trademarks">
        <p>
          Product and brand names, logos and trademarks belong to their owners and are used only to identify the
          products being compared. GenericOrNot is independent and not affiliated with, sponsored by or endorsed by any
          retailer or brand.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer and limitation of liability">
        <p>
          The site is provided &ldquo;as is&rdquo;. To the extent permitted by law, GenericOrNot and its operators are
          not liable for indirect, incidental or consequential losses arising from your use of the site or reliance on
          its content. Nothing in these terms limits rights you have under consumer protection laws that cannot be
          waived, including in Quebec.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These terms are governed by the laws of the Province of Ontario and the federal laws of Canada that apply
          there, without limiting any mandatory protections of the province where you live.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms. We&apos;ll post the new version here with a new date; continuing to use the site
          after a change means you accept it.
        </p>
      </LegalSection>

      <div className="gradient-divider" />
      <p className="text-gray-500 text-xs">
        Questions about these terms? <Link href="/contact" className={linkClass}>Contact us</Link>. See also our{" "}
        <Link href="/privacy" className={linkClass}>Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
