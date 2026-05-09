# Bakım / Tadilat Modu

## Amaç

Bakım modu, site yayındayken public ziyaretçileri tek bir bilgilendirme sayfasına yönlendirir. Geliştirici/admin tarafının çalışmaya devam etmesi için admin ve iç panel route’ları açık bırakılmıştır.

## Vercel Environment Ayarları

`.env.example` içinde iki değişken bulunur:

```env
SITE_MAINTENANCE_MODE=false
MAINTENANCE_BYPASS_TOKEN=
```

- `SITE_MAINTENANCE_MODE=true`: Public site `/tadilat` sayfasına yönlenir.
- `SITE_MAINTENANCE_MODE=false`: Site normal çalışır.
- `MAINTENANCE_BYPASS_TOKEN`: Opsiyonel geliştirici bypass token’ıdır.

Vercel’de environment değişikliği sonrası redeploy gerekebilir.

## Bypass Kullanımı

Token tanımlıysa şu formatta geçici bypass cookie’si alınabilir:

```text
https://domain.com?bypass=TOKEN
```

Doğru token geldiğinde `okyanus_maintenance_bypass` cookie’si set edilir ve kullanıcı siteyi normal görebilir. Token console’a yazılmaz ve client componentlere import edilmez.

## Bakım Modunda Route Davranışı

- Public route’lar `/tadilat` sayfasına yönlenir.
- `/tadilat` sonsuz redirect yapmaz.
- `/_next`, görseller, CSS/JS ve statik dosyalar engellenmez.
- `/api` route’ları şimdilik engellenmez.
- `/admin` ve `/admin/giris` açık kalır.
- `/panel`, `/koordinator`, `/personel` geliştirme/demo erişimi için açık bırakılmıştır.

## Güvenlik Notları

- Bakım modu gerçek güvenlik sistemi değildir.
- Admin panel production ortamında auth ve RBAC ile korunmalıdır.
- Demo paneller production öncesi kapatılmalı veya gerçek auth ile korunmalıdır.
- Bypass token sınırlı kişilerle paylaşılmalıdır.
- Token client bundle’a taşınmamalıdır.

## Bakım Modunu Kapatma

```env
SITE_MAINTENANCE_MODE=false
```

Sonrasında Vercel redeploy gerekebilir.
