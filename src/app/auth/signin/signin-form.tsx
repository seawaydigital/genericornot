"use client";

import { useState, type ReactNode } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { CircleAlert, Mail, MailCheck, ShieldCheck, UserRound, Vote } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { inputClass, labelClass } from "@/components/ui/form";

type Props = {
  /**
   * IDs of providers registered in `authOptions`. Known OAuth IDs:
   * "google", "facebook", "apple", "github", "twitter", "azure-ad", etc.
   * Special: "email" for the magic link provider.
   *
   * Each OAuth button is rendered only if its id is present here, so adding
   * a new provider in `src/lib/auth.ts` is enough to make its button appear.
   */
  availableProviders: string[];
  /** Same-site path to return to after sign-in (already validated). */
  callbackUrl?: string;
  errorMessage?: string | null;
};

const lightButton =
  "border border-line bg-surface text-ink shadow-sm hover:border-line-strong hover:bg-surface-2";

// OAuth buttons, in display order. Add new providers here after registering
// them in src/lib/auth.ts.
const OAUTH_PROVIDERS: { id: string; label: string; className: string; icon: ReactNode }[] = [
  {
    id: "google",
    label: "Continue with Google",
    className: lightButton,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    id: "azure-ad",
    label: "Continue with Microsoft",
    className: lightButton,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden="true">
        <path fill="#f3f3f3" d="M0 0h23v23H0z" />
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
    ),
  },
  {
    id: "apple",
    label: "Continue with Apple",
    className: "bg-black text-white shadow-sm hover:bg-gray-900",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Continue with Facebook",
    className: "bg-[#1877f2] text-white shadow-sm hover:bg-[#166fe5]",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
      </svg>
    ),
  },
  {
    id: "github",
    label: "Continue with GitHub",
    className: "bg-gray-900 text-white shadow-sm hover:bg-gray-800",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.2.9 2.3v3.3c0 .3.2.7.8.6A12 12 0 0012 .3" />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "Continue with X",
    className: "bg-black text-white shadow-sm hover:bg-gray-900",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const PROMISES = [
  { Icon: Vote, text: "One vote per person, per comparison — change it any time." },
  { Icon: UserRound, text: "Your public profile shows a nickname, never your real name or email." },
  { Icon: ShieldCheck, text: "No ads in verdicts. Brands can't pay to change a result." },
];

export function SignInForm({ availableProviders, callbackUrl = "/", errorMessage = null }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const has = (id: string) => availableProviders.includes(id);
  const emailEnabled = has("email");
  const oauth = OAUTH_PROVIDERS.filter((p) => has(p.id));
  const hasAnyOAuth = oauth.length > 0;

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    const result = await signIn("email", { email: email.trim(), redirect: false, callbackUrl });
    setIsLoading(false);
    if (result?.error) {
      setEmailError("We couldn't send the sign-in email. Please try again in a minute.");
      return;
    }
    setEmailSent(true);
  }

  return (
    <div className="bg-hero">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 md:py-16 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16 lg:px-8">
        {/* Why sign in — desktop only; the card repeats the essentials. */}
        <div className="hidden lg:block">
          <p className="eyebrow">Join in</p>
          <p className="mt-3 font-display text-6xl leading-[0.98] tracking-tight text-ink text-balance">
            Your vote helps the <em className="italic text-brand-500">next shopper</em> decide.
          </p>
          <ul className="mt-10 space-y-4">
            {PROMISES.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3.5 text-base leading-relaxed text-muted">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-brand-500 shadow-card ring-1 ring-line">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card mx-auto w-full max-w-md p-6 shadow-lift sm:p-8">
          {emailSent ? (
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-good-bg text-good ring-1 ring-good-line">
                <MailCheck aria-hidden="true" className="h-7 w-7" />
              </span>
              <h1 className="mt-5 font-display text-4xl leading-none tracking-tight text-ink">Check your email</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                We sent a sign-in link to <strong className="font-semibold text-ink">{email}</strong>. Click the link in
                the email to sign in.
              </p>
              <p className="mt-6 text-sm text-muted">
                Didn&apos;t get it? Check your spam folder, or{" "}
                <button
                  type="button"
                  onClick={() => setEmailSent(false)}
                  className="font-semibold text-brand-500 underline-offset-2 hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="text-center">
                <Link href="/" aria-label="GenericOrNot home" className="inline-flex rounded-xl">
                  <Logo />
                </Link>
                <h1 className="mt-6 font-display text-4xl leading-none tracking-tight text-ink">Sign in to your account</h1>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">
                  Vote on comparisons, submit products, and contribute evidence. Your public profile shows a nickname,
                  never your real name.
                </p>
              </div>

              {(errorMessage || emailError) && (
                <div
                  role="alert"
                  className="mt-6 flex gap-2.5 rounded-xl border border-bad-line bg-bad-bg px-4 py-3 text-sm font-medium text-bad"
                >
                  <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                  {emailError ?? errorMessage}
                </div>
              )}

              {!hasAnyOAuth && !emailEnabled && (
                <div className="mt-6 rounded-xl border border-close-line bg-close-bg px-4 py-3 text-sm text-ink">
                  Sign-in is temporarily unavailable. Please check back soon.
                </div>
              )}

              {hasAnyOAuth && (
                <div className="mt-7 space-y-3">
                  {oauth.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => signIn(p.id, { callbackUrl })}
                      className={`flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-4 text-[15px] font-semibold transition-colors ${p.className}`}
                    >
                      {p.icon}
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Email magic link — last, as a fallback */}
              {emailEnabled && (
                <>
                  {hasAnyOAuth && (
                    <div className="my-6 flex items-center gap-4" aria-hidden="true">
                      <div className="h-px flex-1 bg-line" />
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">or</span>
                      <div className="h-px flex-1 bg-line" />
                    </div>
                  )}

                  <form onSubmit={handleEmailSignIn} className={`space-y-4 ${hasAnyOAuth ? "" : "mt-7"}`}>
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !email.trim()}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Mail aria-hidden="true" className="h-4 w-4" />
                      {isLoading ? "Sending link..." : "Send magic link"}
                    </button>
                  </form>
                </>
              )}

              <p className="mt-7 text-center text-xs leading-relaxed text-subtle">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="font-medium text-brand-500 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-brand-500 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
