import { ReactNode } from "react";
import Link from "next/link";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function Card({ children, className = "", onClick, href }: CardProps) {
  const isInteractive = !!(onClick || href);
  const baseClasses = `glass rounded-2xl ${
    isInteractive ? "glass-hover cursor-pointer transition-all duration-200" : ""
  } ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div className={baseClasses} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}
