"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Plus, Search, User, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Best Swaps", href: "/top-rated" },
  { label: "Categories", href: "/categories" },
  { label: "New", href: "/new" },
  { label: "About", href: "/about" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  // Menus remember the page they were opened on, so they close automatically
  // when the route changes — no effect (and no extra render) needed.
  const [mobileOpenOn, setMobileOpenOn] = useState<string | null>(null);
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const mobileOpen = mobileOpenOn !== null && mobileOpenOn === pathname;
  const menuOpen = menuOpenOn !== null && menuOpenOn === pathname;
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const user = session?.user;
  const signInHref =
    pathname && pathname !== "/" && !pathname.startsWith("/auth")
      ? `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`
      : "/auth/signin";
  // The homepage and search page have their own big search box.
  const showHeaderSearch = pathname !== "/" && pathname !== "/search";

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
    <header className="sticky top-0 z-50 border-b border-line/80 bg-paper/85 backdrop-blur-lg">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 rounded-xl" aria-label="GenericOrNot home">
          <Logo />
        </Link>

        <div className="ml-6 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "text-ink" : "text-muted hover:bg-paper-deep hover:text-ink"
                }`}
              >
                {link.label}
                {active && <span aria-hidden="true" className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand" />}
              </Link>
            );
          })}
        </div>

        <div className="flex-1" />

        {showHeaderSearch && (
          <form role="search" action="/search" method="get" className="relative hidden w-52 lg:block xl:w-64">
            <label htmlFor="header-search" className="sr-only">
              Search products and brands
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="header-search"
              name="q"
              type="search"
              maxLength={100}
              placeholder="Search Advil, butter…"
              className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-subtle shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15"
            />
          </form>
        )}

        <Link
          href="/submit"
          aria-label="Add a comparison"
          className="hidden h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-surface px-3.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-line-strong md:inline-flex"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          <span className="xl:hidden">Add</span>
          <span className="hidden xl:inline">Add a comparison</span>
        </Link>

        <div className="hidden md:block">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpenOn(menuOpen ? null : pathname)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label={`Account menu for ${displayName}`}
                className="flex h-10 items-center gap-2 rounded-xl border border-line bg-surface pl-1.5 pr-2.5 text-sm font-medium text-ink shadow-sm transition-colors hover:border-line-strong"
              >
                <span aria-hidden="true" className="grid h-7 w-7 place-items-center rounded-lg bg-brand text-xs font-bold text-white">
                  {displayName[0]?.toUpperCase()}
                </span>
                <span className="hidden max-w-[8rem] truncate xl:inline">{displayName}</span>
                <ChevronDown aria-hidden="true" className={`h-4 w-4 text-subtle transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
                  {user.username && (
                    <Link role="menuitem" href={`/user/${user.username}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-paper">
                      <User aria-hidden="true" className="h-4 w-4 text-muted" />
                      My profile
                    </Link>
                  )}
                  {user.role === "ADMIN" && (
                    <Link role="menuitem" href="/admin" className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink hover:bg-paper">
                      <LayoutDashboard aria-hidden="true" className="h-4 w-4 text-muted" />
                      Admin dashboard
                    </Link>
                  )}
                  <div className="my-1 h-px bg-line" />
                  <button
                    role="menuitem"
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink hover:bg-paper"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4 text-muted" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={signInHref}
              className="inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 md:hidden">
          <Link href="/search" aria-label="Search" className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-paper-deep">
            <Search aria-hidden="true" className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl text-ink hover:bg-paper-deep"
            onClick={() => setMobileOpenOn(mobileOpen ? null : pathname)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-line bg-paper px-4 pb-6 pt-3 shadow-lift md:hidden">
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(pathname, link.href) ? "page" : undefined}
                className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink hover:bg-paper-deep"
              >
                {link.label}
              </Link>
            ))}
            {user?.username && (
              <Link href={`/user/${user.username}`} className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink hover:bg-paper-deep">
                My profile <span className="ml-2 text-sm text-subtle">({user.username})</span>
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-ink hover:bg-paper-deep">
                Admin dashboard
              </Link>
            )}
          </div>
          <div className="mt-4 grid gap-2">
            <Link
              href="/submit"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-base font-semibold text-ink"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add a comparison
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="flex min-h-12 items-center justify-center rounded-xl text-base font-medium text-muted hover:text-ink"
              >
                Sign Out
              </button>
            ) : (
              <Link href={signInHref} className="flex min-h-12 items-center justify-center rounded-xl bg-brand text-base font-semibold text-white">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
