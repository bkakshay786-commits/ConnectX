import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
  count?: number | string;
  showIndicator?: boolean;
}

export function FilterChip({
  active = false,
  icon,
  count,
  showIndicator,
  children,
  className,
  ...props
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 h-8 px-3.5 rounded-full font-display text-xs font-semibold select-none transition-all flex items-center gap-1.5 active:scale-95 outline-none focus-visible:ring-1 focus-visible:ring-primary",
        active
          ? "bg-gradient-to-r from-primary-fill to-secondary-fill text-white shadow-[0_0_12px_rgba(124,58,237,0.35)]"
          : "bg-surface-container hover:bg-surface-container-high text-cx-muted hover:text-cx-text border border-hairline/40",
        className,
      )}
      {...props}
    >
      {showIndicator && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            active ? "bg-white animate-pulse" : "bg-cx-subtle",
          )}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {count !== undefined && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
            active ? "bg-white/20 text-white" : "bg-surface-container-high text-cx-subtle",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
