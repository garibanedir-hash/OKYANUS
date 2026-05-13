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

function isRlsBlocked(error) {
  return /permission denied|row-level security|not authorized|JWT/i.test(error?.message ?? "");
}

async function readOnlyCheck(supabase, table, columns = "*") {
  const { error } = await supabase.from(table).select(columns).limit(1);

  if (!error) {
    console.log(`${table}: OK - authenticated read test completed`);
    return "ok";
  }

  if (isRlsBlocked(error)) {
    console.log(`${table}: protected/forbidden for this test user`);
    return "protected";
  }

  console.log(`${table}: read-only test warning (${error.code ?? "no-code"}) ${error.message}`);
  return "warning";
}

const loadedEnvFile = loadLocalEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.TEST_AUTH_EMAIL;
const password = process.env.TEST_AUTH_PASSWORD;

console.log("Supabase authenticated smoke test");
console.log(`Env dosyası: ${loadedEnvFile ?? "bulunamadı"}`);

if (!url || !key) {
  console.log("Auth smoke test atlandı: public Supabase env eksik.");
  process.exit(0);
}

if (!email || !password) {
  console.log("Auth smoke test atlandı: TEST_AUTH_EMAIL / TEST_AUTH_PASSWORD tanımlı değil.");
  console.log("Gerçek değerleri yalnızca .env.local veya güvenli staging env içinde tutun; Git'e eklemeyin.");
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

if (signInError || !signInData.user) {
  console.log(`Auth smoke test başarısız: ${signInError?.message ?? "user bulunamadı"}`);
  process.exit(1);
}

console.log("Session: OK - test kullanıcısı ile giriş yapıldı.");
console.log(`User id: ${signInData.user.id ? "var" : "yok"}`);

const summary = {
  ok: 0,
  protected: 0,
  warning: 0
};

for (const table of ["profiles", "user_accounts", "role_permissions", "donor_profiles", "volunteer_profiles", "portal_notifications"]) {
  summary[await readOnlyCheck(supabase, table)] += 1;
}

await supabase.auth.signOut();

console.log("Authenticated smoke test özeti");
console.log(`OK: ${summary.ok}`);
console.log(`Protected/forbidden: ${summary.protected}`);
console.log(`Warning: ${summary.warning}`);
console.log("Authenticated smoke test tamamlandı. Write/insert/update/delete yapılmadı.");

if (summary.warning > 0) {
  process.exit(1);
}
