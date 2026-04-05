import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <span className="text-lg font-bold text-gray-100">
              Generic<span className="text-emerald-400">Or</span>Not
            </span>
            <p className="text-sm text-gray-500">Community-powered product comparisons</p>
          </div>

          <nav className="flex flex-wrap justify-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-500 transition-colors hover:text-gray-300"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-6 text-center">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} GenericOrNot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
