import { useState, useEffect } from "react";
import {
  X,
  Mail,
  ShieldAlert,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/Toaster";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "request" | "verify" | "reset" | "success";

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  const resetPassword = useAuthStore((s) => s.resetPassword);
  const sendOtp = useAuthStore((s) => s.sendOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const updateUserPassword = useAuthStore((s) => s.updateUserPassword);

  // Handle resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => {
      setResendCountdown((c) => c - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  if (!isOpen) return null;

  // Step 1: Dispatch OTP Challenge via Backend API
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = identifier.trim();
    if (!clean) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Invoke server-side OTP dispatch hook (Supabase Auth / localBackend)
    const res = await sendOtp(clean);
    // Also trigger password reset hooks if email
    await resetPassword(clean);

    setIsLoading(false);

    if (res.success) {
      setStep("verify");
      setResendCountdown(60);
      toast.success("Verification challenge dispatched via SMS/Email.");
    } else {
      setErrorMessage(res.error || "Failed to dispatch verification code.");
    }
  };

  // Step 2: Verify 6-digit OTP Code with Backend API
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await verifyOtp(identifier.trim(), code);
    setIsLoading(false);

    if (res.success) {
      toast.success("Identity verified! Set your new password.");
      setStep("reset");
    } else {
      setErrorMessage(res.error || "Invalid verification code. Please try again.");
    }
  };

  // Resend OTP Challenge
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setIsLoading(true);
    const res = await sendOtp(identifier.trim());
    setIsLoading(false);
    if (res.success) {
      setResendCountdown(60);
      toast.success("A new 6-digit code has been dispatched.");
    } else {
      toast.error(res.error || "Failed to resend code.");
    }
  };

  // Step 3: Save New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await updateUserPassword(newPassword, identifier.trim());
    setIsLoading(false);

    if (res.success) {
      setStep("success");
      toast.success("Password reset completed successfully.");
    } else {
      setErrorMessage(res.error || "Failed to update password.");
    }
  };

  const handleDone = () => {
    setStep("request");
    setIdentifier("");
    setOtpCode(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/80 backdrop-blur-md">
      <div
        role="dialog"
        aria-labelledby="forgot-password-title"
        className="w-full max-w-md bg-[#171923] border border-[#232736] rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.65)] relative select-none animate-in fade-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          onClick={handleDone}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#11131A] hover:bg-[#1B2036] border border-[#232736] text-[#9EA5B9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close recovery dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-body flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: REQUEST OTP CHALLENGE */}
        {/* ========================================================= */}
        {step === "request" && (
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 id="forgot-password-title" className="font-display font-bold text-lg text-white">
                  Trouble Logging In?
                </h3>
                <p className="font-body text-xs text-[#9EA5B9]">
                  Enter your email or mobile to receive a 2FA challenge.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2">
              <label htmlFor="recovery-id" className="font-display text-xs font-semibold text-[#9EA5B9]">
                Email or Mobile Number
              </label>
              <input
                id="recovery-id"
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@connectx.io or +1 (555) 000-0000"
                className="w-full h-11 px-4 rounded-xl bg-[#11131A] border border-[#232736] text-white placeholder:text-[#5B6275] text-sm font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
              />
            </div>

            <p className="font-body text-[11px] text-[#5B6275] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#7C5CFF] shrink-0" />
              <span>A secure 6-digit OTP code will be sent to challenge and verify your identity.</span>
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDone}
                className="flex-1 h-11 rounded-xl bg-[#11131A] hover:bg-[#1B2036] border border-[#232736] text-[#F5F6FA] font-display text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!identifier.trim() || isLoading}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-[0_0_16px_rgba(124,92,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  "Send Code"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: 2FA OTP VERIFICATION VIEW */}
        {/* ========================================================= */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF]">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-white">Two-Factor Challenge</h3>
              <p className="font-body text-xs text-[#9EA5B9] mt-1 max-w-xs">
                Enter the 6-digit verification code sent to{" "}
                <span className="text-white font-semibold">{identifier}</span>.
              </p>
            </div>

            {/* 6-digit Code Inputs */}
            <div className="flex items-center gap-2 my-2">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`recovery-otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    const updated = [...otpCode];
                    updated[idx] = val;
                    setOtpCode(updated);
                    if (val && idx < 5) {
                      document.getElementById(`recovery-otp-${idx + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpCode[idx] && idx > 0) {
                      document.getElementById(`recovery-otp-${idx - 1}`)?.focus();
                    }
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                    if (pasted.length === 6) {
                      setOtpCode(pasted.split(""));
                    }
                  }}
                  className="w-10 sm:w-11 h-11 rounded-xl bg-[#11131A] border border-[#232736] text-white text-center font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="flex items-center gap-2 text-xs font-body text-[#9EA5B9]">
              <span>Didn't receive code?</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCountdown > 0 || isLoading}
                className="text-[#7C5CFF] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
              </button>
            </div>

            <div className="w-full flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="w-11 h-11 rounded-xl bg-[#11131A] hover:bg-[#1B2036] border border-[#232736] text-[#9EA5B9] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Change identifier"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="submit"
                disabled={otpCode.join("").length !== 6 || isLoading}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-[0_0_16px_rgba(124,92,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 3: CREATE NEW PASSWORD */}
        {/* ========================================================= */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Create New Password</h3>
                <p className="font-body text-xs text-[#9EA5B9]">
                  Choose a secure password with at least 8 characters.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#5B6275]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#11131A] border border-[#232736] text-white placeholder:text-[#5B6275] text-sm font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#5B6275] hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#5B6275]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-white placeholder:text-[#5B6275] text-sm font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newPassword || newPassword !== confirmPassword || isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-[0_0_16px_rgba(124,92,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 4: SUCCESS CONFIRMATION */}
        {/* ========================================================= */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-3 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Password Updated</h3>
            <p className="font-body text-xs text-[#9EA5B9] max-w-xs">
              Your password has been verified and updated. You can now log in with your new credentials.
            </p>
            <button
              type="button"
              onClick={handleDone}
              className="mt-2 w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-[0_0_16px_rgba(124,92,255,0.4)] transition-all cursor-pointer"
            >
              Return to Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
