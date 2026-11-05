"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const NAV_LINKS = [
  { label: "Best Swaps", href: "/top-rated" },
  { label: "Categories", href: "/categories" },
  { label: "New", href: "/new" },
  { label: "About", href: "/about" },
  { label: "Contribute", href: "/submit" },
];

export function Navbar() {
  const pathname = usePathname();
  // Menus remember the page they were opened on, so they close automatically
  // when the route changes — no effect (and no extra render) needed.
  const [mobileOpenOn, setMobileOpenOn] = useState<string | null>(null);
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const mobileOpen = mobileOpenOn !== null && mobileOpenOn === pathname;
  const menuOpen = menuOpenOn !== null && menuOpenOn === pathname;
  const setMobileOpen = (open: boolean | ((prev: boolean) => boolean)) =>
    setMobileOpenOn((typeof open === "function" ? open(mobileOpen) : open) ? pathname : null);
  const setMenuOpen = (open: boolean | ((prev: boolean) => boolean)) =>
    setMenuOpenOn((typeof open === "function" ? open(menuOpen) : open) ? pathname : null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user = session?.user;
  const signInHref =
    pathname && pathname !== "/" && !pathname.startsWith("/auth")
      ? `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`
      : "/auth/signin";

  // Close the account menu on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpenOn(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpenOn(null);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const displayName = user?.username ?? user?.name ?? "Account";

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60" aria-label="Main">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo + desktop nav links */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-semibold text-[#0d1b4a] tracking-tight">
              Generic<span className="font-[var(--font-instrument)] italic text-[#0d1b4a]"> Or </span>Not
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`text-[13px] font-medium tracking-wide transition-colors hover:text-gray-900 ${
                    pathname === link.href ? "text-gray-900" : "text-gray-500"
                  }`}
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
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition-all duration-200 hover:border-gray-300"
                >
                  <span className="h-5 w-5 rounded-full bg-[#0d1b4a]/10 text-[#0d1b4a] flex items-center justify-center text-[10px] font-bold" aria-hidden="true">
                    {displayName[0]?.toUpperCase()}
                  </span>
                  <span className="max-w-[10rem] truncate">{displayName}</span>
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-gray-200 py-1 shadow-lg">
                    {user.username && (
                      <Link role="menuitem" href={`/user/${user.username}`} className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        My profile
                      </Link>
                    )}
                    {user.role === "ADMIN" && (
                      <Link role="menuitem" href="/admin" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      type="button"
                      onClick={() => signOut()}
                      className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={signInHref}
                className="rounded-xl bg-[#0d1b4a] px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#162d6b]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
            <Link href="/search" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              Search
            </Link>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.username && (
                  <Link href={`/user/${user.username}`} className="text-sm text-gray-600 hover:text-gray-900">
                    My profile ({user.username})
                  </Link>
                )}
                {user.role === "ADMIN" && (
                  <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                    Admin dashboard
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href={signInHref}
                className="rounded-xl bg-[#0d1b4a] px-4 py-2 text-center text-sm font-medium text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
