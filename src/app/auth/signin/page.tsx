import { authOptions } from "@/lib/auth";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  const availableProviders = (authOptions.providers ?? []).map((p) => p.id);
  return <SignInForm availableProviders={availableProviders} />;
}
