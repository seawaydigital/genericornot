import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "neutral" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-good-bg text-good ring-good-line",
  warning: "bg-close-bg text-close ring-close-line",
  danger: "bg-bad-bg text-bad ring-bad-line",
  neutral: "bg-neutral-bg text-neutral ring-neutral-line",
  info: "bg-brand-50 text-brand ring-brand-100",
};

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
