import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Clock, Inbox, MailCheck, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Check your email — GenericOrNot",
};

const TIPS = [
  { Icon: Clock, text: "The link expires in 24 hours and works once." },
  { Icon: Inbox, text: "Not there? Check your spam or junk folder." },
  { Icon: ShieldCheck, text: "We never ask for a password — the link is all you need." },
];

export default function VerifyRequestPage() {
  return (
    <div className="bg-hero">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md items-center px-4 py-12">
        <div className="card w-full p-6 text-center shadow-lift sm:p-8">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-good-bg text-good ring-1 ring-good-line">
            <MailCheck aria-hidden="true" className="h-7 w-7" />
          </span>
          <h1 className="mt-5 font-display text-4xl leading-none tracking-tight text-ink">Check your email</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            A sign-in link has been sent to your email address. Click the link to complete sign in.
          </p>
          <ul className="mt-6 space-y-3 rounded-2xl border border-line bg-surface-2 p-4 text-left">
            {TIPS.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                {text}
              </li>
            ))}
          </ul>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-brand-500 transition-colors hover:bg-brand-50"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
