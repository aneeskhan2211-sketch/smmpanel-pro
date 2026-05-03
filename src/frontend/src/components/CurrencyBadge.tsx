import { cn } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currencyStore";

interface CurrencyBadgeProps {
  amountINR: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  showFlag?: boolean;
}

export function CurrencyBadge({
  amountINR,
  className,
  size = "md",
  showFlag = false,
}: CurrencyBadgeProps) {
  const { formatAmount, selectedCurrency } = useCurrencyStore();

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary font-semibold border border-primary/20",
        sizeClasses[size],
        className,
      )}
    >
      {showFlag && (
        <span className="text-base leading-none">{selectedCurrency.flag}</span>
      )}
      {formatAmount(amountINR)}
    </span>
  );
}
