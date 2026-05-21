# Backend Readiness Checklist

Backend hazırlığının güvenlik odağında tamamlandığını kontrol etmek için kullanılır.

## Supabase Key Kullanımı

- [ ] Smoke test yalnızca `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanıyor.
- [ ] `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` smoke test içinde kullanılmıyor.
- [ ] Service role yalnızca server-side admin/service işlemlerinde kullanılıyor.

## RLS Lockdown

- [ ] `006_lockdown_sensitive_tables.sql` staging ortamında çalıştırıldı.
- [ ] Hassas tablolar public read'e kapalı.
- [ ] Public SELECT policy kalıntıları hassas tablolardan temizlendi.
- [ ] Public tablolar sadece yayınlanmış/public kayıtları döndürüyor.

## Hassas Veri Alanları

- [ ] Bağış verileri varsayılan kapalı.
- [ ] Gönüllü başvuruları varsayılan kapalı.
- [ ] İletişim mesajları varsayılan kapalı.
- [ ] Görev ve iç mesaj tabloları varsayılan kapalı.
- [ ] Personel/kullanıcı/rol tabloları varsayılan kapalı.
- [ ] Sponsorluk ve çocuk verileri varsayılan kapalı.

## 8C Hazırlığı

- [ ] `/admin`, `/panel`, `/koordinator`, `/personel` için proxy/server guard hazırlığı tamamlandı.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` demo erişimi, `false` auth guard davranışı net.
- [ ] Public login/register ve admin login server action'ları Supabase Auth'a hazır.
- [ ] Role redirect fallback stratejisi belirlendi.
- [ ] Authenticated ownership policy tasarımı hazır.
- [ ] Admin/role-based policy tasarımı hazır.
- [ ] Audit log policy tasarımı hazır.
- [ ] Export yetki/audit modeli hazır.

## 8D Öncesi Ek Kontroller

- [ ] `profiles`, `user_accounts`, `admin_roles`, `role_permissions` read-only doğrulaması RLS ile test edildi.
- [ ] İlk Super Admin kurulum akışı staging ortamında doğrulandı.
- [ ] Bağışçı/gönüllü/koordinatör/personel test hesaplarıyla beklenen panel yönlendirmeleri çalışıyor.

## 8D Authenticated Policy Kontrolleri

