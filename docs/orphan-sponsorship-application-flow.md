# 9D.1 Yetim Hamiliği Başvuru, Onay ve Eşleştirme Akışı

Bu doküman Okyanus İnsani Yardım Derneği yetim hamiliği modülünde public başvuru, admin onay/eşleştirme, sponsorship oluşturma ve bağışçı panel görünümü akışını açıklar.

## Başvuru Akışı

- Public `/yetim-hamiligi/basvuru` formu `createSponsorshipApplicationAction` server action ile çalışır.
- Form aktif `sponsorship_programs` kaydı seçtirir.
- Aylık destek tutarı client girdisine güvenmeden server tarafında program `monthly_amount` değerinden doğrulanır.
- Başvuru `sponsorship_applications` tablosuna `status = pending` ve `source = web` olarak yazılır.
- Başarılı işlem sonrası kullanıcıya `application_no` gösterilir.
- 9E ile ortak payment intent, makbuz ve bildirim hazırlık altyapısına bağlanabilecek hale gelir.
- Gerçek ödeme, düzenli talimat, makbuz PDF, SMS/e-posta veya dosya upload bu aşamada yapılmaz.

## KVKK Kayıt İzi

- KVKK onayı zorunludur.
- KVKK kabul edilmeden başvuru kaydı oluşturulmaz.
- `kvkk_accepted`, `contact_permission`, `created_at`, `source` ve durum geçmişi kayıt altına alınır.
- Honeypot alanı dolu submitlerde gerçek kayıt oluşturulmaz.

## Guest vs Logged-in Sponsor

- Girişli sponsor hesabı varsa başvuru `sponsor_account_id` ile ilişkilendirilir.
- Girişli sponsor panelde kendi başvuru ve sponsorluk durumunu görebilir.
- Misafir başvurularda `sponsor_account_id` null kalabilir; panelde otomatik görünmeyebilir.
- Misafir başvurular için iletişim ve doğrulama süreci kurum operasyonu tarafından yürütülmelidir.

## Admin Onay ve Eşleştirme

- Admin `/admin/yetim-hamiligi/basvurular` ekranında başvuruları maskeli kişisel veriyle read-only görür.
- Başvuru detay/eşleştirme ekranı `/admin/yetim-hamiligi/basvurular/[id]/eslestir` altında hazırlanmıştır.
- Admin yalnızca güvenli yetim özetleriyle eşleştirme yapar: kod, güvenli ad, yaş grubu, ülke/bölge, eğitim durumu, destek ihtiyacı ve durum.
- Açık kimlik, açık adres, okul adı, telefon, aile detayı veya hassas sağlık verisi gösterilmez.

## Sponsorship Oluşturma

Eşleştirme action akışı:

- `requireAdminUser()` ile admin/super_admin doğrulanır.
- Başvuru `pending`, `reviewing` veya `approved` durumunda olmalıdır.
- Yetim profili `active` veya `waiting` durumunda olmalıdır.
- `sponsorship_matches` kaydı oluşturulur.
- Eşleştirme onaylanır.
- `sponsorships` kaydı `payment_status = pending` ve `status = payment_pending` olarak oluşturulur.
- `sponsorship_applications.status = matched` yapılır.
- `orphan_profiles.status = sponsored` yapılır.
- `sponsorship_status_logs` ve audit log best-effort yazılır.

## Güvenli Yetim Özeti

- Sponsor paneli yalnızca sponsor ilişkisi olan kullanıcının kayıtlarını göstermelidir.
- Güvenli özet `sponsored_orphans_safe_view` veya repository safe mapping üzerinden hazırlanır.
- Sponsor panelinde çocuk açık kimliği, adresi, okul adı, telefon, aile detayı, hassas sağlık bilgisi veya izinsiz fotoğraf gösterilmez.

## Bağışçı Panel Görünümü

- `/panel/yetim-sponsorluk` girişli sponsorun kendi `sponsorships` kayıtlarını okur.
- Sadece application varsa "değerlendirme aşaması" görünür.
- Match sonrası güvenli yetim özeti ve ödeme bekliyor durumu gösterilir.
- Makbuz ve gerçek ödeme takibi ödeme entegrasyonu sonrası aktifleşecektir.
- Sponsorluk ileride `payment_intents.context_type = orphan_sponsorship` ve `context_id = sponsorships.id` ile ortak ödeme modeline bağlanır.
- 9E.1 stabilizasyonunda ödeme altyapısının sonraki aşamada aktifleşeceği kurumsal dille gösterilir; gerçek ödeme butonu veya düzenli talimat yoktur.

## Audit ve Status Log

