import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  ShieldAlert,
  Loader2,
  Calendar,
  Check,
  AlertCircle,
} from "lucide-react";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { useAuthStore } from "@/stores/auth-store";
import { env } from "@/app/config/env";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";

// Defer non-critical modals out of initial viewport hydration
const ForgotPasswordModal = lazy(() =>
  import("@/features/auth/components/ForgotPasswordModal").then((m) => ({ default: m.ForgotPasswordModal }))
);
const QrLoginModal = lazy(() =>
  import("@/features/auth/components/QrLoginModal").then((m) => ({ default: m.QrLoginModal }))
);
const SignupModal = lazy(() =>
  import("@/features/auth/components/SignupModal").then((m) => ({ default: m.SignupModal }))
);


export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignupMode = location.pathname.includes("signup");

  // Login Form State
  const [authMode, setAuthMode] = useState<"email" | "username">("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Signup Form State (for /signup view)
  const [signupContact, setSignupContact] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupDob, setSignupDob] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // General States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOAuthRedirecting, setIsOAuthRedirecting] = useState(false);

  // Modals
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [isQrOpen, setQrOpen] = useState(false);
  const [isSignupWizardOpen, setSignupWizardOpen] = useState(false);

  // MFA Challenge State
  const [mfaCode, setMfaCode] = useState(["", "", "", "", "", ""]);
  const [isMfaVerifying, setIsMfaVerifying] = useState(false);

  // Auth Store
  const {
    login,
    verifyMfa,
    isMfaRequired,
    isAccountLocked,
    unlockAccount,
    isAuthenticated,
    loginWithOAuth,
    signup,
  } = useAuthStore();

  const from = (location.state as { from?: string })?.from || "/";

  // Redirect if already authenticated (skip if currently performing an external OAuth redirect)
  useEffect(() => {
    if (isAuthenticated && !isOAuthRedirecting) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, isOAuthRedirecting]);

  // Reset errors on path or tab changes
  useEffect(() => {
    setErrorMessage(null);
  }, [location.pathname, authMode]);

  // Live username availability check
  const handleUsernameChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setSignupUsername(formatted);
    if (formatted.length >= 3) {
      setUsernameStatus("checking");
      setTimeout(() => {
        if (formatted === "admin" || formatted === "connectx") {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("available");
        }
      }, 350);
    } else {
      setUsernameStatus("idle");
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { level: "Weak", color: "bg-rose-500", percent: "25%" };
    if (score === 2) return { level: "Fair", color: "bg-amber-500", percent: "50%" };
    if (score === 3) return { level: "Good", color: "bg-blue-500", percent: "75%" };
    return { level: "Strong", color: "bg-emerald-500", percent: "100%" };
  };

  const strength = getPasswordStrength(signupPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMessage("Please enter your email, mobile number, or username.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }
    if (isLoading) return;

    setErrorMessage(null);
    setIsLoading(true);

    const res = await login(identifier.trim(), password, true);
    setIsLoading(false);

    if (res.success) {
      toast.success("Welcome back to ConnectX!");
      navigate(from, { replace: true });
    } else if (res.requiresMfa) {
      toast.info("Two-Factor Authentication required.");
    } else {
      setErrorMessage(res.error || "Invalid credentials. Please try again.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupContact || !signupFullName || !signupUsername || !signupPassword || !signupDob) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    if (usernameStatus === "taken") {
      setErrorMessage("Username is already taken.");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    const res = await signup({
      contact: signupContact,
      fullName: signupFullName,
      username: signupUsername,
      password: signupPassword,
    });
    setIsLoading(false);
    if (res.success) {
      toast.success("Account created successfully!");
      navigate(from, { replace: true });
    } else {
      setErrorMessage(res.error || "Failed to create account.");
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = mfaCode.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }

    setIsMfaVerifying(true);
    const success = await verifyMfa(code);
    setIsMfaVerifying(false);

    if (success) {
      toast.success("MFA Verified! Redirecting...");
      navigate(from, { replace: true });
    } else {
      toast.error("Invalid verification code.");
    }
  };

  const getOAuthUrl = (provider: "google" | "facebook" | "apple") => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    const supabaseUrl = env.supabaseUrl;
    if (supabaseUrl) {
      return `${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(`${origin}/`)}`;
    }
    if (provider === "google") {
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=connectx-client&response_type=token&redirect_uri=${encodeURIComponent(`${origin}/`)}&scope=openid%20email%20profile`;
    }
    if (provider === "facebook") {
      return `https://www.facebook.com/v18.0/dialog/oauth?client_id=connectx-client&redirect_uri=${encodeURIComponent(`${origin}/`)}&scope=email,public_profile`;
    }
    return `https://appleid.apple.com/auth/authorize?client_id=connectx-client&response_type=code&redirect_uri=${encodeURIComponent(`${origin}/`)}&scope=name%20email`;
  };

  const handleSocialLogin = async (provider: "Google" | "Facebook" | "Apple") => {
    setIsOAuthRedirecting(true);
    setIsLoading(true);
    setErrorMessage(null);

    const lower = provider.toLowerCase() as "google" | "facebook" | "apple";
    const res = await loginWithOAuth(lower);

    if (!res.success && res.error) {
      setIsOAuthRedirecting(false);
      setIsLoading(false);
      setErrorMessage(res.error);
      toast.error(res.error);
      return;
    }

    if (!res.success) {
      setIsOAuthRedirecting(false);
      setIsLoading(false);
      setErrorMessage(`Could not sign in with ${provider}.`);
      toast.error(`Could not sign in with ${provider}.`);
      return;
    }

    toast.success(`Redirecting to ${provider}...`);

    const externalOAuthUrl = res.url || getOAuthUrl(lower);
    if (typeof window !== "undefined" && externalOAuthUrl) {
      window.location.href = externalOAuthUrl;
    }
  };


  return (
    <AuthLayout>
      <div className="w-full max-w-[380px] mx-auto flex flex-col gap-3.5">
        {/* Main Card */}
        <div className="w-full bg-[#171923] border border-[#232736] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl flex flex-col gap-3.5 relative">
          {/* Subtle QR Code Access Button (Non-intrusive) */}
          {!isSignupMode && (
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              title="Log in with QR Code"
              className="absolute top-5 right-5 p-1.5 rounded-lg bg-[#11131A] hover:bg-[#1B2036] border border-[#232736] text-[#9EA5B9] hover:text-white transition-colors cursor-pointer"
              aria-label="Log in with QR Code"
            >
              <QrCode className="w-4 h-4 text-[#7C5CFF]" />
            </button>
          )}

          {/* Header */}
          <div className="text-center pt-1">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#F5F6FA] tracking-tight">
              {isSignupMode ? "Create account" : "Welcome back"}
            </h2>
            <p className="font-body text-xs text-[#9EA5B9] mt-1">
              {isSignupMode
                ? "Join ConnectX to share media, spaces, and code"
                : "Log in to continue to ConnectX"}
            </p>
          </div>

          {/* Account Locked Banner */}
          {isAccountLocked && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-display font-semibold text-rose-300">Account Temporarily Locked</p>
                <p className="font-body text-rose-300/80 mt-0.5">
                  Too many failed attempts. Device throttled for security.
                </p>
                <button
                  type="button"
                  onClick={unlockAccount}
                  className="mt-1.5 font-display text-xs text-white underline hover:text-rose-200"
                >
                  Unlock Demo Account
                </button>
              </div>
            </div>
          )}

          {/* MFA Challenge View */}
          {isMfaRequired ? (
            <form onSubmit={handleMfaSubmit} className="flex flex-col items-center text-center gap-4 py-2">
              <div className="w-12 h-12 rounded-full bg-[#7C5CFF]/20 border border-[#7C5CFF]/30 flex items-center justify-center text-[#7C5CFF]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">Two-Factor Challenge</h3>
                <p className="font-body text-xs text-[#9EA5B9] mt-1 max-w-xs">
                  Enter the 6-digit verification code from your authenticator app.
                </p>
              </div>

              {/* 6-digit Code Inputs */}
              <div className="flex items-center gap-2 my-2">
                {mfaCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`mfa-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      const updated = [...mfaCode];
                      updated[idx] = val;
                      setMfaCode(updated);
                      if (val && idx < 5) {
                        document.getElementById(`mfa-${idx + 1}`)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !mfaCode[idx] && idx > 0) {
                        document.getElementById(`mfa-${idx - 1}`)?.focus();
                      }
                    }}
                    className="w-10 sm:w-11 h-11 rounded-xl bg-[#11131A] border border-[#232736] text-white text-center font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isMfaVerifying}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_16px_rgba(124,92,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isMfaVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
              </button>
            </form>
          ) : !isSignupMode ? (
            /* ========================================================= */
            /* 1. EXACT REFERENCE LOGIN FORM */
            /* ========================================================= */
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
              {/* Tabs: Email or Mobile vs Username */}
              <div className="flex border-b border-[#232736]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("email");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "flex-1 pb-2.5 font-display text-xs sm:text-sm font-medium transition-all text-center relative cursor-pointer",
                    authMode === "email"
                      ? "text-white font-semibold"
                      : "text-[#9EA5B9] hover:text-white",
                  )}
                >
                  Email or mobile
                  {authMode === "email" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C5CFF] shadow-[0_0_8px_rgba(124,92,255,0.8)]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("username");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "flex-1 pb-2.5 font-display text-xs sm:text-sm font-medium transition-all text-center relative cursor-pointer",
                    authMode === "username"
                      ? "text-white font-semibold"
                      : "text-[#9EA5B9] hover:text-white",
                  )}
                >
                  Username
                  {authMode === "username" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C5CFF] shadow-[0_0_8px_rgba(124,92,255,0.8)]" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-body flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Identifier Input */}
              <div className="relative flex items-center">
                {authMode === "email" ? (
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                ) : (
                  <User className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                )}
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMode === "email" ? "Email or mobile number" : "Username"}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-sm font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF] transition-all"
                  aria-label={authMode === "email" ? "Email or mobile number" : "Username"}
                />
              </div>

              {/* Password Input */}
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-sm font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF] transition-all"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#5B6275] hover:text-[#F5F6FA] p-1 transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Forgot password row (clean right-aligned, exact match to screenshot) */}
              <div className="flex items-center justify-end text-xs font-body pt-0.5">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[#7C5CFF] hover:text-[#9EA5B9] font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Login Button (vibrant gradient matching screenshot) */}
              <button
                type="submit"
                disabled={isLoading || isAccountLocked}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_20px_rgba(124,92,255,0.4)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 mt-0.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>

              {/* OR Divider */}
              <div className="flex items-center my-0.5">
                <div className="flex-1 h-px bg-[#232736]" />
                <span className="px-3 text-[11px] font-display font-semibold text-[#5B6275] uppercase tracking-wider">
                  OR
                </span>
                <div className="flex-1 h-px bg-[#232736]" />
              </div>

              {/* Social Logins */}
              <div className="flex flex-col gap-2">
                {/* Google Anchor Button */}
                <a
                  id="oauth-google-btn"
                  href={getOAuthUrl("google")}
                  onClick={() => handleSocialLogin("Google")}
                  rel="noopener noreferrer"
                  className="w-full h-10 sm:h-11 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </a>

                {/* Facebook Anchor Button */}
                <a
                  id="oauth-facebook-btn"
                  href={getOAuthUrl("facebook")}
                  onClick={() => handleSocialLogin("Facebook")}
                  rel="noopener noreferrer"
                  className="w-full h-10 sm:h-11 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continue with Facebook</span>
                </a>

                {/* Apple Anchor Button */}
                <a
                  id="oauth-apple-btn"
                  href={getOAuthUrl("apple")}
                  onClick={() => handleSocialLogin("Apple")}
                  rel="noopener noreferrer"
                  className="w-full h-10 sm:h-11 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.43-.59.68-1.12 1.84-.98 2.96 1.07.08 2.14-.52 2.79-1.29z" />
                  </svg>
                  <span>Continue with Apple</span>
                </a>
              </div>

              {/* Sign up prompt */}
              <div className="text-center pt-1.5 text-xs font-body text-[#9EA5B9]">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#7C5CFF] font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* 2. PRODUCTION SIGNUP FORM (/signup) */
            /* ========================================================= */
            <form onSubmit={handleSignupSubmit} className="flex flex-col gap-3">
              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-body flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Contact Input */}
              <div className="flex flex-col gap-1">
                <label className="font-display text-[11px] font-semibold text-[#9EA5B9]">
                  Mobile Number or Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signupContact}
                    onChange={(e) => setSignupContact(e.target.value)}
                    placeholder="name@connectx.io or +1 (555) 000-0000"
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-xs font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-display text-[11px] font-semibold text-[#9EA5B9]">
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-xs font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                  />
                </div>
              </div>

              {/* Username with Live Availability */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="font-display text-[11px] font-semibold text-[#9EA5B9]">
                    Username
                  </label>
                  {usernameStatus === "checking" && (
                    <span className="text-[10px] text-[#9EA5B9] flex items-center gap-1 font-body">
                      <Loader2 className="w-3 h-3 animate-spin" /> checking...
                    </span>
                  )}
                  {usernameStatus === "available" && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-body font-semibold">
                      <Check className="w-3 h-3" /> available
                    </span>
                  )}
                  {usernameStatus === "taken" && (
                    <span className="text-[10px] text-rose-400 flex items-center gap-1 font-body font-semibold">
                      <AlertCircle className="w-3 h-3" /> taken
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs text-[#5B6275] font-display font-bold select-none">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="elena_creator"
                    className="w-full h-10 pl-8 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-xs font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                  />
                </div>
              </div>

              {/* Password with Strength Meter */}
              <div className="flex flex-col gap-1">
                <label className="font-display text-[11px] font-semibold text-[#9EA5B9]">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                  <input
                    type={signupShowPassword ? "text" : "password"}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full h-10 pl-10 pr-10 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] placeholder:text-[#5B6275] text-xs font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setSignupShowPassword(!signupShowPassword)}
                    className="absolute right-3 text-[#5B6275] hover:text-[#F5F6FA] transition-colors"
                  >
                    {signupShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupPassword.length > 0 && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="h-1 flex-1 bg-[#11131A] rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all duration-300", strength.color)} style={{ width: strength.percent }} />
                    </div>
                    <span className="text-[10px] font-body text-[#9EA5B9]">{strength.level}</span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="flex flex-col gap-1">
                <label className="font-display text-[11px] font-semibold text-[#9EA5B9]">
                  Date of Birth
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3.5 w-4 h-4 text-[#5B6275] pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={signupDob}
                    onChange={(e) => setSignupDob(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#11131A] border border-[#232736] text-[#F5F6FA] text-xs font-body focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                  />
                </div>
              </div>

              {/* Signup Action Button */}
              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#3B82F6] hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_20px_rgba(124,92,255,0.4)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <span>Create account</span>
              </button>

              {/* OR Divider */}
              <div className="flex items-center my-0.5">
                <div className="flex-1 h-px bg-[#232736]" />
                <span className="px-3 text-[11px] font-display font-semibold text-[#5B6275] uppercase tracking-wider">
                  OR
                </span>
                <div className="flex-1 h-px bg-[#232736]" />
              </div>

              {/* Social Signup */}
              <div className="flex flex-col gap-2">
                <a
                  id="signup-oauth-google-btn"
                  href={getOAuthUrl("google")}
                  onClick={() => handleSocialLogin("Google")}
                  rel="noopener noreferrer"
                  className="w-full h-10 rounded-xl bg-[#11131A] hover:bg-[#1B2036] text-[#F5F6FA] border border-[#232736] font-display text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-sm active:scale-98 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign up with Google</span>
                </a>
              </div>

              {/* Switch to Login */}
              <div className="text-center pt-1 text-xs font-body text-[#9EA5B9]">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#7C5CFF] font-semibold hover:underline"
                >
                  Log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modals deferred until user triggers them */}
      <Suspense fallback={null}>
        {isForgotOpen && (
          <ForgotPasswordModal
            isOpen={isForgotOpen}
            onClose={() => setForgotOpen(false)}
          />
        )}
        {isQrOpen && (
          <QrLoginModal
            isOpen={isQrOpen}
            onClose={() => setQrOpen(false)}
            onSuccess={() => navigate("/")}
          />
        )}
        {isSignupWizardOpen && (
          <SignupModal
            isOpen={isSignupWizardOpen}
            onClose={() => setSignupWizardOpen(false)}
            onSuccess={() => navigate("/")}
          />
        )}
      </Suspense>
    </AuthLayout>
  );
}
