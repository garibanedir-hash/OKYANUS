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

function normalizeRole(roleOrAccountType) {
  if (!roleOrAccountType) return null;

  const normalized = String(roleOrAccountType).trim().toLowerCase();

  switch (normalized) {
    case "super_admin":
    case "super admin":
      return "super_admin";
    case "admin":
      return "admin";
    case "content_editor":
    case "content editor":
    case "içerik editörü":
    case "icerik editoru":
      return "content_editor";
    case "donation_manager":
    case "donation manager":
    case "bağış sorumlusu":
    case "bagis sorumlusu":
      return "donation_manager";
    case "volunteer_coordinator":
    case "volunteer coordinator":
    case "gönüllü koordinatörü":
    case "gonullu koordinatoru":
      return "volunteer_coordinator";
    case "reporting_manager":
    case "reporting manager":
    case "raporlama sorumlusu":
      return "reporting_manager";
    case "coordinator":
    case "koordinator":
    case "koordinatör":
      return "coordinator";
    case "staff":
    case "personnel":
    case "personel":
      return "staff";
    case "donor":
    case "bagisci":
    case "bağışçı":
      return "donor";
    case "volunteer":
    case "gonullu":
    case "gönüllü":
      return "volunteer";
    case "bağışçı + gönüllü":
    case "bagisci + gonullu":
    case "donor + volunteer":
      return "donor_volunteer";
    default:
      return null;
  }
}

function rolesFromValues(values) {
  return values.flatMap((value) => {
    const normalized = normalizeRole(value);

    if (normalized === "donor_volunteer") {
      return ["donor", "volunteer"];
    }

    return normalized ? [normalized] : [];
  });
}

function rolesFromMetadata(user) {
  const metadata = {
    ...(user?.user_metadata ?? {}),
    ...(user?.app_metadata ?? {})
  };

  const values = [];
  for (const key of ["roles", "role", "account_type", "accountType"]) {
    const value = metadata[key];
    if (Array.isArray(value)) values.push(...value.filter((item) => typeof item === "string"));
    if (typeof value === "string") values.push(value);
  }

  return rolesFromValues(values);
}

function getDefaultPanelPathForRoles(roleValues) {
  const roles = new Set(rolesFromValues(roleValues));

  if (roles.has("super_admin") || roles.has("admin")) return "/admin";
  if (roles.has("content_editor") || roles.has("donation_manager") || roles.has("volunteer_coordinator") || roles.has("reporting_manager")) return "/admin";
  if (roles.has("coordinator")) return "/koordinator";
  if (roles.has("staff")) return "/personel";
  if (roles.has("donor") && roles.has("volunteer")) return "/panel";
  if (roles.has("donor")) return "/panel/bagisci";
  if (roles.has("volunteer")) return "/panel/gonullu";

  return "/giris";
}

function mergeRoles(...roleGroups) {
  return Array.from(new Set(roleGroups.flat()));
}

const roleTestUsers = [
  {
    label: "super_admin",
    emailEnv: "TEST_SUPER_ADMIN_EMAIL",
    passwordEnv: "TEST_SUPER_ADMIN_PASSWORD",
    expectedRoles: ["super_admin"],
    expectedAccountTypes: ["admin"],
    expectedRedirect: "/admin"
  },
  {
    label: "donor",
    emailEnv: "TEST_DONOR_EMAIL",
    passwordEnv: "TEST_DONOR_PASSWORD",
    expectedRoles: ["donor"],
    expectedAccountTypes: ["donor"],
    expectedRedirect: "/panel/bagisci"
  },
  {
    label: "volunteer",
    emailEnv: "TEST_VOLUNTEER_EMAIL",
    passwordEnv: "TEST_VOLUNTEER_PASSWORD",
    expectedRoles: ["volunteer"],
    expectedAccountTypes: ["volunteer"],
    expectedRedirect: "/panel/gonullu"
  },
  {
    label: "coordinator",
    emailEnv: "TEST_COORDINATOR_EMAIL",
    passwordEnv: "TEST_COORDINATOR_PASSWORD",
    expectedRoles: ["coordinator"],
    expectedAccountTypes: ["coordinator"],
    expectedRedirect: "/koordinator"
  },
  {
    label: "staff",
    emailEnv: "TEST_STAFF_EMAIL",
    passwordEnv: "TEST_STAFF_PASSWORD",
    expectedRoles: ["staff"],
    expectedAccountTypes: ["staff"],
    expectedRedirect: "/personel"
  }
];

async function readOwnProfile(supabase, userId) {
  return supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", userId)
    .maybeSingle();
}

