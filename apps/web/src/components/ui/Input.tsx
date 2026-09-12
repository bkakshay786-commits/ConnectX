import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPill?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, isPill = false, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-cx-subtle">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "w-full h-11 bg-surface-container-high/80 text-cx-text placeholder:text-cx-subtle font-body text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-highest",
            isPill ? "rounded-full" : "rounded-input border border-hairline/40",
            leftIcon ? "pl-11" : "pl-4",
            rightIcon ? "pr-11" : "pr-4",
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 flex items-center justify-center text-cx-subtle">
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "w-full min-h-[100px] p-3.5 bg-surface-container-high/80 text-cx-text placeholder:text-cx-subtle font-body text-sm rounded-input border border-hairline/40 transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-highest resize-y",
            error && "border-error-fill focus:ring-error",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error font-body">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
