# 9D Yetim Hamiliği / Sponsorluk Modülü

Bu doküman Okyanus İnsani Yardım Derneği için yetim hamiliği, sponsor başvurusu, güvenli çocuk profili görünümü, admin operasyonu, koordinatör/personel takibi ve raporlama hazırlığını açıklar.

## Modül Amacı

Yetim hamiliği modülü sıradan bir bağış sayfası değildir. Amaç; sponsor başvurusu, sponsorluk kaydı, güvenli yetim özeti, periyodik güncelleme, ödeme durumu, görev takibi ve export hazırlığını çocuk mahremiyetini önceleyen bir yapıda kurgulamaktır.

9D kapsamı:

- Veri modeli ve RLS taslağı hazırlanır.
- Public yetim hamiliği sayfaları oluşturulur.
- Başvuru ekranı demo/pre-registration olarak çalışır.
- Admin yetim hamiliği ekranları mock/read-only çalışır.
- Bağışçı panelinde güvenli yetim sponsorluk görünümü güçlendirilir.
- Koordinatör/personel ekranları görev takip mantığını gösterir.

Bu aşamada gerçek ödeme, düzenli ödeme talimatı, makbuz, SMS/e-posta, dosya/PDF upload ve gerçek hassas veri yönetimi yapılmaz.

## Veri Modeli

Yeni migration:

- `supabase/migrations/012_orphan_sponsorship_module.sql`

Enumlar:

- `orphan_profile_status`
- `sponsorship_program_status`
- `sponsorship_status`
- `sponsorship_payment_status`
- `orphan_update_status`
- `orphan_assignment_status`

Tablolar:

- `orphan_profiles`: Yetim/çocuk profilleri. Public görünürlük yoktur.
- `sponsorship_programs`: Public aktif sponsorluk programları.
- `sponsorships`: Sponsor hesabı ve yetim/program ilişkisi.
- `sponsorship_payments`: İleride düzenli ödeme takibi için hazırlık.
- `orphan_updates`: Sponsor paneline açılabilecek güvenli güncellemeler.
- `orphan_sponsorship_notes`: Yetkili ekip iç notları.
- `orphan_assignments`: Koordinatör/personel takip görevleri.
- `sponsorship_notifications`: Sponsor bilgilendirme hazırlığı.
- `sponsorship_exports`: Export hazırlık kayıtları.

View:

- `sponsored_orphans_safe_view`

Bu view yalnızca sponsorun kendi sponsorluk ilişkisi veya admin/super_admin yetkisi üzerinden güvenli özet alanları döndürmelidir.

Not: Projede 005 migration ile gelen erken dönem `sponsorships` tablosu bulunduğu için 012 migration bu tabloyu düşürmez; yeni sponsorluk alanlarını `alter table ... add column if not exists` ile genişletir. Eski `sponsored_children` yapısı korunur, yeni yetim hamiliği akışı `orphan_profiles` ve güvenli view üzerinden geliştirilir.

## Public Başvuru Akışı

Public route'lar:

- `/yetim-hamiligi`
- `/yetim-hamiligi/surec`
- `/yetim-hamiligi/basvuru`

`/yetim-hamiligi` aktif programları ve mahremiyet yaklaşımını anlatır. `/yetim-hamiligi/surec` başvuru, sponsor profili, eşleşme, düzenli destek, güvenli güncelleme ve makbuz/bilgilendirme adımlarını açıklar.

`/yetim-hamiligi/basvuru` bu aşamada gerçek kayıt oluşturmaz. Demo/pre-registration formu şu mesajla sonuçlanır:

“Yetim hamiliği başvurunuz alınmaya hazırlanmıştır. Ödeme ve düzenli destek altyapısı tamamlandığında süreç aktif hale getirilecektir.”

## Admin Operasyonu

Admin route'ları:

- `/admin/yetim-hamiligi`
- `/admin/yetim-hamiligi/yetimler`
- `/admin/yetim-hamiligi/sponsorluklar`
- `/admin/yetim-hamiligi/basvurular`
- `/admin/yetim-hamiligi/guncellemeler`
- `/admin/yetim-hamiligi/gorevler`
- `/admin/yetim-hamiligi/bildirimler`
- `/admin/yetim-hamiligi/raporlar`
- `/admin/yetim-hamiligi/export`

Admin ekranları kompakt tablo, filtre bar, durum rozetleri ve mahremiyet uyarılarıyla read-only çalışır. Yetim profilleri ekranında açık kimlik ve hassas detay gösterilmez.

## Bağışçı Paneli

Route:

