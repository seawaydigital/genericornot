"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();

  const navLinks = [
    { label: "Explore", href: "/categories" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contribute", href: "/submit" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo + desktop nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-[#0d1b4a] tracking-tight">
              Generic<span className="font-[var(--font-instrument)] italic text-[#0d1b4a]"> Or </span>Not
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="text-[13px] font-medium text-gray-500 tracking-wide transition-colors hover:text-gray-900"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side: Search + Auth */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </Link>

            {session?.user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-all duration-200 hover:border-gray-300">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-[#0d1b4a]/10 text-[#0d1b4a] flex items-center justify-center text-[10px] font-bold">
                      {(session.user.name ?? "U")[0].toUpperCase()}
                    </div>
                  )}
                  <span>{session.user.name}</span>
                </button>
                <div className="absolute right-0 mt-1 hidden group-hover:block w-40 rounded-xl bg-white border border-gray-200 py-1 shadow-lg">
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="rounded-xl bg-[#0d1b4a] px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#162d6b]"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-gray-700 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
            {session?.user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => { signIn("google"); setMobileOpen(false); }}
                className="rounded-xl bg-[#0d1b4a] px-4 py-2 text-sm font-medium text-white"
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
