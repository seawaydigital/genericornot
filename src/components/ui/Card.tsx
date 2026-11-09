import { ReactNode } from "react";
import Link from "next/link";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  /** Accessible label when the whole card is a link. */
  ariaLabel?: string;
}

export function Card({ children, className = "", onClick, href, ariaLabel }: CardProps) {
  const isInteractive = !!(onClick || href);
  const baseClasses = `glass rounded-2xl ${
    isInteractive ? "glass-hover card-interactive cursor-pointer" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div
        className={baseClasses}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}