async function readOwnAccount(supabase, userId) {
  return supabase
    .from("user_accounts")
    .select("id, auth_user_id, account_type, role, status")
    .eq("auth_user_id", userId)
    .maybeSingle();
}

const loadedEnvFile = loadLocalEnv();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Supabase authenticated role smoke test");
console.log(`Env dosyası: ${loadedEnvFile ?? "bulunamadı"}`);

if (!url || !key) {
  console.log("Auth smoke test atlandı: public Supabase env eksik.");
  process.exit(0);
}

const configuredUsers = roleTestUsers.filter((testUser) => process.env[testUser.emailEnv] && process.env[testUser.passwordEnv]);

if (!configuredUsers.length) {
  console.log("Auth smoke test atlandı: rol bazlı test kullanıcı env değerleri tanımlı değil.");
  console.log("Test e-posta/şifreleri yalnızca .env.local veya güvenli staging env içinde tutulmalı; Git'e eklenmemelidir.");
  process.exit(0);
}

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const summary = {
  successfulLogin: 0,
  skippedUser: roleTestUsers.length - configuredUsers.length,
  roleMismatch: 0,
  profileMissing: 0,
  accountMissing: 0,
  error: 0
};

for (const testUser of roleTestUsers) {
  const email = process.env[testUser.emailEnv];
  const password = process.env[testUser.passwordEnv];

  if (!email || !password) {
    console.log(`${testUser.label}: atlandı (${testUser.emailEnv}/${testUser.passwordEnv} tanımlı değil).`);
    continue;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError || !signInData.user) {
    console.log(`${testUser.label}: hata - login başarısız.`);
    summary.error += 1;
    await supabase.auth.signOut();
    continue;
  }

  summary.successfulLogin += 1;

  const [profileResult, accountResult] = await Promise.all([
    readOwnProfile(supabase, signInData.user.id),
    readOwnAccount(supabase, signInData.user.id)
  ]);

  if (profileResult.error) {
    console.log(`${testUser.label}: hata - profiles read-only sorgusu başarısız (${profileResult.error.code ?? "no-code"}).`);
    summary.error += 1;
  }

  if (accountResult.error) {
    console.log(`${testUser.label}: hata - user_accounts read-only sorgusu başarısız (${accountResult.error.code ?? "no-code"}).`);
    summary.error += 1;
  }

  if (!profileResult.data) {
    console.log(`${testUser.label}: profil bulunamadı.`);
    summary.profileMissing += 1;
  }

  if (!accountResult.data) {
    console.log(`${testUser.label}: account bulunamadı.`);
    summary.accountMissing += 1;
  }

  const metadataRoles = rolesFromMetadata(signInData.user);
  const profileRoles = profileResult.data ? rolesFromValues([profileResult.data.role]) : [];
  const accountRoles = accountResult.data ? rolesFromValues([accountResult.data.role, accountResult.data.account_type]) : [];
  const actualRoles = mergeRoles(metadataRoles, profileRoles, accountRoles);
  const actualRedirect = getDefaultPanelPathForRoles(actualRoles);
  const expectedRoleMatched = testUser.expectedRoles.every((role) => actualRoles.includes(role));
  const expectedAccountTypeMatched = accountResult.data
    ? testUser.expectedAccountTypes.some((accountType) => normalizeRole(accountResult.data.account_type) === accountType)
    : false;

  if (!expectedRoleMatched || !expectedAccountTypeMatched || actualRedirect !== testUser.expectedRedirect) {
    console.log(
      `${testUser.label}: rol uyuşmazlığı - beklenen route ${testUser.expectedRedirect}, hesap route ${actualRedirect}.`
    );
    summary.roleMismatch += 1;
  } else {
    console.log(`${testUser.label}: OK - login/profile/account/route doğrulandı (${actualRedirect}).`);
  }

  await supabase.auth.signOut();
}

console.log("Authenticated role smoke test özeti");
console.log(`Başarılı login: ${summary.successfulLogin}`);
console.log(`Atlanan kullanıcı: ${summary.skippedUser}`);
console.log(`Rol uyuşmazlığı: ${summary.roleMismatch}`);
console.log(`Profil bulunamadı: ${summary.profileMissing}`);
console.log(`Account bulunamadı: ${summary.accountMissing}`);
console.log(`Hata: ${summary.error}`);
console.log("Authenticated role smoke test tamamlandı. Write/insert/update/delete yapılmadı.");

if (summary.roleMismatch > 0 || summary.profileMissing > 0 || summary.accountMissing > 0 || summary.error > 0) {
  process.exit(1);
}
