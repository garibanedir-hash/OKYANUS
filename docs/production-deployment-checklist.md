# Production Deployment Checklist

Bu liste Okyanus İnsani Yardım Derneği platformu production yayını öncesi son teknik ve operasyonel kontroller için hazırlanmıştır.

## Vercel ve Environment

- [ ] Vercel project doğru GitHub repository ile bağlı.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` tanımlandı.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` tanımlandı.
- [ ] `SUPABASE_SECRET_KEY` veya `SUPABASE_SERVICE_ROLE_KEY` yalnızca server environment olarak tanımlandı.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` production öncesi değerlendirildi.
- [ ] Production'da `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` yanlışlıkla verilse bile demo bypass'ın etkisiz kaldığı doğrulandı.
- [ ] `SITE_MAINTENANCE_MODE` yayın stratejisine göre ayarlandı.
- [ ] `MAINTENANCE_BYPASS_TOKEN` gerekiyorsa güvenli şekilde tanımlandı.

## Migration ve Supabase

- [ ] Migration dosyaları staging ortamında sırayla test edildi.
- [ ] Seed data yalnızca staging/demo ortamında çalıştırıldı.
- [ ] RLS policy testleri bağışçı, gönüllü, koordinatör, personel ve admin rolleriyle doğrulandı.
- [ ] Storage bucket policy'leri test edildi.
- [ ] İlk Super Admin hesabı güvenli şekilde oluşturuldu.
- [ ] Staging test kullanıcıları production verisi veya gerçek kişi bilgisi içermiyor.
- [ ] Test kullanıcıları production öncesi silindi veya devre dışı bırakıldı.
- [ ] Public içerik tabloları (`projects`, `news_posts`, `reports`) read-only olarak doğrulandı.
- [ ] Hassas tablolar public read-only entegrasyona dahil edilmedi.

## Auth ve Route Guard

- [ ] Admin auth aktif.
- [ ] `/admin/giris` hariç admin route'ları korunuyor.
- [ ] `/panel` account type kontrolüyle korunuyor.
- [ ] `/koordinator` assignment kapsamıyla korunuyor.
- [ ] `/personel` yalnızca kendi verisini gösteriyor.
- [ ] Demo paneller production öncesi kapatıldı veya auth ile korundu.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` production ortamında doğrulandı.
- [ ] `/giris`, `/kayit`, `/admin/giris` dışındaki korumalı paneller oturumsuz erişimde login sayfasına yönleniyor.
- [ ] Bilinmeyen veya yetkisiz rol güvenli fallback ile panele alınmıyor.
- [ ] İlk Super Admin hesabı oluşturuldu ve audit/security sorumlusu tarafından doğrulandı.
- [ ] Test kullanıcı şifreleri `.env.local`/staging secret dışında hiçbir yere yazılmadı.
- [ ] Metadata tek başına güvenlik kaynağı olarak kullanılmıyor; server guard + RLS asıl sınır.
- [ ] Her rol kendi paneliyle sınırlı ve yasaklı paneller manuel checklist ile doğrulandı.

## Read-only Public Data

- [ ] Supabase env yokken public sayfalar mock fallback ile build oluyor.
- [ ] Supabase hata/timeout durumunda public sayfalar beyaz ekran vermiyor.
- [ ] Supabase başarılı ama public içerik boşsa empty state gösteriliyor.
- [ ] Admin içerik listelerinde sadece read-only veri gösteriliyor; CRUD butonları demo kalıyor.
- [ ] Dashboard gerçek bağış/gönüllü/mesaj/görev verisine bağlanmadı; yalnızca public içerik sayaçları okundu.
- [ ] Repository hata logları secret/key/token/şifre içermiyor.

## Admin Public İçerik CRUD

- [ ] `009_admin_content_crud_policies.sql` staging ortamında uygulanıp test edildi.
- [ ] Proje/haber/rapor create/update/archive işlemleri sadece admin/super_admin hesabıyla çalışıyor.
- [ ] Public/anon insert/update/delete policy açılmadı.
- [ ] Hassas operasyonel tablolara write policy eklenmedi.
- [ ] Hard delete kullanılmıyor; arşivleme status update ile yapılıyor.
- [ ] Audit log helper create/update/archive işlemlerinde best-effort çalışıyor.
- [ ] CRUD formları server-side validation hatalarını kullanıcı dostu gösteriyor.
- [ ] Production öncesi gerçek admin hesabıyla staging smoke/manual CRUD testi yapıldı.

## Veri Güvenliği ve KVKK

- [ ] Çocuk/sponsorluk verileri maskeli ve sınırlı görünüyor.
- [ ] Bağışçı ve gönüllü kişisel verileri rol bazlı korunuyor.
- [ ] Sponsor yalnızca kendi sponsorluk kayıtlarını görebiliyor.
- [ ] Personel yalnızca kendi görev ve mesajlarını görebiliyor.
- [ ] Koordinatör yalnızca kendi ekip/faaliyet kapsamını görebiliyor.
- [ ] KVKK/hukuk danışmanı yasal metinleri kontrol etti.
- [ ] Veri saklama ve imha politikası belirlendi.

## Export ve Raporlama

- [ ] Export işlemleri yetki kontrolünden geçiyor.
- [ ] Export işlemleri audit/export log'a düşüyor.
- [ ] CSV injection önlemleri test edildi.
- [ ] Kişisel veri maskeleme varsayılan olarak açık.

## Operasyon

- [ ] Domain ve SSL doğru.
- [ ] Backup stratejisi tanımlandı.
- [ ] Monitoring ve hata takibi planlandı.
- [ ] Payment webhook güvenliği ayrı test edildi.
- [ ] Son `npm run lint`, `npm run build`, `npm run check:supabase-env`, `npm run test:supabase` kontrolleri geçti.
- [ ] Son `npm run test:supabase-auth` rol test env yoksa kontrollü atladı veya tanımlı test kullanıcılarında rol/profile/account doğrulamasını geçti.

## Son Onay

- [ ] Yönetim onayı alındı.
- [ ] Teknik sorumlu onayı alındı.
- [ ] Hukuk/KVKK onayı alındı.
- [ ] Yayın geri dönüş planı hazır.
