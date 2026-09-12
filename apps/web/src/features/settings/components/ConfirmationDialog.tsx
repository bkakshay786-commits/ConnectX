import { AlertTriangle, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/80 backdrop-blur-md select-none">
      <div
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="w-full max-w-md bg-card-dark/95 border border-border-dark rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-4"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-high hover:bg-surface-highest text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
          aria-label="Cancel dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="font-display font-bold text-base text-text-pure">
              {title}
            </h3>
            <p id="confirm-dialog-desc" className="font-body text-xs text-text-secondary mt-0.5">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-surface-high hover:bg-surface-highest text-text-pure font-display text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={
              confirmVariant === "danger"
                ? "px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-display text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                : "px-5 py-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-lg transition-all active:scale-95"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
