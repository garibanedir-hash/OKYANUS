import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type DataSource = "supabase" | "demo";

export type RepositoryResult<T> = {
  data: T;
  source: DataSource;
};

let readOnlyClient: SupabaseClient | null | undefined;

export function createSupabaseReadOnlyClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (readOnlyClient === undefined) {
    readOnlyClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  return readOnlyClient;
}

export function createReadOnlyAbortSignal(timeoutMs = 2500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout)
  };
}

export function logReadOnlyFallback(context: string, error?: { code?: string } | null) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.warn(`[read-only:${context}] Supabase read failed; demo fallback used.`, {
    code: error?.code ?? "no-code"
  });
}
