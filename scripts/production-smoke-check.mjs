const baseUrlRaw = process.env.PRODUCTION_SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

const publicRouteChecks = [
  { path: "/", keywords: ["<main", "Okyanus"] },
  { path: "/hakkimizda", keywords: ["<main", "Hakkımızda"] },
  { path: "/projeler", keywords: ["<main", "Projeler"] },
  { path: "/projeler/bir-koli-bir-umut", keywords: ["<main", "Bir Koli Bir Umut"], expectWhatsappTarget: true },
  { path: "/faaliyetler", keywords: ["<main", "Faaliyet"] },
  { path: "/kurban", keywords: ["<main", "Kurban"] },
  { path: "/kurban/bagis", keywords: ["<main", "Kurban", "WhatsApp", "KVKK"], expectWhatsappText: true },
  { path: "/yetim-hamiligi", keywords: ["<main", "Yetim"] },
  { path: "/yetim-hamiligi/basvuru", keywords: ["<main", "Yetim", "WhatsApp", "KVKK"], expectWhatsappText: true },
  { path: "/bagis-yap", keywords: ["<main", "Bağış", "WhatsApp", "KVKK"], expectWhatsappText: true },
  { path: "/gonullu-ol", keywords: ["<main", "Gönüllü"] },
  { path: "/iletisim", keywords: ["<main", "İletişim"] },
  { path: "/seffaflik", keywords: ["<main", "Şeffaflık"] },
  { path: "/faaliyet-raporlari", keywords: ["<main", "Faaliyet Raporları"] },
  { path: "/hukuki", keywords: ["<main", "Hukuki"] },
  { path: "/robots.txt", keywords: ["User-agent", "Sitemap"], skipForbiddenText: true },
  { path: "/sitemap.xml", keywords: ["<urlset", "<loc>"], skipForbiddenText: true },
  { path: "/admin", expectRedirect: true, locationIncludes: "/admin/giris", skipForbiddenText: true }
];

const legalRouteChecks = [
  { path: "/hukuki/kvkk-aydinlatma-metni", keywords: ["<main", "KVKK Aydınlatma Metni"] },
  { path: "/hukuki/acik-riza-metni", keywords: ["<main", "Açık Rıza Metni"] },
  { path: "/hukuki/gizlilik-politikasi", keywords: ["<main", "Gizlilik Politikası"] },
  { path: "/hukuki/cerez-politikasi", keywords: ["<main", "Çerez Politikası"] },
  { path: "/hukuki/bagis-bilgilendirme-ve-sartlari", keywords: ["<main", "Bağış Bilgilendirme"] },
  { path: "/hukuki/gonullu-basvuru-aydinlatma-metni", keywords: ["<main", "Gönüllü Başvuru"] },
  { path: "/hukuki/iletisim-formu-aydinlatma-metni", keywords: ["<main", "İletişim Formu"] },
  { path: "/hukuki/kullanim-sartlari", keywords: ["<main", "Kullanım Şartları"] },
  { path: "/hukuki/mesafeli-bagis-online-odeme-bilgilendirmesi", keywords: ["<main", "Online Ödeme"] }
];

const legacyLegalRedirectChecks = [
  { path: "/kvkk-aydinlatma-metni", expectRedirect: true, locationIncludes: "/hukuki/kvkk-aydinlatma-metni", skipForbiddenText: true },
  { path: "/gizlilik-politikasi", expectRedirect: true, locationIncludes: "/hukuki/gizlilik-politikasi", skipForbiddenText: true },
  { path: "/cerez-politikasi", expectRedirect: true, locationIncludes: "/hukuki/cerez-politikasi", skipForbiddenText: true },
  { path: "/bagis-sartlari", expectRedirect: true, locationIncludes: "/hukuki/bagis-bilgilendirme-ve-sartlari", skipForbiddenText: true }
];

const routeChecks = [...publicRouteChecks, ...legalRouteChecks, ...legacyLegalRedirectChecks];

const forbiddenVisibleTextPatterns = [
  { label: "demo", pattern: /\bdemo\b/i },
  { label: "placeholder", pattern: /\bplaceholder\b/i },
  { label: "lorem", pattern: /\blorem\b/i },
  { label: "TODO", pattern: /\bTODO\b/i },
  { label: "staging", pattern: /\bstaging\b/i },
  { label: "production", pattern: /\bproduction\b/i },
  { label: "test", pattern: /\btest\b/i },
  { label: "payment intent", pattern: /payment\s+intent/i },
  { label: "PayTR test", pattern: /paytr\s+test/i },
  { label: "taslak", pattern: /taslak/i }
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

function visibleTextFromHtml(body) {
  return body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function findForbiddenVisibleTerms(body) {
  const visibleText = visibleTextFromHtml(body);
  return forbiddenVisibleTextPatterns
    .filter((item) => item.pattern.test(visibleText))
    .map((item) => item.label);
}

function isRedirectStatus(status) {
  return [301, 302, 303, 307, 308].includes(status);
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
    const location = response.headers.get("location") ?? "";

    if (check.expectRedirect) {
      if (isRedirectStatus(response.status) && (!check.locationIncludes || location.includes(check.locationIncludes))) {
        console.log(`${check.path}: OK redirect (${response.status}${location ? ` -> ${location}` : ""})`);
        summary.ok += 1;
        continue;
      }

      console.log(`${check.path}: FAIL (expected_redirect, status=${response.status}, location=${location || "none"})`);
      summary.failed += 1;
      continue;
    }

    const statusOk = response.status >= 200 && response.status < 300;
    const keywordOk = bodyHasKeyword(body, check.keywords);
    const whatsappOk = check.expectWhatsappText ? /WhatsApp/i.test(visibleTextFromHtml(body)) && /KVKK/i.test(visibleTextFromHtml(body)) : true;
    const whatsappTargetOk = check.expectWhatsappTarget ? /https:\/\/wa\.me\//i.test(body) : true;
    const forbiddenTerms = check.skipForbiddenText ? [] : findForbiddenVisibleTerms(body);

    if (statusOk && keywordOk && whatsappOk && whatsappTargetOk && forbiddenTerms.length === 0) {
      console.log(`${check.path}: OK (${response.status})`);
      summary.ok += 1;
      continue;
    }

    console.log(
      `${check.path}: FAIL (status=${response.status}, keyword=${keywordOk ? "ok" : "missing"}, whatsappText=${
        whatsappOk ? "ok" : "missing"
      }, whatsappTarget=${whatsappTargetOk ? "ok" : "missing"}, forbidden=${
        forbiddenTerms.length ? forbiddenTerms.join(",") : "none"
      }, url=${url.toString()})`
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
