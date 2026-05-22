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

9D.1 kapsamı:

- Public başvuru formu server action ile gerçek `sponsorship_applications` kaydı oluşturur.
- Girişli sponsor başvuruları `sponsor_account_id` ile ilişkilendirilir.
- Admin başvurular ekranı gerçek başvuruları maskeli şekilde okur.
- Admin eşleştirme ekranı uygun yetim profili seçimi ve sponsorship oluşturma akışını hazırlar.
- `sponsorship_matches` ve `sponsorship_status_logs` ile eşleştirme/durum geçmişi takip edilir.

Bu aşamada gerçek ödeme, düzenli ödeme talimatı, makbuz, SMS/e-posta, dosya/PDF upload ve gerçek hassas veri yönetimi yapılmaz.

## Veri Modeli

Yeni migration:

- `supabase/migrations/012_orphan_sponsorship_module.sql`
- `supabase/migrations/013_orphan_sponsorship_application_flow.sql`

Enumlar:

- `orphan_profile_status`
- `sponsorship_program_status`
- `sponsorship_status`
- `sponsorship_payment_status`
- `orphan_update_status`
- `orphan_assignment_status`
- `sponsorship_application_status`
- `sponsorship_match_status`

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
- `sponsorship_applications`: Public başvuru formundan server action ile oluşturulan başvuru kayıtları.
- `sponsorship_matches`: Admin onaylı sponsor-yetim eşleştirme kayıtları.
- `sponsorship_status_logs`: Başvuru, eşleşme ve sponsorluk durum geçmişi.

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

`/yetim-hamiligi/basvuru` 9D.1 itibarıyla gerçek başvuru kaydı oluşturur. Form aktif programı, ad soyad, e-posta, telefon, şehir, destek periyodu, not, KVKK onayı ve iletişim iznini alır.

Başarılı işlemde `application_no` gösterilir. Aylık tutar client girdisine güvenmeden server tarafında aktif `sponsorship_programs.monthly_amount` üzerinden doğrulanır. Gerçek ödeme, düzenli ödeme talimatı ve sponsorship aktivasyonu eşleştirme/ödeme aşamalarına bırakılmıştır.

Girişli sponsor başvuruları `sponsor_account_id` ile bağlanır. Misafir başvurular panelde otomatik görünmeyebilir ve kurum operasyonu tarafından iletişim bilgileriyle takip edilmelidir.

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

Admin ekranları kompakt tablo, filtre bar, durum rozetleri ve mahremiyet uyarılarıyla çalışır. Yetim profilleri ekranında açık kimlik ve hassas detay gösterilmez.

`/admin/yetim-hamiligi/basvurular` 9D.1 itibarıyla `sponsorship_applications` kayıtlarını okur. `/admin/yetim-hamiligi/basvurular/[id]/eslestir` ekranı başvuru özetini, maskeli sponsor bilgisini ve güvenli yetim profili listesini gösterir. Eşleştirme action'ı admin doğrulaması sonrası `sponsorships`, `sponsorship_matches`, `orphan_profiles.status` ve `sponsorship_status_logs` kayıtlarını günceller.

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
- Değerlendirme aşamasındaki başvuru durumu

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
- Public/anon `orphan_profiles`, `sponsorships`, `sponsorship_applications`, `sponsorship_matches`, `sponsorship_payments`, `orphan_updates`, `orphan_sponsorship_notes`, `orphan_assignments`, `sponsorship_notifications`, `sponsorship_exports` ve `sponsorship_status_logs` tablolarını okuyamaz.
- Sponsor authenticated ise yalnızca kendi `sponsor_account_id` ile eşleşen `sponsorships` kayıtlarını okuyabilir.
- Sponsor authenticated ise yalnızca kendi `sponsor_account_id` veya hesap e-postasıyla ilişkili `sponsorship_applications` kayıtlarını okuyabilir.
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
- 9D.1 başvuru write action'ı gerçek kayıt oluşturur; production öncesi rate limit, abuse monitoring ve yasal metin onayı tamamlanmalıdır.

## Sonraki Aşamalar

- `012_orphan_sponsorship_module.sql` staging ortamında çalıştırılmalı.
- `013_orphan_sponsorship_application_flow.sql` staging ortamında çalıştırılmalı.
- RLS policy'leri sponsor, admin, koordinatör ve personel test kullanıcılarıyla doğrulanmalı.
- Sponsor başvuru create server action staging'de KVKK ve honeypot senaryolarıyla test edilmeli.
- Gerçek sponsor-yetim eşleştirme akışı yetkili admin/koordinatör onayıyla manuel test edilmeli.
- Ödeme, makbuz, SMS/e-posta ve dosya upload entegrasyonları ayrı güvenlik testlerinden sonra açılmalıdır.
