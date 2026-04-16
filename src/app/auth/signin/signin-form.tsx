"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

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
};

export function SignInForm({ availableProviders }: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const has = (id: string) => availableProviders.includes(id);
  const emailEnabled = has("email");
  const hasAnyOAuth =
    has("google") ||
    has("facebook") ||
    has("azure-ad") ||
    has("apple") ||
    has("github") ||
    has("twitter");

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    await signIn("email", { email: email.trim(), redirect: false });
    setEmailSent(true);
    setIsLoading(false);
  }

  if (emailSent) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="text-4xl">&#9993;</div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Check your email</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            We sent a sign-in link to <strong className="text-gray-700">{email}</strong>.
            Click the link in the email to sign in.
          </p>
          <p className="text-gray-400 text-xs">
            Didn&apos;t get it? Check your spam folder, or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-[#0d1b4a] hover:underline font-medium"
            >
              try again
            </button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold text-[#0d1b4a] tracking-tight">
            Generic<span className="font-[var(--font-instrument)] italic"> Or </span>Not
          </Link>
          <h1 className="mt-6 text-xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Vote on comparisons, submit products, and contribute evidence.
          </p>
        </div>

        {/* If no auth is configured at all, surface a helpful message */}
        {!hasAnyOAuth && !emailEnabled && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Sign-in is temporarily unavailable. Please check back soon.
          </div>
        )}

        {/* OAuth providers — add new blocks here when registering more providers in src/lib/auth.ts */}
        <div className="space-y-3">
          {has("google") && (
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          )}

          {has("azure-ad") && (
            <button
              onClick={() => signIn("azure-ad", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:border-gray-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 23 23" aria-hidden="true">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              Continue with Microsoft
            </button>
          )}

          {has("apple") && (
            <button
              onClick={() => signIn("apple", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-900"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          )}

          {has("facebook") && (
            <button
              onClick={() => signIn("facebook", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#1877f2] px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#166fe5]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
              </svg>
              Continue with Facebook
            </button>
          )}

          {has("github") && (
            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.2.9 2.3v3.3c0 .3.2.7.8.6A12 12 0 0012 .3"/>
              </svg>
              Continue with GitHub
            </button>
          )}

          {has("twitter") && (
            <button
              onClick={() => signIn("twitter", { callbackUrl: "/" })}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-900"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Continue with X
            </button>
          )}
        </div>

        {/* Email Magic Link — rendered last as a fallback */}
        {emailEnabled && (
          <>
            {hasAnyOAuth && (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#0d1b4a]/30 focus:ring-2 focus:ring-[#0d1b4a]/10 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full rounded-xl bg-gradient-to-b from-[#0d1b4a] to-[#162d6b] px-4 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending link..." : "Send magic link"}
              </button>
            </form>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-[#0d1b4a] hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="text-[#0d1b4a] hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
