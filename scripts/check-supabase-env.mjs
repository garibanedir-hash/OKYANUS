const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function status(value) {
  return value ? "var" : "yok";
}

console.log("Supabase env kontrolü");
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
