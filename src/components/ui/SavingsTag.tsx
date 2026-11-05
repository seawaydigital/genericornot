interface SavingsTagProps {
  percent: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Optional suffix, e.g. "per unit". */
  suffix?: string;
}

const sizes = {
  sm: "text-xs py-0.5 pr-2",
  md: "text-sm py-1 pr-2.5",
  lg: "text-lg py-1.5 pr-3.5",
};

/** Yellow shelf-style price tag for the savings figure. */
export function SavingsTag({ percent, size = "md", className = "", suffix }: SavingsTagProps) {
  return (
    <span className={`sale-tag tabular-nums ${sizes[size]} ${className}`}>
      Save {percent}%{suffix ? <span className="ml-1 font-semibold opacity-80">{suffix}</span> : null}
    </span>
  );
}
