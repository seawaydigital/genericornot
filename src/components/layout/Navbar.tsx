"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const navLinks = [
    { label: "Categories", href: "/categories" },
    { label: "Top Rated", href: "/top-rated" },
    { label: "New", href: "/new" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo + desktop nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-gray-100">
              Generic<span className="text-emerald-400">Or</span>Not
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-100"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: Submit + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/submit"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Submit
            </Link>

            {session?.user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 transition-colors hover:bg-gray-700">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      {(session.user.name ?? "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span>{session.user.name}</span>
                </button>
                <div className="absolute right-0 mt-1 hidden group-hover:block w-40 rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-lg">
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2 text-left text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-gray-700"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-gray-100"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-950 px-4 py-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gray-400 transition-colors hover:text-gray-100"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/submit"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-emerald-500 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Submit
            </Link>
            {session?.user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-gray-700"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => { signIn("google"); setMobileOpen(false); }}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-gray-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