- [ ] İlk Super Admin Auth kullanıcısı oluşturuldu.
- [ ] İlk Super Admin için `profiles` kaydı oluşturuldu.
- [ ] İlk Super Admin için `user_accounts` kaydı oluşturuldu.
- [ ] `admin_roles` ve `role_permissions` kayıtları oluşturuldu.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` staging denemesi yapıldı.
- [ ] `/admin/giris` login testi geçti.
- [ ] `npm run test:supabase-auth` test kullanıcısıyla çalıştı veya test env yoksa kontrollü atladı.
- [ ] 007 authenticated policy staging ortamında çalıştırıldı.
- [ ] Bağışçı kendi verisini görebiliyor.
- [ ] Bağışçı başkasının verisini göremiyor.
- [ ] Gönüllü kendi başvuru/görev verisini görebiliyor.
- [ ] Personel yalnızca kendi görev/mesaj kayıtlarını görebiliyor.
- [ ] Koordinatör yalnızca kendi ekip/faaliyet kapsamına erişiyor.
- [ ] Public lockdown hâlâ korunuyor ve `npm run test:supabase` Security warning 0 veriyor.

## 8E Rol Test Kullanıcı Kontrolleri

- [ ] Test kullanıcıları gerçek kullanıcı veya production kişisel verisiyle ilişkilendirilmedi.
- [ ] Test kullanıcı e-posta/şifreleri yalnızca `.env.local` veya güvenli staging env içinde tutuluyor.
- [ ] Test kullanıcıları production öncesi silinecek veya devre dışı bırakılacak.
- [ ] Metadata tek başına güvenlik kaynağı kabul edilmiyor; server guard + RLS esas alınıyor.
- [ ] `profiles.role` ve `user_accounts.account_type` değerleri rol bazlı test hesaplarında uyumlu.
- [ ] Super Admin/Admin `/admin` dışındaki yetkisiz route davranışlarıyla test edildi.
- [ ] Bağışçı yalnızca bağışçı paneline, gönüllü yalnızca gönüllü paneline yönleniyor.
- [ ] Donor + volunteer hesabı `/panel` ortak girişine yönleniyor.
- [ ] Koordinatör `/koordinator`, personel `/personel` ile sınırlı.
- [ ] `npm run test:supabase-auth` env yoksa kontrollü atlıyor, env varsa login/profile/account/route doğrulaması yapıyor.

## 8F Read-only Veri Bağlantısı Kontrolleri

- [ ] `projects`, `news_posts` ve `reports` public read-only repository üzerinden okunuyor.
- [ ] Supabase env yoksa public sayfalar mock fallback ile açılıyor.
- [ ] Supabase hata/timeout/RLS engelinde uygulama beyaz ekran vermeden mock fallback'e dönüyor.
- [ ] Supabase başarılı ama kayıt boşsa sayfalarda düzgün empty state gösteriliyor.
- [ ] Admin içerik listeleri sadece public içerik tablolarını read-only okuyor; CRUD yok.
- [ ] Admin dashboard yalnızca public içerik sayaçlarını Supabase'ten okuyor.
- [ ] Bağış, gönüllü, mesaj, görev, kullanıcı ve sponsorluk gibi hassas tablolar 8F'de gerçek veri kaynağına bağlanmadı.
- [ ] Repository logları secret/key/token/şifre bilgisi yazmıyor.
- [ ] `npm run test:supabase` sonucu `Security warning: 0` olarak korunuyor.

## 9A Admin Public İçerik CRUD Kontrolleri

- [ ] `009_admin_content_crud_policies.sql` staging ortamında çalıştırıldı.
- [ ] Admin CRUD server action'ları write öncesi `profiles.role` admin/super_admin ve `status = active` doğruluyor.
- [ ] Proje, haber ve rapor create/update işlemleri client tarafına service role taşımadan çalışıyor.
- [ ] Arşivleme hard delete yerine status update ile yapılıyor.
- [ ] Public/anon insert/update/delete policy açılmadı.
- [ ] Hassas tablolar için CRUD veya write policy eklenmedi.
- [ ] Audit log helper best-effort çalışıyor ve audit hatası CRUD işlemini patlatmıyor.
- [ ] Draft/archived kayıtlar public sitede görünmüyor.
- [ ] Server-side validation title/slug/status/numeric/url/metrics alanlarını kontrol ediyor.

## 9B Kurban Modülü Kontrolleri

- [ ] `010_qurban_module.sql` staging ortamında çalıştırıldı.
- [ ] Public/anon yalnızca aktif `qurban_campaigns` kayıtlarını okuyabiliyor.
- [ ] Public/anon kurban siparişi, vekalet, hisse, operasyon, dağıtım, bildirim ve export tablolarını okuyamıyor.
- [ ] Bağışçı yalnızca kendi `donor_account_id` ilişkili kurban kayıtlarını görebiliyor.
- [ ] Koordinatör/personel yalnızca kendisine atanmış kurban operasyon kapsamını görebiliyor.
- [ ] Kurban modülü bu aşamada gerçek ödeme, gerçek kayıt, makbuz veya dosya upload yapmıyor.
- [ ] Vekalet metni yönetim, hukuk danışmanı ve dini danışman onayı olmadan production'da kullanılmıyor.
- [ ] Kurban export ekranında kişisel veri maskeleme varsayılan açık planlandı.
- [ ] Service role key client tarafına taşınmadan read-only/mock akış korunuyor.

## 9C Kurban Kayıt Akışı Kontrolleri

- [ ] `011_qurban_order_flow.sql` staging ortamında çalıştırıldı.
- [ ] `/kurban/bagis` formu server action üzerinden kayıt oluşturuyor; client tarafında service role key yok.
- [ ] `create_qurban_order` RPC anon/authenticated rollere açık değil, sadece server-side service role ile çağrılıyor.
- [ ] Vekalet ve KVKK onayı olmadan order oluşturulmuyor.
- [ ] `qurban_orders`, `qurban_delegations`, `qurban_shares` ve `qurban_status_logs` kayıtları aynı DB transaction içinde oluşuyor.
- [ ] `qurban_campaigns.quota_reserved` kontenjan aşımı olmadan artırılıyor.
- [ ] Girişsiz başvurularda `donor_account_id` null kalıyor ve panelde otomatik görünmüyor.
- [ ] Girişli bağışçı başvuruları `donor_account_id` ile panelde görünüyor.
- [ ] Yeni kurban tabloları smoke testte public/protected kapsamına eklendi ve `Security warning: 0` korunuyor.

## 9C.1 Kurban Stabilizasyon Kontrolleri

- [ ] Public `/kurban` sayfası kampanya, kurban türleri, vekalet, kesim, dağıtım ve bilgilendirme sürecini teknik detay göstermeden açıklıyor.
- [ ] `/kurban/[slug]` kampanya adı, türü, bölgesi, birim bedeli, kontenjanı ve bağış CTA davranışını doğru gösteriyor.
- [ ] `/kurban/bagis?kampanya=slug` doğru kampanyayı önden seçiyor.
- [ ] Başarı ekranı sipariş no, vekalet kaydı, ödeme bekliyor durumu ve admin kayıt notunu gösteriyor.
- [ ] Admin kurban bağışları ekranı maskeli kişisel veri ve anlaşılır durum rozetleriyle read-only çalışıyor.
- [ ] Admin kurban dashboard metrikleri Supabase okunabiliyorsa gerçek kayıtları, okunamıyorsa güvenli mock fallback'i gösteriyor.
- [ ] `/panel/kurbanlarim` girişli donor kayıtlarını gösteriyor; guest kayıtların otomatik görünmeyeceğini açıklıyor.
- [ ] Koordinatör/personel kurban ekranları demo/read-only olduğunu belli ediyor ve bağışçı kişisel verisi göstermiyor.
- [ ] `docs/qurban-manual-test-checklist.md` staging manuel testlerinde kullanılıyor.
- [ ] 9D ödeme entegrasyonu öncesi webhook signature, idempotency, server-side tutar doğrulama ve quota release planı hazır.
