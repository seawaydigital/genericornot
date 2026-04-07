import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check your email — GenericOrNot",
};

export default function VerifyRequestPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="text-5xl opacity-40">&#9993;</div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Check your email
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          A sign-in link has been sent to your email address. Click the link to complete sign in.
        </p>
        <div className="glass rounded-2xl p-4 text-left space-y-2">
          <p className="text-gray-600 text-xs font-medium">Tips:</p>
          <ul className="text-gray-500 text-xs space-y-1">
            <li>&#8226; The link expires in 24 hours</li>
            <li>&#8226; Check your spam/junk folder</li>
            <li>&#8226; The email comes from noreply@genericornot.com</li>
          </ul>
        </div>
        <Link
          href="/auth/signin"
          className="inline-block text-sm text-[#0d1b4a] hover:text-[#1e3a7a] font-medium transition-colors"
        >
          &larr; Back to sign in
        </Link>
      </div>
    </div>
  );
}