- `sponsorship_status_logs` başvuru, eşleştirme, sponsorship ve orphan durum geçişlerini takip etmek için eklendi.
- Audit log admin eşleştirme ve girişli sponsor başvuru create işlemlerinde best-effort çalışır.
- Loglarda açık çocuk kimliği veya hassas çocuk verisi tutulmamalıdır.

## RLS ve Güvenlik

- Public/anon `sponsorship_applications`, `sponsorship_matches`, `sponsorship_status_logs` ve diğer hassas yetim tablolarını okuyamaz.
- Public/anon doğrudan insert/update/delete yapamaz.
- Başvuru yazımı server action ve server-only write repository üzerinden yapılır.
- Service role key client component veya public bundle içine taşınmaz.
- Admin/super_admin başvuruları ve eşleştirmeleri okuyabilir.
- Sponsor yalnızca kendi `sponsor_account_id` veya hesap e-postasıyla ilişkili başvuruları okuyabilir.

## Ödeme Entegrasyonu Öncesi

- Payment provider webhook signature doğrulanmalıdır.
- Idempotency key tasarlanmalıdır.
- Sponsorship, application ve program tutarı server-side eşleştirilmelidir.
- 9E ortak modelde payment paid olduğunda `sponsorships.payment_status = paid`, `sponsorships.status = active` ve `next_payment_date` periyoda göre server-side hesaplanmalıdır.
- Payment paid sonrası `receipts.status` en az `pending` veya `prepared` durumuna alınmalıdır.
- Payment paid sonrası `notification_queue` içine sponsorluk ödeme/makbuz bilgilendirme kaydı eklenmelidir.
- Düzenli ödeme başarısız/iptal/yenileme durumları ayrı state machine ile yönetilmelidir.
- Makbuz ve bildirim üretimi audit/status log ile bağlanmalıdır.
- Rate limiting ve kötüye kullanım koruması production öncesi eklenmelidir.

## Manuel Test Notları

- Staging'de `013_orphan_sponsorship_application_flow.sql` çalıştırılmalıdır.
- En az bir aktif `sponsorship_programs` ve bir `active/waiting` `orphan_profiles` kaydı bulunmalıdır.
- KVKK olmadan form submit engellenmelidir.
- Başarı sonrası `application_no` görünmelidir.
- Admin başvurular ekranında kayıt maskeli görünmelidir.
- Eşleştirme sonrası `sponsorships`, `sponsorship_matches` ve `sponsorship_status_logs` kayıtları oluşmalıdır.
- Bağışçı girişliyse panelde güvenli özet görünmelidir.
- `npm run test:supabase` sonucunda `Security warning: 0` korunmalıdır.

## 10A PayTR Test Hazırlığı

- Sponsorluk için payment intent varsa `/panel/yetim-sponsorluk` içinde “Ödemeye Devam Et” bağlantısı PayTR test route'una yönlenebilir.
- `merchant_oid`, payment intent referansından üretilir ve `provider_reference` olarak saklanır.
- PayTR success callback sonrası bu aşamada ödeme niyeti `paid` yapılır, makbuz hazırlık kaydı ve sistem bildirim kuyruğu hazırlanır.
- Sponsorluk iş kuralı finalizasyonu sonraki aşamada atomik işlem olmalıdır: `sponsorships.payment_status = paid`, `sponsorships.status = active`, `next_payment_date` periyoda göre hesaplanır.
- Failed/cancelled callback sonrası sponsor bilgilendirme, retry ve pasifleştirme state machine'i ayrı tasarlanmalıdır.
- Ok/fail dönüş sayfaları sponsorluk aktivasyonu yapmaz; karar yalnızca callback ile verilir.

## 10B Sponsorluk Payment Intent Akışı

- Admin eşleştirme action'ı sponsorship oluşturduktan sonra `buildOrphanSponsorshipPaymentContext` ile PayTR provider'lı payment intent oluşturur.
- Payment intent oluşturulamazsa sponsorluk kaydı bozulmaz; admin eşleştirme ekranında ödeme bağlantısının sonradan hazırlanabileceği belirtilir.
- Aynı `sponsorships.id` için bekleyen/başlatılmış payment intent varsa yeni kayıt açılmaz, mevcut intent tekrar kullanılır.
- Sponsor panelinde payment intent varsa “Ödemeye Devam Et” bağlantısı gösterilir.
- PayTR paid callback sonrası `sponsorships.payment_status = paid`, `sponsorships.status = active` ve `last_payment_date` güncellenir.
- `next_payment_date` yenileme, düzenli ödeme retry ve pasifleştirme state machine'i 10C/10D aşamalarında netleştirilmelidir.
