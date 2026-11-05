import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { safeCallbackPath } from "@/lib/site";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign in — GenericOrNot",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method. Try the one you used before.",
  EmailSignin: "We couldn't send the sign-in email. Please try again in a minute.",
  Verification: "That sign-in link has expired or was already used. Request a new one below.",
  Callback: "Sign-in was cancelled or failed. Please try again.",
  OAuthCallback: "Sign-in was cancelled or failed. Please try again.",
  Default: "Something went wrong signing you in. Please try again.",
};

export default async function SignInPage({ searchParams }: PageProps) {
  const { callbackUrl, error } = await searchParams;
  const availableProviders = (authOptions.providers ?? []).map((p) => p.id);
  return (
    <SignInForm
      availableProviders={availableProviders}
      callbackUrl={safeCallbackPath(callbackUrl)}
      errorMessage={error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default : null}
    />
  );
}
