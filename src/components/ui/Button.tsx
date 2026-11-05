import { ReactNode, ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(11_21_51/0.2)] hover:bg-brand-600 active:bg-brand-700",
  secondary:
    "glass bg-surface text-ink hover:border-line-strong hover:bg-surface-2 active:bg-paper",
  ghost:
    "text-muted hover:text-ink hover:bg-gray-100 active:bg-gray-200",
  danger:
    "bg-surface text-bad ring-1 ring-inset ring-bad-line hover:bg-bad-bg active:bg-bad-bg",
};

// md and lg meet the 44px minimum touch target.
const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm gap-1.5",
  md: "min-h-11 px-4 py-2 text-sm gap-2",
  lg: "min-h-12 px-6 py-3 text-base gap-2",
};

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  children,
  className = "",
  onClick,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <>
          <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
