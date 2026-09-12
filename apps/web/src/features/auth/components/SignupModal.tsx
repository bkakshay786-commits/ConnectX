import { useState, useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Calendar,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
  ArrowRight,
  Camera,
  Globe,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { toast } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils/cn";


interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type SignupStep = "credentials" | "otp" | "onboarding";

export function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const [step, setStep] = useState<SignupStep>("credentials");

  // Step 1 Form
  const [contact, setContact] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dob, setDob] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  // Step 2 OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(30);

  // Step 3 Onboarding
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "3D Assets & CAD",
    "Generative AI",
  ]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  );
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // OTP Countdown effect
  useEffect(() => {
    if (step !== "otp" || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const [isLoading, setIsLoading] = useState(false);
  const { signup, sendOtp, verifyOtp } = useAuthStore();

  if (!isOpen) return null;

  // Live username availability check simulation
  const handleUsernameChange = (val: string) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9_.]/g, "");
    setUsername(formatted);
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

  const strength = getPasswordStrength(password);

  // Handle Step 1 Submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !fullName || !username || !password || !dob) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (usernameStatus === "taken") {
      toast.error("Username is already taken.");
      return;
    }
    setIsLoading(true);
    const res = await sendOtp(contact);
    setIsLoading(false);
    if (!res.success && isSupabaseConfigured) {
      toast.error(res.error || "Could not dispatch verification code.");
      return;
    }
    setStep("otp");
    toast.success("Verification code sent to your contact!");
  };

  // Handle Step 2 OTP Submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }
    setIsLoading(true);
    const res = await verifyOtp(contact, fullOtp);
    setIsLoading(false);
    if (!res.success && isSupabaseConfigured) {
      toast.error(res.error || "Invalid verification code.");
      return;
    }
    setStep("onboarding");
  };

  // Handle Step 3 Finish
  const handleFinishOnboarding = async () => {
    setIsLoading(true);
    const res = await signup({
      contact,
      fullName,
      username,
      password,
      avatarUrl: avatarPreview,
      bio: "Creator & Explorer on ConnectX 🚀",
    });
    setIsLoading(false);
    if (res.success) {
      toast.success("Welcome to ConnectX!", {
        description: `Logged in as @${username}`,
      });
      onSuccess();
      onClose();
    } else {
      toast.error(res.error || "Failed to create account.");
    }
  };


  const interestsList = [
    "3D Assets & CAD",
    "Generative AI",
    "Spatial Audio & Stems",
    "Code Bundles",
    "Creative Photography",
    "Live Spaces",
    "Design Systems",
    "Motion & Video",
  ];

  const toggleInterest = (tag: string) => {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-deep/85 backdrop-blur-md select-none overflow-y-auto">
      <div
        role="dialog"
        aria-labelledby="signup-title"
        className="w-full max-w-lg bg-card-dark/95 border border-border-dark rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 my-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-high hover:bg-surface-highest text-cx-muted hover:text-cx-text flex items-center justify-center transition-colors"
          aria-label="Close signup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/brand/connectx-mark.svg"
            alt="ConnectX"
            className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(124,92,255,0.4)] mb-2"
          />
          <h2 id="signup-title" className="font-display font-bold text-xl text-text-pure tracking-tight">
            Create your ConnectX Account
          </h2>
          <p className="font-body text-xs text-text-secondary mt-1">
            Join the universal creator ecosystem for media, spaces, and code.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2 mt-4">
            <div className={cn("h-1.5 rounded-full transition-all", step === "credentials" ? "w-8 bg-primary-vibrant" : "w-2 bg-border-dark")} />
            <div className={cn("h-1.5 rounded-full transition-all", step === "otp" ? "w-8 bg-primary-vibrant" : "w-2 bg-border-dark")} />
            <div className={cn("h-1.5 rounded-full transition-all", step === "onboarding" ? "w-8 bg-primary-vibrant" : "w-2 bg-border-dark")} />
          </div>
        </div>

        {/* ========================================================= */}
        {/* STEP 1: CREDENTIALS */}
        {/* ========================================================= */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-3.5">
            {/* Mobile or Email */}
            <div className="flex flex-col gap-1">
              <label className="font-display text-xs font-semibold text-text-secondary">
                Mobile Number or Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="name@connectx.io or +1 (555) 000-0000"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#11131A] border border-border-dark text-text-pure placeholder:text-text-dim text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary-vibrant"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label className="font-display text-xs font-semibold text-text-secondary">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Emily Chen"
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#11131A] border border-border-dark text-text-pure placeholder:text-text-dim text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary-vibrant"
                />
              </div>
            </div>

            {/* Username with Live Availability */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-display text-xs font-semibold text-text-secondary">
                  Username
                </label>
                {usernameStatus === "checking" && (
                  <span className="text-[11px] font-body text-text-dim">Checking availability...</span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-[11px] font-body text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Available
                  </span>
                )}
                {usernameStatus === "taken" && (
                  <span className="text-[11px] font-body text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Taken
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-text-dim text-sm font-display">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="emily_designs"
                  className="w-full h-11 pl-8 pr-4 rounded-xl bg-[#11131A] border border-border-dark text-text-pure placeholder:text-text-dim text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary-vibrant"
                />
              </div>
            </div>

            {/* Password with Strength Indicator */}
            <div className="flex flex-col gap-1">
              <label className="font-display text-xs font-semibold text-text-secondary">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 pl-10 pr-11 rounded-xl bg-[#11131A] border border-border-dark text-text-pure placeholder:text-text-dim text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary-vibrant"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-text-dim hover:text-text-pure p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between text-[11px] font-body text-text-dim">
                    <span>Strength: <span className="font-semibold text-text-pure">{strength.level}</span></span>
                  </div>
                  <div className="w-full h-1.5 bg-[#11131A] rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-300", strength.color)} style={{ width: strength.percent }} />
                  </div>
                </div>
              )}
            </div>

            {/* Date of Birth */}
            <div className="flex flex-col gap-1">
              <label className="font-display text-xs font-semibold text-text-secondary">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-text-dim pointer-events-none" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#11131A] border border-border-dark text-text-pure text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary-vibrant"
                />
              </div>
            </div>

            <p className="font-body text-[11px] text-text-dim pt-1 text-center">
              By signing up, you agree to our <span className="text-primary-vibrant">Terms</span>, <span className="text-primary-vibrant">Privacy Policy</span>, and <span className="text-primary-vibrant">Cookies Policy</span>.
            </p>

            <button
              type="submit"
              className="mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_20px_rgba(124,92,255,0.4)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 2: OTP VERIFICATION */}
        {/* ========================================================= */}
        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="flex flex-col items-center text-center gap-4 py-2">
            <div className="w-12 h-12 rounded-full bg-primary-vibrant/20 border border-primary-vibrant/30 flex items-center justify-center text-primary-vibrant">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-pure">Enter Confirmation Code</h3>
              <p className="font-body text-xs text-text-secondary mt-1">
                Enter the 6-digit verification code sent to <span className="text-text-pure font-semibold">{contact}</span>.
              </p>
            </div>

            {/* 6-digit Code Inputs */}
            <div className="flex items-center gap-2 my-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    const updated = [...otp];
                    updated[idx] = val;
                    setOtp(updated);
                    if (val && idx < 5) {
                      document.getElementById(`otp-${idx + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                      document.getElementById(`otp-${idx - 1}`)?.focus();
                    }
                  }}
                  className="w-11 h-12 rounded-xl bg-[#11131A] border border-border-dark text-text-pure text-center font-display font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary-vibrant"
                />
              ))}
            </div>

            <p className="text-xs font-body text-text-dim">
              Didn't receive code?{" "}
              {otpTimer > 0 ? (
                <span className="text-text-secondary font-medium">Resend in {otpTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setOtpTimer(30);
                    toast.success("New verification code sent!");
                  }}
                  className="text-primary-vibrant font-semibold hover:underline"
                >
                  Resend Code
                </button>
              )}
            </p>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={() => setStep("credentials")}
                className="flex-1 h-11 rounded-xl bg-surface-high hover:bg-surface-highest text-text-pure font-display text-xs font-semibold transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-95 text-white font-display text-xs font-semibold shadow-lg shadow-primary-vibrant/30 transition-all"
              >
                Verify Code
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* STEP 3: ONBOARDING */}
        {/* ========================================================= */}
        {step === "onboarding" && (
          <div className="flex flex-col gap-5 py-2">
            <div className="text-center">
              <h3 className="font-display font-bold text-lg text-text-pure">Set Up Your Profile</h3>
              <p className="font-body text-xs text-text-secondary mt-0.5">
                Personalize your creative presence before entering the universe.
              </p>
            </div>

            {/* Avatar Selection */}
            <div className="flex flex-col items-center gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarPreview(URL.createObjectURL(file));
                    toast.success("Profile photo selected!");
                  }
                }}
              />
              <div className="relative">
                <Avatar src={avatarPreview} alt={fullName} size="xl" className="ring-2 ring-primary-vibrant/50 shadow-xl" />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-vibrant text-white flex items-center justify-center shadow-md ring-2 ring-[#090A0F] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs font-display text-text-dim">Upload profile picture</span>
            </div>

            {/* Privacy Choice */}
            <div className="p-3.5 rounded-xl bg-[#11131A] border border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-secondary-vibrant" />
                <div>
                  <p className="font-display text-xs font-semibold text-text-pure">
                    {isPrivate ? "Private Profile" : "Public Creator Profile"}
                  </p>
                  <p className="font-body text-[11px] text-text-dim">
                    {isPrivate
                      ? "Only approved followers can view your files and moments."
                      : "Anyone can discover your 3D models, code, and posts."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPrivate}
                onClick={() => setIsPrivate(!isPrivate)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0",
                  isPrivate ? "bg-primary-vibrant" : "bg-surface-highest",
                )}
              >
                <div className={cn("w-5 h-5 rounded-full bg-white transition-transform", isPrivate ? "translate-x-5" : "")} />
              </button>
            </div>

            {/* Interests Chips */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xs font-semibold text-text-secondary">
                Select your Creative Focus
              </label>
              <div className="flex flex-wrap gap-1.5">
                {interestsList.map((tag) => {
                  const isSelected = selectedInterests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-display font-medium transition-all select-none active:scale-95",
                        isSelected
                          ? "bg-primary-vibrant/20 border border-primary-vibrant text-primary-vibrant shadow-[0_0_10px_rgba(124,92,255,0.25)]"
                          : "bg-[#11131A] border border-border-dark text-text-dim hover:text-text-pure",
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complete Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleFinishOnboarding}
              className="mt-2 w-full h-12 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:opacity-95 text-white font-display text-sm font-semibold shadow-[0_0_20px_rgba(124,92,255,0.4)] hover:scale-[1.01] active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Creating your universe...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Enter ConnectX</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
