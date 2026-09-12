const useLocalBackendFlag = import.meta.env.VITE_USE_LOCAL_BACKEND;

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "",
  useMocks: import.meta.env.VITE_USE_MOCKS !== "false",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
  useLocalBackend: useLocalBackendFlag === "true",
  isSupabaseConfigured: Boolean(
    (useLocalBackendFlag === undefined || useLocalBackendFlag === "false") &&
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ),
} as const;


