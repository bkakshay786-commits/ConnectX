import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export { supabase, isSupabaseConfigured };

/**
 * Returns the singleton browser Supabase client.
 * Reuses the existing client instance in @/lib/supabase.
 */
export const createClient = () => supabase;
