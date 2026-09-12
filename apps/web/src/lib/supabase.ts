/**
 * ConnectX Supabase Client & Connection Health Check.
 *
 * Configures the official `@supabase/supabase-js` client using public browser-safe
 * publishable credentials (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).
 *
 * SECURITY:
 * Never include the Supabase service_role key, database secrets, or backend passwords here.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/app/config/env";
import type { Database } from "@/types/database.types";

const supabaseUrl = env.supabaseUrl;
const supabasePublishableKey = env.supabasePublishableKey;

export const isSupabaseConfigured = env.isSupabaseConfigured;
export const isLocalBackendEnabled = env.useLocalBackend;

// Graceful fallback URL & key for local/build environment prior to user configuring .env
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder";

/**
 * Singleton Supabase Client instance.
 * Configured with automatic token refresh, local storage session persistence, and URL session detection.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabasePublishableKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "connectx-auth-session",
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export interface SupabaseHealthCheckResult {
  connected: boolean;
  configured: boolean;
  sessionActive: boolean;
  error?: string;
  url?: string;
}

/**
 * Safe connection verification check that tests client readiness and Supabase Auth connectivity.
 */
export async function checkSupabaseConnection(): Promise<SupabaseHealthCheckResult> {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      configured: false,
      sessionActive: false,
      error: "Supabase credentials are not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in apps/web/.env.",
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return {
        connected: false,
        configured: true,
        sessionActive: false,
        error: error.message,
        url: supabaseUrl,
      };
    }

    return {
      connected: true,
      configured: true,
      sessionActive: Boolean(data.session),
      url: supabaseUrl,
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      sessionActive: false,
      error: err instanceof Error ? err.message : "Unknown connection failure",
      url: supabaseUrl,
    };
  }
}
