import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Shown to the left of the title (e.g. a category tile). */
  icon?: ReactNode;
  /** Shown to the right on wide screens, below on narrow ones. */
  actions?: ReactNode;
  /** An extra row under the title: filters, a search box, tabs. */
  children?: ReactNode;
  /** Centre the title block (search, sign-in style pages). */
  centered?: boolean;
}

/**
 * The top band of every inner page: warm hero wash, eyebrow, serif title and
 * a short description, so each page opens the same way as the homepage.
 */
export function PageHeader({ eyebrow, title, description, icon, actions, children, centered = false }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-hero">
      <div
        aria-hidden="true"
        className="bg-dots absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6 md:pb-12 md:pt-14 lg:px-8">
        <div
          className={
            centered
              ? "mx-auto flex max-w-2xl flex-col items-center text-center"
              : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          }
        >
          <div className={`flex max-w-3xl gap-4 sm:gap-5 ${centered ? "flex-col items-center" : "items-start"}`}>
            {icon}
            <div className="min-w-0">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h1
                className={`font-display text-[2.6rem] leading-[1.02] tracking-tight text-ink text-balance sm:text-5xl md:text-[3.5rem] ${
                  eyebrow ? "mt-2" : ""
                }`}
              >
                {title}
              </h1>
              {description && (
                <div className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</div>
              )}
            </div>
          </div>
          {actions && <div className={`shrink-0 ${centered ? "mt-6" : ""}`}>{actions}</div>}
        </div>
        {children && <div className={centered ? "mx-auto mt-8 max-w-2xl" : "mt-8"}>{children}</div>}
      </div>
    </header>
  );
}
