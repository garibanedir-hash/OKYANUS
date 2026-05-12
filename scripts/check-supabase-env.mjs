import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

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
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function status(value) {
  return value ? "var" : "yok";
}

console.log("Supabase env kontrolü");
console.log(`Env dosyası: ${loadedEnvFile ?? "bulunamadı"}`);
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${status(publicUrl)}`);
console.log(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${status(publishableKey)}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${status(anonKey)}`);
console.log(`SUPABASE_SECRET_KEY: ${status(secretKey)}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${status(serviceRoleKey)}`);
console.log(`NEXT_PUBLIC_ADMIN_DEMO_MODE: ${process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE ?? "tanımsız (demo default)"}`);
console.log(`SITE_MAINTENANCE_MODE: ${process.env.SITE_MAINTENANCE_MODE ?? "tanımsız (false default)"}`);

if (!publicUrl || (!publishableKey && !anonKey)) {
  console.log("Public Supabase env eksik. Proje demo/mock modda çalışmaya devam eder.");
}

if (!secretKey && !serviceRoleKey) {
  console.log("Server-side secret/service role env eksik. Admin/service işlemleri gerçek backend bağlanana kadar devre dışı kalır.");
}
