import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const publicReadTables = ["projects", "news_posts", "reports", "activity_areas", "site_settings", "legal_pages"];
const restrictedTables = [
  "donations",
  "volunteer_applications",
  "contact_messages",
  "internal_tasks",
  "internal_messages",
  "export_logs",
  "user_accounts",
  "donor_profiles",
  "volunteer_profiles",
  "sponsored_children",
  "sponsorships",
  "role_permissions",
  "panel_access_rules"
];

function isMissingTable(error) {
  return error?.code === "42P01" || /does not exist|schema cache/i.test(error?.message ?? "");
}

function isRlsBlocked(error) {
  return /permission denied|row-level security|not authorized|JWT/i.test(error?.message ?? "");
}

async function checkTable(supabase, table, expectedPublic) {
  const { error } = await supabase.from(table).select("*").limit(1);

  if (!error) {
    console.log(`${table}: okunabilir${expectedPublic ? "" : " (UYARI: public kapalı olması beklenir)"}`);
    return;
  }

  if (isMissingTable(error)) {
    console.log(`${table}: tablo bulunamadı; migration uygulanmamış olabilir.`);
    return;
  }

  if (isRlsBlocked(error)) {
    console.log(`${table}: RLS/permission engeli${expectedPublic ? " (public read için policy gerekebilir)" : " (beklenen güvenlik davranışı)"}`);
    return;
  }

  console.log(`${table}: kontrol hatası (${error.code ?? "no-code"}) ${error.message}`);
}

if (!url || !key) {
  console.log("Supabase smoke test atlandı: public env eksik. Proje demo/mock modda çalışmaya devam eder.");
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log("Supabase read-only smoke test başlıyor. Write/insert/update/delete yapılmayacak.");

for (const table of publicReadTables) {
  await checkTable(supabase, table, true);
}

for (const table of restrictedTables) {
  await checkTable(supabase, table, false);
}

console.log("Supabase smoke test tamamlandı.");
