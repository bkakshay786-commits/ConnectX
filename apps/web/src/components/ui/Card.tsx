import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "elevated" | "sheet";
  hoverable?: boolean;
}

export function Card({
  variant = "default",
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default: "bg-surface-container rounded-card border border-white/5 shadow-md",
    glass:
      "bg-surface-container/75 backdrop-blur-xl rounded-card border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
    elevated:
      "bg-surface-container-high rounded-card border border-white/8 shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
    sheet:
      "bg-surface-container-low/95 backdrop-blur-2xl rounded-t-[28px] border-t border-white/10 shadow-[0_-12px_48px_rgba(0,0,0,0.85)]",
  };

  return (
    <div
      className={cn(
        variantStyles[variant],
        hoverable &&
          "transition-all duration-300 hover:border-primary/40 hover:shadow-[0_12px_36px_rgba(0,0,0,0.5)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassCard(props: CardProps) {
  return <Card variant="glass" {...props} />;
}
