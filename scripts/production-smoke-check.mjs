const baseUrlRaw = process.env.PRODUCTION_SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

const routeChecks = [
  { path: "/", keywords: ["<main", "Okyanus"] },
  { path: "/hukuki", keywords: ["<main", "Hukuki"] },
  { path: "/bagis-yap", keywords: ["<main", "Bagis", "Bağış"] },
  { path: "/kurban/bagis", keywords: ["<main", "Kurban"] },
  { path: "/yetim-hamiligi/basvuru", keywords: ["<main", "Yetim"] },
  { path: "/iletisim", keywords: ["<main", "Iletisim", "İletişim"] },
  { path: "/gonullu-ol", keywords: ["<main", "Gonullu", "Gönüllü"] },
  { path: "/robots.txt", keywords: ["User-agent", "Sitemap"] },
  { path: "/sitemap.xml", keywords: ["<urlset", "<loc>"] }
];

function normalizeBaseUrl(value) {
  if (!value.trim()) return null;

  try {
    const url = new URL(value.trim());
    url.pathname = url.pathname.replace(/\/+$/, "");
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

function buildUrl(baseUrl, path) {
  const next = new URL(baseUrl.toString());
  next.pathname = `${baseUrl.pathname}${path}`.replace(/\/{2,}/g, "/");
  return next;
}

function bodyHasKeyword(body, keywords) {
  return keywords.some((keyword) => body.includes(keyword));
}

const baseUrl = normalizeBaseUrl(baseUrlRaw);

if (!baseUrl) {
  console.log("Production smoke check SKIPPED: PRODUCTION_SMOKE_BASE_URL veya NEXT_PUBLIC_SITE_URL tanimli degil/gecersiz.");
  console.log("Bu script secret kullanmaz, write yapmaz ve sadece public HTTP route status/body kontrolu yapar.");
  process.exit(0);
}

console.log(`Production smoke check basliyor: ${baseUrl.origin}${baseUrl.pathname}`);
console.log("Sadece GET yapilir; Supabase DB, Storage write veya secret kullanimi yoktur.");

const summary = {
  ok: 0,
  failed: 0
};

for (const check of routeChecks) {
  const url = buildUrl(baseUrl, check.path);

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: {
        "user-agent": "okyanus-production-smoke-check/1.0"
      }
    });

    const body = await response.text();
    const statusOk = response.status >= 200 && response.status < 300;
    const keywordOk = bodyHasKeyword(body, check.keywords);

    if (statusOk && keywordOk) {
      console.log(`${check.path}: OK (${response.status})`);
      summary.ok += 1;
      continue;
    }

    console.log(
      `${check.path}: FAIL (status=${response.status}, keyword=${keywordOk ? "ok" : "missing"}, url=${url.toString()})`
    );
    summary.failed += 1;
  } catch (error) {
    console.log(`${check.path}: FAIL (request_error=${error instanceof Error ? error.message : "unknown"})`);
    summary.failed += 1;
  }
}

console.log("Production smoke check ozeti");
console.log(`OK: ${summary.ok}`);
console.log(`Failed: ${summary.failed}`);

if (summary.failed > 0) {
  process.exit(1);
}

console.log("Production smoke check tamamlandi.");
