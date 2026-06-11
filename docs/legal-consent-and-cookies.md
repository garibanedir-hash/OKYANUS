# Hukuki Onay Kayıtları ve Çerez Tercih Mekanizması

Bu doküman 14B aşamasında eklenen çerez tercih paneli ve form onay kayıt yaklaşımını açıklar. İçerik hukuki danışmanlık yerine geçmez; nihai metinler ve uygulama kapsamı hukukçu, dernek yönetimi ve teknik sorumlu tarafından birlikte kontrol edilmelidir.

## Çerez Tercih Mekanizması

Public site ilk ziyarette `CookieConsentBanner` bileşenini gösterir. Kullanıcı şu seçeneklerden birini seçebilir:

- Sadece zorunlu çerezler
- Tümünü kabul et
- Tercihleri yönet

Tercih panelinde zorunlu çerezler kapatılamaz. İşlevsel, analitik ve pazarlama kategorileri ayrı ayrı açılıp kapatılabilir.

## Saklama Yaklaşımı

İlk sürümde çerez tercihleri DB'ye public olarak yazılmaz. Tercih şu iki yerde tutulur:

- `localStorage`: `okyanus.cookieConsent`
- Cookie: `okyanus_cookie_consent`

Bu yaklaşım public/anon insert yüzeyini açmadan tercih tekrarını engeller. `site_cookie_consents` tablosu migration ile hazırlanmıştır, ancak public insert/update policy açılmamıştır. İleride server-side kayıt gerekecekse rate limit, bot koruması, veri minimizasyonu ve hukukçu kontrolü tamamlanmalıdır.

## Kategoriler

- Zorunlu: Site güvenliği, temel çalışma ve tercih kaydı için gereklidir.
- İşlevsel: Kullanıcı deneyimi tercihlerini hatırlamak için kullanılabilir.
- Analitik: Site performansı ve kullanımını toplu olarak anlamak için kullanılabilir.
- Pazarlama: Reklam, kampanya ölçümü veya yeniden hedefleme araçları eklenirse kullanılabilir.

Tanıtım aşamasında kapsamlı analitik veya pazarlama çerezi aktif değildir. Bu araçlar eklenirse `data/legalPages.ts`, cookie tercih paneli ve bu doküman güncellenmelidir.

## Form Onay Kayıtları

Ortak form alanları:

- `kvkkAcknowledged`
- `explicitConsentGiven`
- `communicationPermissionGiven`
- `consentTextVersion`
- `consentContext`

Server tarafında eklenen kayıt alanları:

- `consent_given_at`
- `consent_user_agent`
- `consent_ip`
- `consent_metadata`

Ham IP bu sürümde toplanmaz; `consent_ip` boş bırakılır ve metadata içinde bu durum belirtilir.

## Form Bazlı Onaylar

- İletişim: İletişim Formu Aydınlatma Metni zorunlu, duyuru izni opsiyonel.
- Gönüllü: Gönüllü Başvuru Aydınlatma Metni zorunlu, Açık Rıza Metni zorunlu, duyuru izni opsiyonel.
- Genel bağış: KVKK Aydınlatma Metni ve Bağış Bilgilendirme metni zorunlu, duyuru/iletişim izni opsiyonel.
- Kurban: Vekalet onayı ayrı zorunlu, KVKK ve bağış bilgilendirme zorunlu, duyuru/iletişim izni opsiyonel.
- Yetim hamiliği: KVKK ve bağış bilgilendirme zorunlu, duyuru/iletişim izni opsiyonel.
- Kayıt: KVKK zorunlu, Kullanım Şartları ayrı zorunlu, duyuru/iletişim izni opsiyonel.

## Veri Modeli

`024_legal_consent_and_cookie_preferences.sql` migration'ı mevcut hassas form tablolarına ortak consent kolonlarını ekler. Tablo yoksa migration ilgili tabloyu atlar.

Kapsanan başlıca tablolar:

- `contact_messages`
- `volunteer_applications`
- `payment_intents`
- `qurban_orders`
- `qurban_delegations`
- `sponsorship_applications`
- `user_accounts`
- `donor_profiles`
- `volunteer_profiles`

Eski `kvkk_accepted` ve `contact_permission` alanları uyumluluk için korunur; yeni alanlar daha açık ayrım ve izlenebilirlik sağlar.

## Hukuki Metin Versiyonlama

Kod tarafında aktif consent sürümü `LEGAL_CONSENT_VERSION = "2026-06-11"` değeridir. Hukuki metinlerde anlamlı bir değişiklik yapıldığında bu sürüm güncellenmeli ve çerez tercih sürümü gerekiyorsa ayrıca artırılmalıdır.

## Analitik veya Pazarlama Aracı Eklenirse

- Çerez Politikası güncellenmeli.
- Cookie tercih panelindeki kategori açıklamaları gözden geçirilmeli.
- Gerekirse kullanıcıdan yeni tercih alınması için cookie consent sürümü güncellenmeli.
- Üçüncü taraf sağlayıcı sözleşmeleri, veri aktarımı ve saklama süreleri hukukçu kontrolünden geçmeli.
- Server-side veya client-side entegrasyonlar kişisel veri minimizasyonu prensibiyle yapılmalı.

## Kalan Hukuki Kontroller

- Resmi dernek adresi, sicil bilgisi ve yetkili iletişim bilgileri nihai metinlere eklenmeli.
- Açık rıza gereken durumlar form bazında hukukçu tarafından teyit edilmeli.
- Saklama ve imha süreleri operasyonel süreçlerle eşleştirilmeli.
- Online ödeme aktif edilmeden önce bağış bilgilendirme ve mesafeli bağış/online ödeme metinleri tekrar gözden geçirilmeli.
