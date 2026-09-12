/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import type { PresenceStatus } from "@/types/domain";

export const badgeVariants = cva(
  "inline-flex items-center font-display font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-surface-container-high text-cx-text border border-hairline/40",
        primary: "bg-primary-fill/20 text-primary border border-primary/30",
        secondary: "bg-secondary-fill/20 text-secondary border border-secondary/30",
        tertiary: "bg-tertiary-fill/20 text-tertiary border border-tertiary/30",
        success: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        destructive: "bg-error-fill/20 text-error border border-error/30",
        outline: "bg-transparent text-cx-muted border border-hairline",
        gradient:
          "bg-gradient-to-r from-primary-fill to-secondary-fill text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]",
      },
      size: {
        sm: "px-1.5 py-0.2 text-[10px] leading-tight rounded-full",
        md: "px-2.5 py-0.5 text-xs rounded-full",
        lg: "px-3 py-1 text-sm rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: "live" | "syncing" | "ready" | "encrypted";
  label?: string;
  className?: string;
}) {
  const configs = {
    live: {
      dotClass: "bg-white animate-ping",
      containerClass: "bg-tertiary-fill text-white shadow-[0_0_10px_rgba(191,32,118,0.4)]",
      defaultLabel: "LIVE",
    },
    syncing: {
      dotClass: "bg-secondary animate-pulse",
      containerClass: "bg-secondary-fill/20 text-secondary border border-secondary/30",
      defaultLabel: "Syncing",
    },
    ready: {
      dotClass: "bg-emerald-400",
      containerClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
      defaultLabel: "Ready",
    },
    encrypted: {
      dotClass: "bg-primary",
      containerClass: "bg-primary-fill/20 text-primary border border-primary/30",
      defaultLabel: "E2EE",
    },
  };

  const current = configs[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-display font-semibold",
        current.containerClass,
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", current.dotClass)} />
      <span>{label || current.defaultLabel}</span>
    </span>
  );
}

export function FileExtensionBadge({
  extension,
  className,
}: {
  extension: string;
  className?: string;
}) {
  const cleanExt = extension.replace(".", "").toUpperCase();

  const colorMap: Record<string, string> = {
    PDF: "bg-error-fill/30 text-error border-error/40",
    DOC: "bg-secondary-fill/30 text-secondary border-secondary/40",
    DOCX: "bg-secondary-fill/30 text-secondary border-secondary/40",
    FIG: "bg-tertiary-fill/30 text-tertiary border-tertiary/40",
    BLEND: "bg-amber-500/30 text-amber-300 border-amber-500/40",
    USDZ: "bg-primary-fill/30 text-primary border-primary/40",
    GLB: "bg-primary-fill/30 text-primary border-primary/40",
    ZIP: "bg-surface-container-highest text-cx-text border-hairline/60",
    TS: "bg-secondary-fill/30 text-secondary border-secondary/40",
    PY: "bg-emerald-500/30 text-emerald-300 border-emerald-500/40",
    MP3: "bg-tertiary-fill/30 text-tertiary border-tertiary/40",
    WAV: "bg-tertiary-fill/30 text-tertiary border-tertiary/40",
  };

  const badgeColor =
    colorMap[cleanExt] || "bg-surface-container-high text-cx-text border-hairline/50";

  return (
    <span
      className={cn(
        "px-1.5 py-0.5 rounded text-[9px] font-display font-bold uppercase tracking-wider border",
        badgeColor,
        className,
      )}
    >
      {cleanExt}
    </span>
  );
}

export function PresenceBadge({
  status = "offline",
  className,
}: {
  status?: PresenceStatus;
  className?: string;
}) {
  const statusStyles: Record<PresenceStatus, string> = {
    online: "bg-secondary shadow-[0_0_8px_#adc6ff]",
    idle: "bg-primary shadow-[0_0_8px_#d2bbff]",
    offline: "bg-cx-subtle",
  };

  return (
    <span
      className={cn(
        "w-3 h-3 rounded-full ring-2 ring-canvas block",
        statusStyles[status],
        className,
      )}
      title={`Status: ${status}`}
    />
  );
}
