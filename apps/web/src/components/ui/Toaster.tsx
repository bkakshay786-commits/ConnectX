/* eslint-disable react-refresh/only-export-components */
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--cx-surface-high)",
          color: "var(--cx-text)",
          border: "1px solid var(--cx-hairline)",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          fontFamily: "var(--cx-font-body)",
        },
        className: "border border-hairline/50",
      }}
    />
  );
}

export { toast } from "sonner";
