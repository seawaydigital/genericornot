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
  const baseClasses = `bg-gray-900 border border-gray-800 rounded-xl ${
    isInteractive ? "hover:border-gray-700 cursor-pointer transition-colors" : ""
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
