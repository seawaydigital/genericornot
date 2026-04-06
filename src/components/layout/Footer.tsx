import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: "About Us", href: "/about" },
    { label: "Contribute", href: "/submit" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-1.5 md:items-start">
            <span className="text-lg font-semibold text-[#0d1b4a] tracking-tight">
              Generic<span className="font-[var(--font-instrument)] italic"> Or </span>Not
            </span>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              The editorial truth in consumer advocacy
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-400 uppercase tracking-wider transition-colors hover:text-gray-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-gray-300 uppercase tracking-wider">
            &copy; {currentYear} Generic Or Not. All trademarks belong to their respective owners.
          </p>
          <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">
            Transparency is our only product.
          </p>
        </div>
      </div>
    </footer>
  );
}
