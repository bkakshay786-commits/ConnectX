/**
 * ConnectX Centralized Authentication Store.
 *
 * Integrates Supabase Auth with Row Level Security and Profile Synchronization.
 * Supports:
 * - Email + Password
 * - Username + Password (with secure email lookup resolution)
 * - Mobile Number + OTP
 * - Social Logins (Google, Facebook, Apple)
 * - Forgot Password / Password Reset
 * - Persistent Session Management & State Change Listening
 * - Seamless local fallback when credentials are not yet configured in .env
 */

import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { env } from "@/app/config/env";
import { localBackend } from "@/lib/local-backend-service";
import { mockCurrentUser } from "@/mocks/mockData";
import type { User, Profile } from "@/types/domain";

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  currentUser: User | null;
  currentProfile: Profile | null;
  currentSession: Session | null;
  rememberDevice: boolean;
  isMfaRequired: boolean;
  isAccountLocked: boolean;
  loginAttempts: number;
  errorMessage: string | null;


  // Lifecycle
  initialize: () => Promise<void>;

  // Authentication Flows
  login: (
    identifier: string,
    pass: string,
    remember?: boolean
  ) => Promise<{ success: boolean; requiresMfa?: boolean; error?: string }>;
  
  signup: (userData: {
    contact: string;
    fullName: string;
    username: string;
    password: string;
    avatarUrl?: string;
    bio?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  loginWithOAuth: (
    provider: "google" | "facebook" | "apple"
  ) => Promise<{ success: boolean; url?: string; error?: string }>;

  sendOtp: (
    contact: string
  ) => Promise<{ success: boolean; error?: string }>;

  verifyOtp: (
    contact: string,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;

  verifyMfa: (code: string) => Promise<boolean>;

  resetPassword: (
    identifier: string
  ) => Promise<{ success: boolean; error?: string }>;

  updateUserPassword: (
    newPassword: string,
    contact?: string
  ) => Promise<{ success: boolean; error?: string }>;

  logout: () => Promise<void>;

  // Profile Management
  updateProfile: (
    updates: Partial<Profile>
  ) => Promise<{ success: boolean; error?: string }>;

  // UI helpers
  unlockAccount: () => void;
  setRememberDevice: (remember: boolean) => void;
  clearError: () => void;
}

function profileToUser(profile: Profile): User {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.display_name,
    avatarUrl:
      profile.avatar_url ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: profile.bio || undefined,
    verified: true,
    presence: "online",
    followersCount: 1280,
    followingCount: 395,
    spacesCount: 6,
  };
}

let authSubscriptionInitialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoading: true,
  isAuthenticated: false,
  currentUser: null,
  currentProfile: null,
  currentSession: null,
  rememberDevice: true,
  isMfaRequired: false,
  isAccountLocked: false,
  loginAttempts: 0,
  errorMessage: null,

  initialize: async () => {
    // If Supabase is not configured or in local mode, restore from localBackend
    if (!isSupabaseConfigured) {
      const activeUser = await localBackend.getActiveUser();
      if (activeUser) {
        const profile = await localBackend.getProfileById(activeUser.id);
        set({
          isLoading: false,
          isAuthenticated: true,
          currentSession: null,
          currentUser: activeUser,
          currentProfile: profile
            ? {
                id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                bio: profile.bio,
              }
            : {
                id: activeUser.id,
                username: activeUser.username,
                display_name: activeUser.displayName,
                avatar_url: activeUser.avatarUrl,
                bio: activeUser.bio,
              },
        });
      } else {
        set({
          isLoading: false,
          isAuthenticated: false,
          currentSession: null,
          currentUser: null,
          currentProfile: null,
        });
      }
      return;
    }

    try {
      set({ isLoading: true });
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        set({
          isLoading: false,
          isAuthenticated: false,
          currentSession: null,
          currentUser: null,
        });
        return;
      }

      if (session?.user) {
        // Fetch matching profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        const userProfile: Profile = profile || {
          id: session.user.id,
          username:
            session.user.user_metadata?.username ||
            session.user.email?.split("@")[0] ||
            "user",
          display_name:
            session.user.user_metadata?.display_name ||
            session.user.user_metadata?.full_name ||
            "Creator",
          avatar_url: session.user.user_metadata?.avatar_url || null,
          bio: session.user.user_metadata?.bio || null,
        };

        set({
          isAuthenticated: true,
          isLoading: false,
          currentSession: session,
          currentProfile: userProfile,
          currentUser: profileToUser(userProfile),
        });
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
          currentSession: null,
          currentUser: null,
          currentProfile: null,
        });
      }

      // Initialize onAuthStateChange listener once
      if (!authSubscriptionInitialized) {
        authSubscriptionInitialized = true;
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_OUT" || !session) {
            set({
              isAuthenticated: false,
              currentSession: null,
              currentUser: null,
              currentProfile: null,
              isMfaRequired: false,
            });
          } else if (session.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            const userProfile: Profile = profile || {
              id: session.user.id,
              username:
                session.user.user_metadata?.username ||
                session.user.email?.split("@")[0] ||
                "user",
              display_name:
                session.user.user_metadata?.display_name ||
                session.user.user_metadata?.full_name ||
                "Creator",
              avatar_url: session.user.user_metadata?.avatar_url || null,
              bio: session.user.user_metadata?.bio || null,
            };

            set({
              isAuthenticated: true,
              currentSession: session,
              currentProfile: userProfile,
              currentUser: profileToUser(userProfile),
              isMfaRequired: false,
            });
          }
        });
      }
    } catch (err) {
      console.warn("Auth initialization warning:", err);
      set({ isLoading: false });
    }
  },


  login: async (identifier: string, pass: string, remember = true) => {
    if (get().isAccountLocked) {
      return {
        success: false,
        error: "Account temporarily locked due to security limits. Try again later.",
      };
    }

    const cleanIdentifier = identifier.trim();

    // 1. If Supabase is configured with real project credentials:
    if (isSupabaseConfigured) {
      try {
        let authEmail = cleanIdentifier;

        // Check if identifier is a username (does not contain '@' and does not start with '+')
        const isEmail = cleanIdentifier.includes("@");
        const isPhone = cleanIdentifier.startsWith("+") || /^\d{10,}$/.test(cleanIdentifier.replace(/[\s()-]/g, ""));

        if (!isEmail && !isPhone) {
          // Resolve username to auth email via secure RPC or profiles query
          const normalized = cleanIdentifier.toLowerCase().replace(/[^a-z0-9_.]/g, "");
          const { data: resolvedEmail, error: rpcError } = await supabase.rpc(
            "get_auth_email_by_username",
            { lookup_username: normalized }
          );

          if (rpcError || !resolvedEmail) {
            // Attempt fallback profile lookup if RPC was not created yet
            const { data: profileData } = await supabase
              .from("profiles")
              .select("id")
              .eq("username_normalized", normalized)
              .maybeSingle();

            if (!profileData) {
              const attempts = get().loginAttempts + 1;
              set({ loginAttempts: attempts, isAccountLocked: attempts >= 5 });
              return { success: false, error: "No account found for this username." };
            }
          } else {
            authEmail = resolvedEmail;
          }
        }

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: pass,
        });

        if (error) {
          const attempts = get().loginAttempts + 1;
          const locked = attempts >= 5;
          set({ loginAttempts: attempts, isAccountLocked: locked });
          return {
            success: false,
            error: locked
              ? "Too many failed attempts. Account locked for security."
              : error.message || "Invalid login credentials.",
          };
        }

        if (data.user) {
          // Fetch or provision user profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

          const userProfile: Profile = profile || {
            id: data.user.id,
            username:
              data.user.user_metadata?.username ||
              data.user.email?.split("@")[0] ||
              "creator",
            display_name:
              data.user.user_metadata?.display_name ||
              data.user.user_metadata?.full_name ||
              "Creator",
            avatar_url: data.user.user_metadata?.avatar_url || null,
            bio: data.user.user_metadata?.bio || null,
          };

          set({
            isAuthenticated: true,
            currentUser: profileToUser(userProfile),
            currentProfile: userProfile,
            rememberDevice: remember,
            isMfaRequired: false,
            loginAttempts: 0,
            errorMessage: null,
          });

          return { success: true };
        }
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Authentication failed.",
        };
      }
    }

    // 2. Local Backend Mode
    await new Promise((res) => setTimeout(res, 350));

    // Demo MFA trigger
    if (pass === "mfa123" || cleanIdentifier.toLowerCase().includes("mfa")) {
      set({ isMfaRequired: true });
      return { success: false, requiresMfa: true };
    }

    // Wrong password handling
    if (pass === "wrong" || pass === "invalid") {
      const attempts = get().loginAttempts + 1;
      const locked = attempts >= 3;
      set({ loginAttempts: attempts, isAccountLocked: locked });
      return {
        success: false,
        error: locked
          ? "Too many failed attempts. Account locked for security."
          : "Invalid credentials. Please verify your details.",
      };
    }

    // Try localBackend login first
    const backendRes = await localBackend.login(cleanIdentifier, pass);
    const resolvedUser = backendRes.user || mockCurrentUser;
    const resolvedProfile: Profile = backendRes.profile
      ? {
          id: backendRes.profile.id,
          username: backendRes.profile.username,
          display_name: backendRes.profile.display_name,
          avatar_url: backendRes.profile.avatar_url,
          bio: backendRes.profile.bio,
        }
      : {
          id: resolvedUser.id,
          username: resolvedUser.username,
          display_name: resolvedUser.displayName,
          avatar_url: resolvedUser.avatarUrl,
          bio: resolvedUser.bio,
        };

    set({
      isAuthenticated: true,
      rememberDevice: remember,
      currentUser: resolvedUser,
      currentProfile: resolvedProfile,
      isMfaRequired: false,
      loginAttempts: 0,
      errorMessage: null,
    });
    return { success: true };
  },

  signup: async (userData) => {
    const { contact, fullName, username, password, avatarUrl, bio } = userData;
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_.]/g, "");

    if (isSupabaseConfigured) {
      try {
        const isEmail = contact.includes("@");
        const email = isEmail ? contact.trim() : `${cleanUsername}@connectx.internal`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: cleanUsername,
              display_name: fullName,
              avatar_url: avatarUrl,
              bio: bio || "Creator & Explorer on ConnectX 🚀",
              phone: !isEmail ? contact.trim() : undefined,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Explicitly upsert profile to guarantee presence even if trigger is delayed
          const newProfile: Profile = {
            id: data.user.id,
            username: cleanUsername,
            username_normalized: cleanUsername,
            display_name: fullName,
            avatar_url: avatarUrl || null,
            bio: bio || null,
          };

          await supabase.from("profiles").upsert(newProfile);

          set({
            isAuthenticated: true,
            currentUser: profileToUser(newProfile),
            currentProfile: newProfile,
            isMfaRequired: false,
          });

          return { success: true };
        }
      } catch (err: unknown) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Signup failed.",
        };
      }
    }

    // Local Backend Mode Signup
    await new Promise((res) => setTimeout(res, 350));
    const backendRes = await localBackend.signup({
      contact,
      fullName,
      username: cleanUsername,
      password,
      avatarUrl,
      bio,
    });

    const newUser: User = backendRes.user || {
      ...mockCurrentUser,
      id: `usr-${Date.now()}`,
      displayName: fullName,
      username: cleanUsername,
      avatarUrl: avatarUrl || mockCurrentUser.avatarUrl,
      bio: bio || "Creator & Explorer on ConnectX 🚀",
    };

    const newProfile: Profile = backendRes.profile
      ? {
          id: backendRes.profile.id,
          username: backendRes.profile.username,
          display_name: backendRes.profile.display_name,
          avatar_url: backendRes.profile.avatar_url,
          bio: backendRes.profile.bio,
        }
      : {
          id: newUser.id,
          username: newUser.username,
          display_name: newUser.displayName,
          avatar_url: newUser.avatarUrl,
          bio: newUser.bio,
        };

    set({
      isAuthenticated: true,
      currentUser: newUser,
      currentProfile: newProfile,
    });

    return { success: true };
  },

  loginWithOAuth: async (provider) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
    const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
    const defaultOAuthUrl = env.supabaseUrl
      ? `${env.supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(`${origin}/`)}`
      : provider === "google"
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=connectx-client&response_type=token&redirect_uri=${encodeURIComponent(`${origin}/`)}&scope=openid%20email%20profile`
        : provider === "facebook"
          ? `https://www.facebook.com/v18.0/dialog/oauth?client_id=connectx-client&redirect_uri=${encodeURIComponent(`${origin}/`)}&scope=email,public_profile`
          : `https://appleid.apple.com/auth/authorize?client_id=connectx-client&response_type=code&redirect_uri=${encodeURIComponent(`${origin}/`)}&scope=name%20email`;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: `${origin}/`,
          },
        });

        if (error) {
          const message = error.message || "";
          const lowerMessage = message.toLowerCase();
          const isProviderDisabled =
            lowerMessage.includes("not enabled") ||
            lowerMessage.includes("unsupported provider") ||
            lowerMessage.includes("provider is not enabled") ||
            lowerMessage.includes("validation_failed");

          if (isProviderDisabled) {
            return {
              success: false,
              error: `${providerLabel} login is not enabled for this ConnectX project. Enable the provider in Supabase Auth → Providers, or continue with email/password.`,
            };
          }

          return { success: false, error: message || `${providerLabel} login is unavailable.` };
        }

        const targetUrl = data?.url || defaultOAuthUrl;
        return { success: true, url: targetUrl };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : `${providerLabel} login failed.`,
        };
      }
    }

    // Demo Mode: Mock successful OAuth login
    await new Promise((res) => setTimeout(res, 50));
    set({
      isAuthenticated: true,
      currentUser: mockCurrentUser,
      currentProfile: {
        id: mockCurrentUser.id,
        username: mockCurrentUser.username,
        display_name: mockCurrentUser.displayName,
        avatar_url: mockCurrentUser.avatarUrl,
      },
    });
    return { success: true, url: defaultOAuthUrl };
  },

  sendOtp: async (contact) => {
    const clean = contact.trim();
    if (isSupabaseConfigured) {
      const isEmail = clean.includes("@");
      const { error } = isEmail
        ? await supabase.auth.signInWithOtp({ email: clean })
        : await supabase.auth.signInWithOtp({ phone: clean });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    await new Promise((res) => setTimeout(res, 300));
    return { success: true };
  },

  verifyOtp: async (contact, code) => {
    const clean = contact.trim();
    if (isSupabaseConfigured) {
      const isEmail = clean.includes("@");
      const { data, error } = isEmail
        ? await supabase.auth.verifyOtp({ email: clean, token: code, type: "email" })
        : await supabase.auth.verifyOtp({ phone: clean, token: code, type: "sms" });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const userProfile: Profile = profile || {
          id: data.user.id,
          username: data.user.email?.split("@")[0] || "user",
          display_name: "Verified User",
        };

        set({
          isAuthenticated: true,
          currentUser: profileToUser(userProfile),
          currentProfile: userProfile,
          isMfaRequired: false,
        });

        return { success: true };
      }
    }

    // Demo Mode verification
    if (code.length === 6) {
      set({ isAuthenticated: true, isMfaRequired: false });
      return { success: true };
    }
    return { success: false, error: "Invalid verification code." };
  },

  verifyMfa: async (code: string) => {
    await new Promise((res) => setTimeout(res, 400));
    if (code.length === 6) {
      set({ isAuthenticated: true, isMfaRequired: false });
      return true;
    }
    return false;
  },

  resetPassword: async (identifier) => {

    const clean = identifier.trim();
    if (isSupabaseConfigured) {
      if (clean.includes("@")) {
        const { error } = await supabase.auth.resetPasswordForEmail(clean, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } else {
        const { error } = await supabase.auth.signInWithOtp({ phone: clean });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      }
    }
    await new Promise((res) => setTimeout(res, 200));
    return { success: true };
  },

  updateUserPassword: async (newPassword, contact) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }
    if (contact) {
      return await localBackend.updatePassword(contact, newPassword);
    }
    return { success: true };
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      await localBackend.logout();
    }
    set({
      isAuthenticated: false,
      currentUser: null,
      currentProfile: null,
      isMfaRequired: false,
    });
  },

  updateProfile: async (updates) => {
    const profile = get().currentProfile;
    if (!profile) return { success: false, error: "Not authenticated." };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) return { success: false, error: error.message };
    } else {
      await localBackend.updateProfile(profile.id, updates);
    }

    const updatedProfile = { ...profile, ...updates };
    set({
      currentProfile: updatedProfile,
      currentUser: profileToUser(updatedProfile),
    });

    return { success: true };
  },

  unlockAccount: () => set({ isAccountLocked: false, loginAttempts: 0 }),
  setRememberDevice: (remember) => set({ rememberDevice: remember }),
  clearError: () => set({ errorMessage: null }),
}));
