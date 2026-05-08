// GÜVENLİK NOTU:
// Bu dosya client componentlerde asla import edilmemelidir.
// SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY yalnızca server-side işlemler için kullanılmalıdır.
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    console.info("Supabase admin env eksik. Server-side admin işlemler demo modda devre dışıdır.");
    return null;
  }

  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
