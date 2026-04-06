interface ProductIconProps {
  icon?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12 text-2xl",
  md: "w-20 h-20 text-4xl",
  lg: "w-[120px] h-[120px] text-5xl",
};

export function ProductIcon({ icon = "📦", size = "md", className = "" }: ProductIconProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-gray-800/50 border border-gray-700/50 ${sizeClasses[size]} ${className}`}
    >
      <span role="img">{icon}</span>
    </div>
  );
}
