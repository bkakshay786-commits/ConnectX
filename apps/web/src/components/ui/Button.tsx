/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-display font-medium select-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-gradient-to-r from-primary-fill to-secondary-fill text-white shadow-[0_0_16px_rgba(124,58,237,0.35)] hover:shadow-[0_0_22px_rgba(124,58,237,0.55)] hover:brightness-110",
        secondary:
          "rounded-full bg-surface-container hover:bg-surface-container-high text-cx-text border border-hairline/50 hover:border-primary/50 shadow-sm",
        ghost:
          "rounded-full bg-transparent hover:bg-surface-container-high/60 text-cx-muted hover:text-cx-text",
        destructive:
          "rounded-full bg-error-fill text-white hover:bg-error-fill/90 shadow-[0_0_14px_rgba(147,0,10,0.4)]",
        icon:
          "rounded-full bg-surface-container hover:bg-surface-container-high text-cx-muted hover:text-cx-text border border-hairline/40 hover:border-primary/40 p-0",
        floating:
          "rounded-full bg-gradient-to-tr from-primary-fill via-[#6366f1] to-secondary-fill text-white shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:scale-105 active:scale-95",
        link:
          "text-primary hover:text-primary-fill underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs gap-1.5 min-h-[32px]",
        md: "h-10 px-4 text-sm gap-2 min-h-[40px]",
        lg: "h-12 px-6 text-base gap-2.5 min-h-[48px]",
        iconSm: "h-8 w-8 min-h-[32px] min-w-[32px]",
        iconMd: "h-10 w-10 min-h-[40px] min-w-[40px]",
        iconLg: "h-12 w-12 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
