import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  children?: ReactNode;
  /** Buttons or links that get the shopper moving again. */
  actions?: ReactNode;
  className?: string;
}

/** A friendly dead end: what happened and where to go next. */
export function EmptyState({ Icon, title, children, actions, className = "" }: EmptyStateProps) {
  return (
    <div className={`rounded-[1.5rem] border border-dashed border-line-strong bg-surface-2 px-6 py-14 text-center ${className}`}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-surface text-brand-500 shadow-card ring-1 ring-line">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="mt-5 font-display text-3xl leading-tight tracking-tight text-ink">{title}</h2>
      {children && <div className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-muted">{children}</div>}
      {actions && <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}
