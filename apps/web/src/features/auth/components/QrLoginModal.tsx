import { useState } from "react";
import { X, QrCode, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/Toaster";

interface QrLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QrLoginModal({ isOpen, onClose, onSuccess }: QrLoginModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const login = useAuthStore((s) => s.login);

  if (!isOpen) return null;

  const handleSimulateScan = async () => {
    setIsScanning(true);
    await new Promise((res) => setTimeout(res, 1200));
    await login("emily@connectx.io", "password123", true);
    setIsScanning(false);
    toast.success("Authenticated via Mobile Device!");
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/80 backdrop-blur-md select-none">
      <div
        role="dialog"
        aria-labelledby="qr-login-title"
        className="w-full max-w-sm bg-card-dark/95 border border-border-dark rounded-2xl p-6 shadow-2xl relative flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-high hover:bg-surface-highest text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
          aria-label="Close QR login dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-primary-vibrant/20 border border-primary-vibrant/30 flex items-center justify-center text-primary-vibrant mb-3 shadow-[0_0_16px_rgba(124,92,255,0.3)]">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 id="qr-login-title" className="font-display font-bold text-lg text-text-pure">
          Log in with QR Code
        </h3>
        <p className="font-body text-xs text-text-secondary mt-1 max-w-xs">
          Scan this instant code with the <span className="text-primary-vibrant font-semibold">ConnectX mobile app</span> to log in without a password.
        </p>

        {/* QR Frame Container */}
        <div className="my-6 p-4 rounded-2xl bg-white relative shadow-[0_0_32px_rgba(124,92,255,0.25)] flex flex-col items-center justify-center">
          {/* Stylized QR Matrix Pattern */}
          <svg className="w-48 h-48 text-[#090A0F]" viewBox="0 0 100 100" fill="currentColor">
            {/* Corner Squares */}
            <path d="M0 0h30v30H0zm5 5v20h20V5zm5 5h10v10H10z" />
            <path d="M70 0h30v30H70zm5 5v20h20V5zm5 5h10v10H80z" />
            <path d="M0 70h30v30H0zm5 5v20h20V5zm5 5h10v10H10z" />
            {/* Random aesthetic QR data blocks */}
            <rect x="36" y="6" width="6" height="6" />
            <rect x="48" y="10" width="6" height="12" />
            <rect x="58" y="6" width="6" height="6" />
            <rect x="36" y="20" width="8" height="8" />
            <rect x="10" y="36" width="12" height="6" />
            <rect x="28" y="38" width="6" height="6" />
            <rect x="40" y="36" width="20" height="20" rx="3" className="fill-[#7C5CFF]" />
            <rect x="66" y="36" width="8" height="6" />
            <rect x="80" y="38" width="12" height="6" />
            <rect x="8" y="48" width="6" height="14" />
            <rect x="20" y="52" width="12" height="6" />
            <rect x="68" y="48" width="6" height="14" />
            <rect x="82" y="50" width="10" height="8" />
            <rect x="36" y="66" width="8" height="8" />
            <rect x="50" y="68" width="12" height="6" />
            <rect x="68" y="68" width="8" height="12" />
            <rect x="84" y="68" width="8" height="8" />
            <rect x="36" y="80" width="16" height="6" />
            <rect x="58" y="82" width="6" height="10" />
            <rect x="74" y="86" width="14" height="6" />
          </svg>

          {/* Central Logo Pip */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-xl bg-[#090A0F] border border-primary-vibrant/40 flex items-center justify-center shadow-lg">
              <img src="/brand/connectx-mark.svg" alt="ConnectX" className="w-6 h-6 object-contain" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-text-dim">
          <Smartphone className="w-4 h-4 text-primary-vibrant animate-pulse" />
          <span>Point your phone camera or ConnectX Scanner</span>
        </div>

        {/* Demo Simulation Action Button */}
        <div className="w-full pt-4">
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="w-full h-11 rounded-xl bg-surface-high hover:bg-surface-highest text-text-pure font-display text-xs font-semibold flex items-center justify-center gap-2 border border-border-dark transition-all active:scale-95"
          >
            {isScanning ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>Authorizing device...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-primary-vibrant" />
                <span>Simulate Mobile Scan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
