import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return {
    url,
    key,
    isConfigured: Boolean(url && key)
  };
}

export function createSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const config = getSupabasePublicConfig();

  if (!config.isConfigured || !config.url || !config.key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("Supabase public env eksik. Uygulama demo modda çalışmaya devam eder.");
    }
    return null;
  }

  return createBrowserClient<Database>(config.url, config.key);
}
