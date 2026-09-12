import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { PresenceBadge } from "@/components/ui/Badge";
import type { PresenceStatus } from "@/types/domain";
import { Plus } from "lucide-react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  presence?: PresenceStatus;
  hasStory?: boolean;
  storySeen?: boolean;
  isAddStory?: boolean;
  fallbackInitials?: string;
}

const sizeConfig = {
  xs: { box: "w-6 h-6", ringP: "p-[1.5px]", text: "text-[10px]" },
  sm: { box: "w-8 h-8", ringP: "p-0.5", text: "text-xs" },
  md: { box: "w-10 h-10", ringP: "p-0.5", text: "text-sm" },
  lg: { box: "w-12 h-12", ringP: "p-[2.5px]", text: "text-base" },
  xl: { box: "w-16 h-16", ringP: "p-[2.5px]", text: "text-lg" },
  "2xl": { box: "w-20 h-20", ringP: "p-1", text: "text-xl" },
};

export function Avatar({
  src,
  alt = "User Avatar",
  size = "md",
  presence,
  hasStory = false,
  storySeen = false,
  isAddStory = false,
  fallbackInitials,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const cfg = sizeConfig[size];

  const defaultAvatar =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  return (
    <div className={cn("relative inline-block shrink-0 select-none", className)} {...props}>
      <div
        className={cn(
          "rounded-full transition-all flex items-center justify-center",
          hasStory &&
            (storySeen
              ? "bg-surface-container-high"
              : "bg-gradient-to-tr from-tertiary-fill via-primary-fill to-secondary shadow-[0_0_12px_rgba(124,58,237,0.35)]"),
          hasStory && cfg.ringP,
        )}
      >
        <div
          className={cn(
            "rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center font-display font-semibold text-cx-text",
            cfg.box,
            hasStory && "p-[2px] bg-canvas",
          )}
        >
          {src && !imgError ? (
            <img
              src={src || defaultAvatar}
              alt={alt}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
            />
          ) : (
            <span className={cfg.text}>{fallbackInitials || alt.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Story Add Badge */}
      {isAddStory && (
        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary-fill text-white flex items-center justify-center ring-2 ring-canvas shadow-[0_0_8px_rgba(124,58,237,0.8)] font-bold">
          <Plus className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Real-time Presence Badge */}
      {!isAddStory && presence && (
        <div className="absolute bottom-0 right-0">
          <PresenceBadge status={presence} />
        </div>
      )}
    </div>
  );
}
