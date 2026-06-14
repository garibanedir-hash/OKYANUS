# Tanıtım Modu Final QA ve Production Hazırlığı

Bu doküman 16B aşaması için public tanıtım yayınına çıkış öncesi son kontrol referansıdır. Amaç yeni özellik geliştirmek değil; ziyaretçiye açık sayfaların güven veren, temiz, mobil uyumlu ve WhatsApp yönlendirmeli production tanıtım moduna hazır olduğunu doğrulamaktır.

## Kapsam Dışı

- PayTR online ödeme açılmaz.
- `DONATION_MODE=online` yapılmaz.
- Production'da `TURNSTILE_ENABLED=true` zorunlu açılmaz.
- RLS/public write policy gevşetilmez.
- Makbuz sistemi veya admin panel kapsamı değiştirilmez.
- Upstash/Turnstile gerçek Preview eksikleri bu aşama için blocker değildir; operasyonel risk notu olarak kalır.

## Public Rota Checklist

- [ ] `/`
- [ ] `/hakkimizda`
- [ ] `/projeler`
- [ ] `/projeler/bir-koli-bir-umut`
- [ ] `/faaliyetler`
- [ ] `/kurban`
- [ ] `/kurban/bagis`
- [ ] `/yetim-hamiligi`
- [ ] `/yetim-hamiligi/basvuru`
- [ ] `/bagis-yap`
- [ ] `/gonullu-ol`
- [ ] `/iletisim`
- [ ] `/seffaflik`
- [ ] `/faaliyet-raporlari`
- [ ] `/hukuki`
- [ ] `/robots.txt`
- [ ] `/sitemap.xml`
- [ ] `/admin` anon erişimde login redirect verir.

## Ziyaretçi Metni Yasaklı Kelime Kontrolü

Public ziyaretçiye görünen metinde aşağıdaki ifadeler bulunmamalıdır:

- `demo`
- `placeholder`
- `lorem`
- `TODO`
- `staging`
- `production`
- `test`
- `payment intent`
- `PayTR test`
- `taslak`

Bu kontrol public HTML üzerinde `npm run smoke:production` ile temel seviyede yapılır. Admin/panel içi demo ifadeleri bu tanıtım QA kapsamının dışındadır; public siteye taşmamalıdır.

## İçerik Son Kontrolü

- Ana sayfa güven, şeffaflık ve emanet bilinci mesajını teknik dil kullanmadan verir.
- Hakkımızda sayfası kurumsal misyon, vizyon ve değerleri açıkça anlatır.
- Projeler sayfası boş/demo hissi vermeden proje ve bölge kartları gösterir; veri yoksa düzgün empty state vardır.
- Faaliyetler sayfası destek alanlarını anlaşılır biçimde gösterir.
- `/bagis-yap`, `/kurban/bagis` ve `/yetim-hamiligi/basvuru` WhatsApp moduyla uyumlu bilgilendirme kartı gösterir.
- Kurban ve yetim sayfaları online ödeme hissi vermeden başvuru/bilgilendirme yönlendirmesi yapar.
- Gönüllü ve iletişim formları okunabilir, mobilde kullanılabilir ve KVKK/consent alanlarını gösterir.
- Hukuki sayfalar okunabilir ve footer/header akışından erişilebilir.

## WhatsApp Yönlendirme Kontrolü

`DONATION_MODE=whatsapp` iken:

- Header bağış CTA WhatsApp veya güvenli fallback'e gider.
- Footer bağış CTA WhatsApp veya güvenli fallback'e gider.
- `/bagis-yap` online form yerine WhatsApp bilgilendirme kartı gösterir.
- `/kurban/bagis` online form yerine kurban WhatsApp bilgilendirme kartı gösterir.
- `/yetim-hamiligi/basvuru` online form yerine yetim hamiliği WhatsApp bilgilendirme kartı gösterir.
- Proje detay CTA'ları proje adını içeren WhatsApp mesajı üretir.
- KVKK ve gizlilik linkleri WhatsApp bilgilendirme kartlarında görünür.
- Payment intent, online payment form veya PayTR iframe linki görünmez.

Mevcut local env'de görünen WhatsApp numarası:

```env
DONATION_WHATSAPP_PHONE=905300698976
```

Bu numara production resmi hattı değilse Vercel Production env içinde değiştirilmeden go verilmez.

## Görsel ve Marka Kontrolü

- Okyanus logo görselleri `/brand/logo.png`, `/brand/logo-white.png` ve `/brand/mark.png` üzerinden yüklenir.
- Header logo `object-contain` ile crop olmadan render edilir.
- Footer logo koyu zeminde beyaz varyantla görünür.
- Sosyal medya önizleme görseli `/brand/social-preview.png` path'indedir.
- Favicon için `favicon.svg/png` yoksa `mark.png` fallback olarak kullanılır.
- Proje görseli yoksa `VisualPlaceholder` marka renkleriyle kötü görünmeyen bir placeholder üretir; kullanıcıya `placeholder` metni göstermez.

## Mobil QA Genişlikleri

