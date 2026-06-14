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
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const donationMode = process.env.DONATION_MODE ?? process.env.NEXT_PUBLIC_DONATION_MODE;
const turnstileEnabled = process.env.TURNSTILE_ENABLED === "true";
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;
const rateLimitProvider = process.env.RATE_LIMIT_PROVIDER ?? "memory";
const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const vercelEnv = process.env.VERCEL_ENV;
const strictPreviewSecurityEnv =
  process.env.REQUIRE_STRICT_PREVIEW_SECURITY_ENV === "true" || vercelEnv === "preview" || vercelEnv === "production";

const warnings = [];
const failures = [];

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
console.log(`NEXT_PUBLIC_SITE_URL: ${status(siteUrl)}`);
console.log(`NEXT_PUBLIC_ADMIN_DEMO_MODE: ${process.env.NEXT_PUBLIC_ADMIN_DEMO_MODE ?? "tanımsız (demo default)"}`);
console.log(`SITE_MAINTENANCE_MODE: ${process.env.SITE_MAINTENANCE_MODE ?? "tanımsız (false default)"}`);
console.log(`DONATION_MODE: ${donationMode ?? "tanımsız (online default)"}`);
console.log(`TURNSTILE_ENABLED: ${process.env.TURNSTILE_ENABLED ?? "tanımsız (false default)"}`);
console.log(`NEXT_PUBLIC_TURNSTILE_SITE_KEY: ${status(turnstileSiteKey)}`);
console.log(`TURNSTILE_SECRET_KEY: ${status(turnstileSecretKey)}`);
console.log(`RATE_LIMIT_PROVIDER: ${rateLimitProvider}`);
console.log(`UPSTASH_REDIS_REST_URL: ${status(upstashRestUrl)}`);
console.log(`UPSTASH_REDIS_REST_TOKEN: ${status(upstashRestToken)}`);
console.log(`VERCEL_ENV: ${vercelEnv ?? "tanımsız"}`);
console.log(`TEST_AUTH_EMAIL: ${status(process.env.TEST_AUTH_EMAIL)}`);
console.log(`TEST_AUTH_PASSWORD: ${status(process.env.TEST_AUTH_PASSWORD)}`);
console.log(`TEST_SUPER_ADMIN_EMAIL: ${status(process.env.TEST_SUPER_ADMIN_EMAIL)}`);
console.log(`TEST_SUPER_ADMIN_PASSWORD: ${status(process.env.TEST_SUPER_ADMIN_PASSWORD)}`);
console.log(`TEST_DONOR_EMAIL: ${status(process.env.TEST_DONOR_EMAIL)}`);
console.log(`TEST_DONOR_PASSWORD: ${status(process.env.TEST_DONOR_PASSWORD)}`);
console.log(`TEST_VOLUNTEER_EMAIL: ${status(process.env.TEST_VOLUNTEER_EMAIL)}`);
console.log(`TEST_VOLUNTEER_PASSWORD: ${status(process.env.TEST_VOLUNTEER_PASSWORD)}`);
console.log(`TEST_COORDINATOR_EMAIL: ${status(process.env.TEST_COORDINATOR_EMAIL)}`);
console.log(`TEST_COORDINATOR_PASSWORD: ${status(process.env.TEST_COORDINATOR_PASSWORD)}`);
console.log(`TEST_STAFF_EMAIL: ${status(process.env.TEST_STAFF_EMAIL)}`);
console.log(`TEST_STAFF_PASSWORD: ${status(process.env.TEST_STAFF_PASSWORD)}`);

if (!publicUrl || (!publishableKey && !anonKey)) {
  warnings.push("Public Supabase env eksik. Proje demo/mock modda çalışmaya devam eder.");
}

if (!secretKey && !serviceRoleKey) {
  warnings.push("Server-side secret/service role env eksik. Admin/service işlemleri gerçek backend bağlanana kadar devre dışı kalır.");
}

if (strictPreviewSecurityEnv && !siteUrl) {
  failures.push("Preview/production güvenlik kontrolünde NEXT_PUBLIC_SITE_URL tanımlı olmalıdır.");
}

if (turnstileEnabled && (!turnstileSiteKey || !turnstileSecretKey)) {
  const message = "TURNSTILE_ENABLED=true iken NEXT_PUBLIC_TURNSTILE_SITE_KEY ve TURNSTILE_SECRET_KEY birlikte tanımlanmalıdır.";
  if (strictPreviewSecurityEnv) failures.push(message);
  else warnings.push(message);
}

if (!turnstileEnabled && (turnstileSiteKey || turnstileSecretKey)) {
  warnings.push("Turnstile key değerleri var ancak TURNSTILE_ENABLED=true değil; widget render edilmeyecek.");
}

if (rateLimitProvider === "upstash" && (!upstashRestUrl || !upstashRestToken)) {
  const message = "RATE_LIMIT_PROVIDER=upstash iken UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN birlikte tanımlanmalıdır.";
  if (strictPreviewSecurityEnv) failures.push(message);
  else warnings.push(`${message} Local/dev ortamda memory fallback devreye girer.`);
}

if (strictPreviewSecurityEnv && rateLimitProvider !== "upstash") {
  warnings.push("Preview/production ortamında kalıcı rate limit için RATE_LIMIT_PROVIDER=upstash önerilir.");
}

if (strictPreviewSecurityEnv && donationMode === "whatsapp" && !process.env.DONATION_WHATSAPP_PHONE) {
  warnings.push("DONATION_MODE=whatsapp iken DONATION_WHATSAPP_PHONE doğrulanmalıdır.");
}

for (const warning of warnings) {
  console.log(`Uyarı: ${warning}`);
}

for (const failure of failures) {
  console.log(`Hata: ${failure}`);
}

if (failures.length > 0) {
  process.exit(1);
}
