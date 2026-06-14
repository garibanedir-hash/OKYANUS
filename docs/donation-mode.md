# Donation Mode / WhatsApp Bağış Yönlendirme

Donation Mode, public sitedeki bağış başlatma CTA'larının davranışını merkezi olarak yönetir. Siteyi kapatmaz; projeler, faaliyetler, harita, kurban, yetim hamiliği, hakkımızda ve iletişim sayfaları görünmeye devam eder.

## Modlar

- `online`: Normal bağış/ödeme başlatma akışı çalışır.
- `whatsapp`: Public bağış CTA'ları ödeme formu yerine WhatsApp bilgilendirme linkine gider.
- `disabled`: Bağış form sayfaları geçici kapalı bilgi kartı gösterir.

## Environment

```env
DONATION_MODE=online
DONATION_WHATSAPP_PHONE=905xxxxxxxxx
DONATION_WHATSAPP_MESSAGE=Merhaba, Okyanus İnsani Yardım Derneği bağış çalışmaları hakkında bilgi almak istiyorum.
```

`DONATION_MODE=whatsapp` olduğunda header, footer, ana sayfa, proje kartları, proje detayı, kurban CTA'ları ve yetim hamiliği CTA'ları WhatsApp yönlendirmesine döner. Telefon numarası boşsa CTA güvenli şekilde `/iletisim` sayfasına yönlenir.

## Sayfa Davranışı

- `/bagis-yap`: `online` modda bağış formu gösterir; `whatsapp` modda WhatsApp bilgilendirme kartı; `disabled` modda geçici kapalı mesajı gösterir.
- `/kurban/bagis`: `online` modda mevcut kurban başvuru/payment intent hazırlık akışı; `whatsapp` modda kurban bilgilendirme kartı; `disabled` modda kapalı mesajı gösterir.
- `/yetim-hamiligi/basvuru`: `online` modda mevcut başvuru akışı; `whatsapp` modda yetim hamiliği bilgilendirme kartı; `disabled` modda kapalı mesajı gösterir.

Public formlar render edilmediği için WhatsApp/disabled modda yeni payment intent veya yeni public bağış başvurusu başlatılmaz. Eski/var olan PayTR callback, payment finalization, makbuz ve panel ödeme devam akışları değiştirilmez.

WhatsApp bilgilendirme kartlarında kısa KVKK/Gizlilik notu ve ilgili hukuki metin linkleri korunur. Kullanıcı WhatsApp üzerinden iletişime geçtiğinde paylaşacağı bilgiler talebin yanıtlanması amacıyla değerlendirilir; ayrıntılı aydınlatma `/hukuki` altındaki metinlerden takip edilir.

## Bakım Modundan Farkı

`SITE_MAINTENANCE_MODE` siteyi bakım sayfasına yönlendiren genel yayın modudur. Donation Mode ise yalnızca public bağış başlatma CTA'larını ve bağış form sayfalarını etkiler; tanıtım döneminde site açık kalır.

## Production Notları

- WhatsApp telefonu public kullanım için uygunsa tanımlanmalıdır.
- `DONATION_MODE=online` yapıldığında normal ödeme akışı geri döner.
- Env değişikliği deployment ortamında yeniden deploy gerektirebilir.
- Public client bundle'a PayTR veya Supabase service role secret taşınmaz.
- `DONATION_MODE=online` açılmadan önce bağış formlarındaki consent kayıtları, Bağış Bilgilendirme ve Mesafeli Bağış / Online Ödeme metinleri tekrar gözden geçirilmelidir.
- Production tanıtım yayınında önerilen değer `DONATION_MODE=whatsapp` olarak korunmalıdır.
- WhatsApp modunda `/bagis-yap`, `/kurban/bagis` ve `/yetim-hamiligi/basvuru` payment intent, kurban order veya sponsorluk ödeme başlatmamalıdır; bu durum release öncesi HTTP/browser kontrolünde doğrulanmalıdır.
- Online moda geçişten önce PayTR callback hash/idempotency, tutar/para birimi doğrulaması, makbuz private bucket erişimi ve rate limit/spam riski `docs/production-security-hardening.md` ile tekrar kontrol edilmelidir.

## 16A Operasyon Kararları

- Tanıtım production yayınında beklenen değer `DONATION_MODE=whatsapp` olarak kalır.
- WhatsApp numarası yanlışsa veya hat geçici kullanılamıyorsa env düzeltilene kadar `DONATION_MODE=disabled` değerlendirilebilir.
- Public CTA'lar ödeme formuna gidiyorsa release no-go veya acil incident kabul edilir; env düzeltilip redeploy yapılır.
- PayTR online ödeme gerçek merchant test, mali/yönetim onayı, callback idempotency kanıtı ve makbuz/private bucket kontrolü tamamlanmadan açılmaz.
- Deploy sonrası `/bagis-yap`, `/kurban/bagis` ve `/yetim-hamiligi/basvuru` için `npm run smoke:production` ve manuel browser kontrolü yapılır.
- Ayrıntılı olay müdahalesi `docs/production-operations-runbook.md` içinde tutulur.
