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
