import type { Metadata } from "next";
import Link from "next/link";
import { LegalList, LegalPage, LegalSection } from "@/components/ui/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — GenericOrNot",
  description: "What personal information GenericOrNot collects, why, where it's stored, and your rights under Canadian privacy law.",
  alternates: { canonical: "/privacy" },
};

const linkClass = "text-[#0d1b4a] hover:text-[#1e3a7a] underline-offset-2 hover:underline";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 5, 2026"
      intro={
        <>
          <p>
            GenericOrNot is a community website where Canadians compare store-brand and name-brand products. This policy
            explains what personal information we collect, why we collect it, and the choices you have. We handle
            personal information in line with Canada&apos;s <em>Personal Information Protection and Electronic Documents
            Act</em> (PIPEDA) and, for residents of Quebec, the <em>Act respecting the protection of personal information
            in the private sector</em>.
          </p>
          <p>
            The short version: you can browse without an account. If you sign in, we keep the minimum we need to run
            your account, we show a random nickname instead of your name, and we never sell your information.
          </p>
        </>
      }
    >
      <LegalSection title="Who is responsible">
        <p>
          Our Privacy Officer is responsible for how GenericOrNot handles personal information and answers privacy
          questions and requests. Contact: <a href={`mailto:${CONTACT_EMAIL}?subject=Privacy`} className={linkClass}>{CONTACT_EMAIL}</a>{" "}
          (subject line &ldquo;Privacy&rdquo;).
        </p>
      </LegalSection>

      <LegalSection title="What we collect">
        <LegalList
          items={[
            <>
              <strong className="text-gray-800">When you sign in.</strong> If you use Google, Facebook or Microsoft, they
              send us your name, email address and profile photo. If you use an emailed sign-in link, we receive only
              your email address. We use this to create and secure your account.
            </>,
            <>
              <strong className="text-gray-800">Your public nickname.</strong> We give every account a random nickname
              (for example, &ldquo;thrifty-loon-4821&rdquo;). That nickname — not your real name — appears on your
              profile and contributions.
            </>,
            <>
              <strong className="text-gray-800">Your contributions.</strong> Votes, comparisons, evidence and
              &ldquo;outdated&rdquo; reports you submit, with the date and time.
            </>,
            <>
              <strong className="text-gray-800">Technical information.</strong> Our hosting provider processes IP
              addresses and basic request details (browser type, pages requested) to deliver the site and protect it
              from abuse. We use Vercel Web Analytics, which counts page views in aggregate without cookies and without
              building a profile of you.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="What other people can see">
        <p>
          Your nickname, the month you joined, your approved comparisons and evidence, and the number of votes you have
          cast. Your individual votes are not shown publicly — only the totals. Your real name, email address and photo
          are never shown publicly.
        </p>
      </LegalSection>

      <LegalSection title="Why we use it">
        <LegalList
          items={[
            "To run your account and let you vote, submit comparisons and add evidence",
            "To calculate community verdicts from aggregated votes",
            "To review submissions and to prevent spam, duplicate accounts and vote manipulation",
            "To contact you about your account or a submission — we don't send marketing email",
          ]}
        />
        <p>We do not sell or rent personal information, and we do not use it for advertising.</p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We only use cookies that are strictly necessary to sign you in and keep you signed in securely. We don&apos;t
          use advertising cookies or cross-site tracking. If you&apos;re signed out you can use the site without them.
        </p>
      </LegalSection>

      <LegalSection title="Service providers and where your data is stored">
        <p>We rely on these providers to run GenericOrNot:</p>
        <LegalList
          items={[
            <><strong className="text-gray-800">Vercel</strong> — website hosting and aggregate analytics (United States)</>,
            <><strong className="text-gray-800">Neon</strong> — database hosting (United States)</>,
            <><strong className="text-gray-800">Google, Meta (Facebook) and Microsoft</strong> — sign-in, only if you choose them</>,
            <><strong className="text-gray-800">Resend</strong> — delivers sign-in emails, if you use email sign-in</>,
            <>
              <strong className="text-gray-800">logo.dev</strong> — brand logos load directly from logo.dev, which
              receives your IP address and browser details as it would for any image
            </>,
          ]}
        />
        <p>
          Your information is stored and processed outside Canada, mainly in the United States, where it may be
          accessible to courts and government authorities under local law. We choose providers that protect personal
          information under contract and give them only what they need to provide their service.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>
          We keep your account information while your account is open. If you ask us to delete your account, we delete
          your account, sign-in records, votes and personal details within 30 days. Approved comparisons you submitted
          may remain on the site, with no link to you. Our hosting provider keeps short-lived server logs for security.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          You can ask to access the personal information we hold about you, correct it, or delete your account. You can
          withdraw your consent at any time by deleting your account. Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Privacy`} className={linkClass}>{CONTACT_EMAIL}</a>; we respond
          within 30 days.
        </p>
        <p>
          If you&apos;re not satisfied with our response, you can complain to the{" "}
          <a href="https://www.priv.gc.ca/" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Office of the Privacy Commissioner of Canada
          </a>{" "}
          or, in Quebec, the{" "}
          <a href="https://www.cai.gouv.qc.ca/" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Commission d&apos;accès à l&apos;information
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Age">
        <p>You must be at least 14 years old to create an account.</p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          All connections use HTTPS, database access is restricted, and we collect as little as we can. If a breach of
          security creates a real risk of significant harm to you, we will notify you and the Privacy Commissioner as
          the law requires.
        </p>
      </LegalSection>

      <LegalSection title="Changes to this policy">
        <p>
          We&apos;ll post any changes here with a new date. If a change is significant, we&apos;ll also tell signed-in
          users on the site before it takes effect.
        </p>
      </LegalSection>

      <div className="gradient-divider" />
      <p className="text-gray-500 text-xs">
        Questions about this policy? <Link href="/contact" className={linkClass}>Contact us</Link>.
      </p>
    </LegalPage>
  );
}
