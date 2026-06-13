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

function getProjectRef(url) {
  try {
    return new URL(url).hostname.split(".")[0] ?? "";
  } catch {
    return "";
  }
}

function isProbablyProductionSite(siteUrl) {
  if (!siteUrl) return false;

  try {
    const hostname = new URL(siteUrl).hostname.toLowerCase();
    return !(
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local") ||
      hostname.includes("staging") ||
      hostname.includes("preview") ||
      hostname.includes("test") ||
      hostname.endsWith(".vercel.app")
    );
  } catch {
    return false;
  }
}

function isMissingTable(error) {
  return error?.code === "42P01" || /does not exist|schema cache/i.test(error?.message ?? "");
}

function isAccessBlocked(error) {
  return /permission denied|row-level security|not authorized|unauthorized|JWT|violates row-level security/i.test(error?.message ?? "");
}

function isConstraintFailure(error) {
  return /not-null|null value|invalid input value|violates check constraint|violates foreign key|violates unique/i.test(error?.message ?? "");
}

function marker() {
  return `anon-negative-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function securityPayload(table, id) {
  const metadata = { negativeTest: true, marker: id, script: "anon-write-negative-test" };

  const payloads = {
    payment_intents: {
      context_type: "general_donation",
      donor_name: "Anon Negative Test",
      donor_email: `${id}@example.invalid`,
      amount: 1,
      currency: "TRY",
      provider: "manual",
      status: "pending",
      metadata
    },
    payment_events: {
      event_type: "created",
      new_status: "pending",
      provider: "manual",
      provider_event_id: id,
      raw_event_summary: metadata,
      actor_role: "anon_negative_test"
    },
    payment_provider_events: {
      provider: "paytr",
      provider_event_id: id,
      event_type: "callback",
      signature_verified: false,
      payload_summary: metadata
    },
    receipts: {
      context_type: "general_donation",
      donor_name: "Anon Negative Test",
      donor_email: `${id}@example.invalid`,
      amount: 1,
      currency: "TRY",
      status: "pending",
      metadata
    },
    manual_receipts: {
      donor_name: "Anon Negative Test",
      amount: 1,
      currency: "TRY",
      metadata
    },
    manual_receipt_events: {
      event_type: "negative_test",
      actor_role: "anon_negative_test",
      metadata
    },
    notification_queue: {
      recipient_email: `${id}@example.invalid`,
      channel: "email",
      template_key: "negative_test",
      payload: metadata,
      status: "pending"
    },
    project_activity_events: {
      event_type: "negative_test",
      actor_role: "anon_negative_test",
      metadata
    },
    site_cookie_consents: {
      visitor_id: id,
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      consent_version: "negative-test",
      metadata
    },
    contact_messages: {
      full_name: "Anon Negative Test",
      email: `${id}@example.invalid`,
      subject: "Negative test",
      message: "Direct anon insert should remain blocked unless explicitly allowed.",
      consent_metadata: metadata
    },
    volunteer_applications: {
      full_name: "Anon Negative Test",
      email: `${id}@example.invalid`,
      interest_area: "Negative test",
      consent_metadata: metadata
    },
    sponsorship_applications: {
      applicant_name: "Anon Negative Test",
      applicant_email: `${id}@example.invalid`,
      applicant_phone: "+905300000000",
      requested_amount: 1,
      currency: "TRY",
      support_period: "monthly",
      source: "negative_test",
      consent_metadata: metadata
    },
    projects: {
      slug: id,
      title: "Anon Negative Test",
      summary: "Direct anon write must be blocked.",
      description: "Direct anon write must be blocked.",
      category: "negative_test",
      status: "draft",
      metadata
    },
    news_posts: {
      slug: id,
      title: "Anon Negative Test",
      category: "negative_test",
      summary: "Direct anon write must be blocked.",
      content: "Direct anon write must be blocked.",
      status: "draft"
    }
  };

  return payloads[table] ?? metadata;
}

async function cleanupRow(supabase, table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  return error;
}

async function checkProtectedRead(supabase, table) {
  const { error } = await supabase.from(table).select("id").limit(1);

  if (!error) {
    console.log(`${table} read: FAIL / SECURITY WARNING - anon key ile okunabiliyor`);
    return "securityWarning";
  }

  if (isMissingTable(error)) {
    console.log(`${table} read: tablo yok veya migration eksik`);
    return "missing";
  }

  if (isAccessBlocked(error)) {
    console.log(`${table} read: OK - blocked`);
    return "blockedOk";
  }

  console.log(`${table} read: INCONCLUSIVE (${error.code ?? "no-code"}) ${error.message}`);
  return "inconclusive";
}

async function checkProtectedInsert(supabase, table) {
  const id = marker();
  const payload = securityPayload(table, id);
  const { data, error } = await supabase.from(table).insert(payload).select("id").limit(1);

  if (!error) {
    const insertedId = data?.[0]?.id;
    console.log(`${table} insert: FAIL / SECURITY WARNING - anon key ile insert başarılı${insertedId ? ` (${insertedId})` : ""}`);

    if (insertedId) {
      const cleanupError = await cleanupRow(supabase, table, insertedId);
      if (cleanupError) {
        console.log(`${table} cleanup: manuel temizlik gerekli (${cleanupError.message})`);
      } else {
        console.log(`${table} cleanup: anon delete ile temizlendi`);
      }
    }

    return "securityWarning";
  }

  if (isMissingTable(error)) {
    console.log(`${table} insert: tablo yok veya migration eksik`);
    return "missing";
  }

  if (isAccessBlocked(error)) {
    console.log(`${table} insert: OK - blocked`);
    return "blockedOk";
  }

  if (isConstraintFailure(error)) {
    console.log(`${table} insert: INCONCLUSIVE - RLS yerine constraint hata verdi (${error.code ?? "no-code"})`);
    return "inconclusive";
  }

  console.log(`${table} insert: INCONCLUSIVE (${error.code ?? "no-code"}) ${error.message}`);
  return "inconclusive";
}

async function checkPrivateBucketUpload(supabase, bucket) {
  const path = `negative-tests/${marker()}.txt`;
  const { error } = await supabase.storage.from(bucket).upload(path, new Blob(["negative test"]), {
    contentType: "text/plain",
    upsert: false
  });

  if (!error) {
    console.log(`${bucket} upload: FAIL / SECURITY WARNING - anon upload başarılı (${path})`);
    const { error: cleanupError } = await supabase.storage.from(bucket).remove([path]);
    if (cleanupError) {
      console.log(`${bucket} cleanup: manuel temizlik gerekli (${cleanupError.message})`);
    } else {
      console.log(`${bucket} cleanup: anon remove ile temizlendi`);
    }
    return "securityWarning";
  }

  if (isAccessBlocked(error) || /not found|not exist/i.test(error.message ?? "")) {
    console.log(`${bucket} upload: OK - blocked/protected`);
    return "blockedOk";
  }

  console.log(`${bucket} upload: INCONCLUSIVE (${error.statusCode ?? error.status ?? "no-status"}) ${error.message}`);
  return "inconclusive";
}

const loadedEnvFile = loadLocalEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const allowRun = process.env.REQUIRE_STAGING_NEGATIVE_TESTS === "true";

console.log(`Env dosyası: ${loadedEnvFile ?? "bulunamadı"}`);

if (!allowRun) {
  console.log("Anon write negative test SKIPPED: REQUIRE_STAGING_NEGATIVE_TESTS=true verilmedi. Hiçbir write/delete denemesi yapılmadı.");
  process.exit(0);
}

if (!url || !key) {
  console.log("Anon write negative test durduruldu: Supabase public env eksik.");
  process.exit(1);
}

const projectRef = getProjectRef(url);
const allowlist = (process.env.NEGATIVE_TEST_ALLOWLIST_PROJECT_REF ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

if (!projectRef || !allowlist.includes(projectRef)) {
  console.log(`Anon write negative test durduruldu: project ref '${projectRef || "unknown"}' NEGATIVE_TEST_ALLOWLIST_PROJECT_REF içinde değil.`);
  process.exit(1);
}

if (isProbablyProductionSite(process.env.NEXT_PUBLIC_SITE_URL)) {
  console.log(`Anon write negative test durduruldu: NEXT_PUBLIC_SITE_URL production gibi görünüyor (${process.env.NEXT_PUBLIC_SITE_URL}).`);
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

console.log(`Anon write negative test başlıyor. Project ref: ${projectRef}. Bu komut staging/preview cleanup planı dışında çalıştırılmamalıdır.`);

const protectedReads = [
  "payment_intents",
  "receipts",
  "manual_receipts",
  "payment_provider_events",
  "notification_queue",
  "project_activity_events",
  "profiles",
  "user_accounts",
  "admin_roles",
  "site_cookie_consents"
];

const protectedInserts = [
  "payment_intents",
  "payment_events",
  "payment_provider_events",
  "receipts",
  "manual_receipts",
  "manual_receipt_events",
  "notification_queue",
  "project_activity_events",
  "site_cookie_consents",
  "contact_messages",
  "volunteer_applications",
  "sponsorship_applications",
  "projects",
  "news_posts"
];

const privateBuckets = ["receipts-private", "manual-receipts-private"];

const summary = {
  blockedOk: 0,
  securityWarning: 0,
  missing: 0,
  inconclusive: 0
};

for (const table of protectedReads) {
  summary[await checkProtectedRead(supabase, table)] += 1;
}

for (const table of protectedInserts) {
  summary[await checkProtectedInsert(supabase, table)] += 1;
}

for (const bucket of privateBuckets) {
  summary[await checkPrivateBucketUpload(supabase, bucket)] += 1;
}

console.log("Anon write negative test özeti");
console.log(`Blocked OK: ${summary.blockedOk}`);
console.log(`Security warning: ${summary.securityWarning}`);
console.log(`Missing: ${summary.missing}`);
console.log(`Inconclusive: ${summary.inconclusive}`);

if (summary.securityWarning > 0) {
  process.exit(1);
}

console.log("Anon write negative test tamamlandı. Inconclusive satırlar varsa tablo policy/constraint sırası manuel incelenmelidir.");
