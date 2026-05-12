import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  const entries = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7).trim() : trimmed;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, "");
    }

    if (key) entries[key] = value.replaceAll("\\n", "\n");
  }

  return entries;
}

function loadLocalEnv() {
  const candidates = [".env.local", ".env"];
  const found = candidates.find((file) => existsSync(join(process.cwd(), file)));

  if (!found) return null;

  const parsed = parseEnv(readFileSync(join(process.cwd(), found), "utf8"));
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return found;
}

const loadedEnvFile = loadLocalEnv();
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
  console.log(`Env dosyası: ${loadedEnvFile ?? "bulunamadı"}`);
  console.log("Supabase smoke test atlandı: public env eksik. Proje demo/mock modda çalışmaya devam eder.");
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log(`Env dosyası: ${loadedEnvFile ?? "bulunamadı"}`);
console.log("Supabase read-only smoke test başlıyor. Write/insert/update/delete yapılmayacak.");

for (const table of publicReadTables) {
  await checkTable(supabase, table, true);
}

for (const table of restrictedTables) {
  await checkTable(supabase, table, false);
}

console.log("Supabase smoke test tamamlandı.");
