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
const keySource = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ? "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    : "none";

const publicReadTables = [
  { table: "projects" },
  { table: "news_posts" },
  { table: "reports" },
  { table: "activity_areas" },
  { table: "site_settings" },
  { table: "legal_pages" },
  { table: "qurban_campaigns", okLabel: "public active read" },
  { table: "sponsorship_programs", okLabel: "public active read" }
];
const restrictedTables = [
  "donations",
  "donation_transactions",
  "donation_receipts",
  "volunteer_applications",
  "contact_messages",
  "internal_tasks",
  "task_comments",
  "internal_conversations",
  "internal_messages",
  "message_read_receipts",
  "export_logs",
  "user_accounts",
  "donor_profiles",
  "volunteer_profiles",
  "sponsored_children",
  "sponsorships",
  "portal_notifications",
  "volunteer_events",
  "event_applications",
  "role_permissions",
  "panel_access_rules",
  "coordinator_assignments",
  "staff_assignments",
  "profiles",
  "admin_roles",
  "audit_logs",
  "media_assets",
  "qurban_orders",
  "qurban_delegations",
  "qurban_shares",
  "qurban_operations",
  "qurban_distribution_logs",
  "qurban_status_logs",
  "qurban_notifications",
  "qurban_exports",
  "orphan_profiles",
  "sponsorship_applications",
  "sponsorship_matches",
  "sponsorship_payments",
  "orphan_updates",
  "orphan_sponsorship_notes",
  "orphan_assignments",
  "sponsorship_notifications",
  "sponsorship_exports",
  "sponsorship_status_logs"
];

function isMissingTable(error) {
  return error?.code === "42P01" || /does not exist|schema cache/i.test(error?.message ?? "");
}

function isRlsBlocked(error) {
  return /permission denied|row-level security|not authorized|JWT/i.test(error?.message ?? "");
}

async function checkTable(supabase, table, expectedPublic, okLabel = "public read") {
  const { error } = await supabase.from(table).select("*").limit(1);

  if (!error) {
    if (expectedPublic) {
      console.log(`${table}: OK - ${okLabel}`);
      return "publicOk";
    }

    console.log(`${table}: FAIL / SECURITY WARNING - hassas tablo anon/public key ile okunabiliyor`);
    return "securityWarning";
  }

  if (isMissingTable(error)) {
    console.log(`${table}: tablo bulunamadı; migration uygulanmamış olabilir.`);
    return "missing";
  }

  if (isRlsBlocked(error)) {
    if (expectedPublic) {
      console.log(`${table}: RLS/permission engeli (public read için policy gerekebilir)`);
      return "publicBlocked";
    }

    console.log(`${table}: OK - protected`);
    return "protectedOk";
  }

  console.log(`${table}: kontrol hatası (${error.code ?? "no-code"}) ${error.message}`);
  return "error";
}

async function reportPublicContentCount(supabase, table, filter) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });

  if (filter?.eq) {
    query = query.eq(filter.eq.column, filter.eq.value);
  }

  if (filter?.in) {
    query = query.in(filter.in.column, filter.in.values);
  }

  const { count, error } = await query;

  if (error) {
    console.log(`${table} count: okunamadı (${error.code ?? "no-code"})`);
    return;
  }

  console.log(`${table} count: ${count ?? 0}`);
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
console.log(`Smoke test key kaynağı: ${keySource}`);
console.log("Supabase read-only smoke test başlıyor. Write/insert/update/delete yapılmayacak.");

const summary = {
  publicOk: 0,
  protectedOk: 0,
  securityWarning: 0,
  missing: 0,
  publicBlocked: 0,
  error: 0
};

for (const item of publicReadTables) {
  summary[await checkTable(supabase, item.table, true, item.okLabel)] += 1;
}

console.log("Public content kayıt sayıları");
await reportPublicContentCount(supabase, "projects", { in: { column: "status", values: ["active", "completed"] } });
await reportPublicContentCount(supabase, "news_posts", { eq: { column: "status", value: "published" } });
await reportPublicContentCount(supabase, "reports", { eq: { column: "status", value: "published" } });
await reportPublicContentCount(supabase, "qurban_campaigns", { eq: { column: "status", value: "active" } });
await reportPublicContentCount(supabase, "sponsorship_programs", { eq: { column: "status", value: "active" } });

for (const table of restrictedTables) {
  summary[await checkTable(supabase, table, false)] += 1;
}

console.log("Smoke test özeti");
console.log(`Public read OK: ${summary.publicOk}`);
console.log(`Protected OK: ${summary.protectedOk}`);
console.log(`Security warning: ${summary.securityWarning}`);
console.log(`Missing table: ${summary.missing}`);
console.log(`Public blocked: ${summary.publicBlocked}`);
console.log(`Diğer hata: ${summary.error}`);
console.log("Supabase smoke test tamamlandı.");

if (summary.securityWarning > 0) {
  process.exit(1);
}