- `/panel/yetim-sponsorluk`

Sponsor panelinde gösterilebilecek güvenli alanlar:

- Yetim kodu
- Güvenli ad/rumuz
- Yaş grubu
- Ülke/bölge
- Eğitim durumu
- Son güncelleme tarihi
- Sponsorluk ve ödeme durumu
- Bir sonraki destek tarihi

Sponsor panelinde gösterilmeyecek alanlar:

- Açık adres
- Okul adı
- Kimlik numarası
- Telefon
- Aile detayları
- Hassas sağlık verisi
- İzinsiz fotoğraf

## Koordinatör ve Personel Görevleri

Koordinatör route'u:

- `/koordinator/yetim-sponsorluk`

Personel route'u:

- `/personel/yetim-gorevleri`

Koordinatör ekranı sorumlu olduğu yetim/sponsorluk görevlerini, güncelleme bekleyenleri ve personel görevlerini demo/read-only olarak gösterir. Personel ekranı kendisine atanmış güncelleme/rapor görevlerini gösterir; gerçek kayıt oluşturmaz.

## Çocuk Mahremiyeti

- Çocuk verileri minimum düzeyde tutulmalıdır.
- Açık kimlik, açık adres, okul adı, telefon, aile detayları gibi bilgiler public veya bağışçı panelinde gösterilmemelidir.
- Fotoğraf kullanımı açık rıza ve kurum politikası olmadan yapılmamalıdır.
- Sponsor panelinde sadece güvenli özet gösterilmelidir.
- Güncellemelerde açık adres, okul adı, kimlik, telefon, aile detayı veya hassas fotoğraf olmamalıdır.
- Yetim hamiliği metinleri hukuk danışmanı, kurum yönetimi ve çocuk koruma ilkeleri açısından incelenmelidir.
- Bu aşamadaki bilgiler demo/taslak niteliğindedir.

## RLS ve Güvenlik Notları

- Public/anon yalnızca `status = active` olan `sponsorship_programs` kayıtlarını okuyabilir.
- Public/anon `orphan_profiles`, `sponsorships`, `sponsorship_payments`, `orphan_updates`, `orphan_sponsorship_notes`, `orphan_assignments`, `sponsorship_notifications` ve `sponsorship_exports` tablolarını okuyamaz.
- Sponsor authenticated ise yalnızca kendi `sponsor_account_id` ile eşleşen `sponsorships` kayıtlarını okuyabilir.
- Sponsor güvenli yetim özetini yalnızca kendi sponsorship ilişkisi üzerinden `sponsored_orphans_safe_view` ile görebilir.
- Admin/super_admin yönetim ekranları için read policy hazırlanmıştır.
- Koordinatör/personel yalnızca kendisine atanmış `orphan_assignments` kapsamını okuyabilir.
- Insert/update/delete policy bu aşamada açılmamıştır.
- Service role key client tarafına taşınmaz.

## Export ve Raporlama

Export ekranı demo hazırlıktır. Varsayılan kişisel veri maskeleme açık olmalıdır. Gerçek CSV/XLSX/PDF üretimi açılmadan önce:

- Audit/export log yazımı doğrulanmalı.
- CSV injection önlemleri uygulanmalı.
- Export yetkisi admin/super_admin ile sınırlandırılmalı.
- Çocuk ve sponsor PII alanları minimum görünürlük ilkesiyle maskelenmelidir.

## Ödeme Entegrasyonu Öncesi Notlar

Ödeme veya düzenli ödeme talimatı açılmadan önce:

- Payment provider webhook signature doğrulanmalı.
- Idempotency key tasarımı yapılmalı.
- Tutar, para birimi ve sponsorluk ilişkisi server-side doğrulanmalı.
- Başarısız/iptal ödeme için durum geçişleri tasarlanmalı.
- Makbuz ve bildirim entegrasyonu audit log ile bağlanmalı.
- Sponsor başvurusu write action'ı rate limit ve KVKK onayıyla hazırlanmalı.

## Sonraki Aşamalar

- `012_orphan_sponsorship_module.sql` staging ortamında çalıştırılmalı.
- RLS policy'leri sponsor, admin, koordinatör ve personel test kullanıcılarıyla doğrulanmalı.
- Sponsor başvuru create server action ayrı aşamada hazırlanmalı.
- Gerçek sponsor-yetim eşleştirme akışı yetkili admin/koordinatör onayıyla tasarlanmalı.
- Ödeme, makbuz, SMS/e-posta ve dosya upload entegrasyonları ayrı güvenlik testlerinden sonra açılmalıdır.