Hızlı QA genişlikleri:

- 390px mobil
- 768px tablet
- 1024px laptop
- 1440px desktop

Öncelikli sayfalar:

- `/`
- `/projeler`
- `/bagis-yap`
- `/kurban`
- `/yetim-hamiligi`
- `/gonullu-ol`
- `/iletisim`

Kontrol kriterleri:

- Header taşmaz; mobilde hamburger menü kullanılır.
- CTA butonları görünür ve dokunulabilir.
- Kart gridleri tek/sütunlu kırılımlarda taşmaz.
- Formlar mobilde okunabilir ve inputlar ebeveyn alanı dışına çıkmaz.
- Footer kolonları mobilde dağılmadan alt alta akar.

## Hukuki Link Kontrolü

- [ ] `/hukuki`
- [ ] `/hukuki/kvkk-aydinlatma-metni`
- [ ] `/hukuki/acik-riza-metni`
- [ ] `/hukuki/gizlilik-politikasi`
- [ ] `/hukuki/cerez-politikasi`
- [ ] `/hukuki/bagis-bilgilendirme-ve-sartlari`
- [ ] `/kvkk-aydinlatma-metni` eski URL yönlendirmesi
- [ ] `/gizlilik-politikasi` eski URL yönlendirmesi
- [ ] `/cerez-politikasi` eski URL yönlendirmesi
- [ ] `/bagis-sartlari` eski URL yönlendirmesi
- [ ] Footer hukuki linkleri doğru hedeflere gider.

## SEO ve Metadata Kontrolü

- `metadataBase` production domain: `https://www.okyanus.org.tr`.
- Production env içinde `NEXT_PUBLIC_SITE_URL=https://www.okyanus.org.tr`.
- OG image path: `/brand/social-preview.png`.
- `robots.txt` 200 döner ve sitemap URL içerir.
- `sitemap.xml` 200 döner ve temel public rotaları içerir.
- Sayfa title/description değerleri ziyaretçi odaklıdır; teknik debug/test dili içermez.
- Sosyal preview görseli public dosya sisteminde vardır.

## Production Env Checklist

Production için beklenen değerler:

```env
SITE_MAINTENANCE_MODE=false
DONATION_MODE=whatsapp
DONATION_WHATSAPP_PHONE=<resmi_numara>
DONATION_WHATSAPP_MESSAGE=<kurumsal_mesaj>
NEXT_PUBLIC_SITE_URL=https://www.okyanus.org.tr
TURNSTILE_ENABLED=false
RATE_LIMIT_PROVIDER=memory
PAYTR_DEBUG_ON=false
NEXT_PUBLIC_ADMIN_DEMO_MODE=false
```

Notlar:

- `TURNSTILE_ENABLED=true` production'da bu aşamada açılmayacak.
- `DONATION_MODE=online` yapılmayacak.
- PayTR online ödeme açılmayacak.
- Upstash production env yoksa `RATE_LIMIT_PROVIDER=memory` kalabilir; bu global/persistent rate limit değildir ve operasyonel risk olarak takip edilir.
- Upstash kullanılacaksa `RATE_LIMIT_PROVIDER=upstash`, `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` yalnızca server env'de tanımlanmalıdır.

## Production Smoke

Gerçek production domain hazır olduğunda:

```bash
PRODUCTION_SMOKE_BASE_URL=https://www.okyanus.org.tr npm run smoke:production
```

Base URL yoksa komut güvenli skip verir. Script secret kullanmaz, write/delete yapmaz, Supabase DB veya Storage'a dokunmaz.

Smoke kontrol kapsamı:

- Public rotalar 200.
- `/admin` login redirect.
- Hukuki alt sayfalar 200.
- Eski hukuki URL'ler yeni `/hukuki/...` adreslerine redirect.
- `/robots.txt` 200.
- `/sitemap.xml` 200.
- Bağış sayfalarında WhatsApp/KVKK sinyali.
- Proje detay CTA'sında WhatsApp target.
- Public görünür metinde yasaklı kelime taraması.

## Tanıtım Modu Go / No-Go

Go şartları:

- Public route smoke temiz.
- `DONATION_MODE=whatsapp`.
- WhatsApp resmi numarası doğrulandı.
- Online ödeme formu görünmüyor.
- PayTR online ödeme kapalı.
- Hukuki linkler çalışıyor.
- SEO robots/sitemap temel kontrolleri geçiyor.
- `npm run test:supabase` sonucu `Security warning: 0` ve `Missing table: 0`.
- Build/lint temiz.

No-go şartları:

- Public sayfada `demo`, `placeholder`, `test`, `payment intent`, `PayTR test`, `taslak` gibi ziyaretçi güvenini zedeleyen ifade görünüyor.
- Bağış CTA online payment formuna gidiyor.
- WhatsApp numarası yanlış veya net değil.
- `/admin` anon erişilebilir.
- Private bucket public.
- PayTR online payment açılıyor.
- Production env içinde `TURNSTILE_ENABLED=true` zorunlu açılmış.
