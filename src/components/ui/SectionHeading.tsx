import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
  as?: "h1" | "h2";
  className?: string;
}

/** Consistent section header: eyebrow, serif title, optional blurb and link. */
export function SectionHeading({ id, eyebrow, title, description, action, as = "h2", className = "" }: SectionHeadingProps) {
  const Heading = as;
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <Heading
          id={id}
          className={`font-display text-ink tracking-tight text-balance ${
            as === "h1" ? "text-4xl sm:text-5xl leading-[1.05]" : "text-3xl sm:text-[2.5rem] leading-[1.08]"
          }`}
        >
          {title}
        </Heading>
        {description && <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group -my-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-brand-500 hover:text-brand sm:self-auto"
        >
          {action.label}
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
