# Güvenlik Checklist

## Auth

- [ ] Admin route'ları auth gerektiriyor.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` olduğunda `/admin`, `/panel`, `/koordinator`, `/personel` route'ları server-side guard ile korunuyor.
- [ ] Demo mode production'da kapalı mı?
- [ ] MFA ihtiyacı değerlendirildi.
- [ ] Oturum süresi ve güvenli çıkış tanımlandı.
- [ ] Supabase env değişkenleri tanımlandı mı?
- [ ] Session refresh test edildi mi?
- [ ] Password reset flow planlandı mı?
- [ ] Rol bazlı test kullanıcıları yalnızca staging/dev ortamda kullanılıyor mu?
- [ ] Test kullanıcı şifreleri sadece `.env.local` veya güvenli staging secret yönetiminde tutuluyor mu?

## RBAC

- [ ] Roller net tanımlandı.
- [ ] UI aksiyonları role göre sınırlandı.
- [ ] Backend/server action yetki kontrolü eklendi.
- [ ] Admin role validation server-side yapılacak mı?
- [ ] Route guard yalnızca client-side görünürlük olarak kalmıyor; proxy/server action/server layout katmanında doğrulanıyor.
- [ ] Bilinmeyen rol güvenli fallback route'a yönlendiriliyor.
- [ ] Admin role validation database (`profiles`, `user_accounts`, `role_permissions`) üzerinden geliyor mu?
- [ ] Metadata tek başına nihai güvenlik kaynağı olarak kullanılmıyor mu?
- [ ] Her rol yalnızca kendi paneline yönleniyor ve diğer panellere erişimi server-side reddediliyor mu?
- [ ] `profiles.role` ve `user_accounts.account_type` uyumu test kullanıcılarıyla doğrulandı mı?

## RLS

- [ ] Public read tabloları ayrıldı.
- [ ] Hassas tablolar public read'e kapatıldı.
- [ ] RLS policy'leri staging ortamında test edildi.
- [ ] RLS policy testleri yapıldı mı?
- [ ] Smoke test anon/publishable key ile çalışıyor mu?
- [ ] Service role ile RLS testi yapılmadığı doğrulandı mı?
- [ ] Bağış, gönüllü, iletişim, görev, mesaj, personel, sponsorluk ve çocuk verileri varsayılan kapalı mı?
- [ ] Hassas tablolarda yanlışlıkla public SELECT policy kalmadı mı?
- [ ] RLS, route guard'dan bağımsız şekilde asıl veri güvenliği katmanı olarak korunuyor mu?
- [ ] Authenticated ownership policy staging ortamında test edildi mi?
- [ ] Authenticated user başkasının verisine erişemiyor mu?

## Form validation

- [ ] Client-side validasyon eklendi.
- [ ] Server-side validasyon eklendi.
- [ ] Hata mesajları erişilebilir yazıldı.

## Rate limiting

- [ ] Bağış formu için limit uygulandı.
- [ ] Gönüllü formu için limit uygulandı.
- [ ] İletişim formu için limit uygulandı.
- [ ] Login rate limit / brute force koruması planlandı mı?

## File upload security

- [ ] MIME türleri sınırlandı.
- [ ] Dosya boyutu sınırı belirlendi.
- [ ] Private/public bucket ayrımı yapıldı.
- [ ] Dosya path normalizasyonu uygulandı.
- [ ] Storage bucket policy tanımlandı mı?

## Payment webhook security

- [ ] Webhook signature doğrulama eklendi.
- [ ] Idempotency kontrolü eklendi.
- [ ] Tutar ve para birimi server-side doğrulandı.

## Audit logs

- [ ] Kritik admin işlemleri loglanıyor.
- [ ] Loglarda hassas veri maskeleniyor.
- [ ] Audit log silme kapalı.
- [ ] Export işlemleri audit log'a düşüyor mu?
- [ ] Personel rol değişiklikleri audit log'a düşüyor mu?

## PII masking

- [ ] E-posta maskeleme var.
- [ ] Telefon maskeleme var.
- [ ] Export dosyalarında PII sınırlandı.
- [ ] Export kişisel verileri maskeliyor mu?
- [ ] İç mesajlarda hassas veri paylaşımı engelleniyor mu?

## Backup

- [ ] Veritabanı backup planı var.
- [ ] Storage backup planı var.
- [ ] Restore testi yapıldı.

## Admin route protection

- [ ] Middleware/server guard var.
- [ ] Yetkisiz erişim ekranı var.
- [ ] Public site admin linki göstermiyor.
- [ ] proxy.ts admin route guard için hazır mı?
- [ ] /admin/giris route'u koruma dışı mı?
- [ ] /giris ve /kayit public auth route'ları koruma dışında mı?
- [ ] /panel route'ları bağışçı/gönüllü account type ile korunuyor mu?
- [ ] /koordinator route'ları koordinatör rolü ve assignment kapsamı ile korunuyor mu?
- [ ] /personel route'ları sadece kendi görev/mesaj/profil verisine erişiyor mu?
- [ ] /tadilat redirect loop dışında mı?
- [ ] `/admin/giris`, `/giris` ve `/kayit` route'ları auth guard dışında kalıyor mu?
- [ ] Demo mode production'da kapatılıyor mu?
- [ ] Production'da `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` verilse bile demo bypass etkisiz kalıyor mu?
- [ ] Yetkisiz route mesajı kullanıcı dostu ve teknik detaylardan arındırılmış mı?

## Environment variables

- [ ] Gizli anahtarlar client bundle'a girmiyor.
- [ ] Production/staging env ayrıldı.
- [ ] Secret rotation planlandı.
- [ ] Secret/service role key client tarafına sızmıyor mu?
- [ ] Production secret management planlandı mı?
- [ ] Test kullanıcı env değerleri GitHub'a veya public deploy loglarına yazılmıyor mu?

## Error handling

- [ ] Kullanıcıya güvenli hata mesajı gösteriliyor.
- [ ] Teknik detaylar public ekrana basılmıyor.
- [ ] Kritik hatalar loglanıyor.

## Logging

- [ ] Server logları merkezi takip ediliyor.
- [ ] Hassas veri loglara yazılmıyor.
- [ ] Log retention süresi tanımlı.

## KVKK/data retention

- [ ] Veri minimizasyonu uygulandı.
- [ ] Saklama süreleri belirlendi.
- [ ] Silme/anonimleştirme akışı tanımlandı.
- [ ] Export işlemleri yetkiye bağlı mı?
- [ ] İç mesajlara sadece katılımcılar erişebiliyor mu?
- [ ] Görevleri sadece yetkili roller görüntülüyor mu?
- [ ] Supabase Realtime kullanılacaksa kanal erişimleri sınırlandırıldı mı?
- [ ] Bağışçı yalnızca kendi bağışlarını görebiliyor mu?
- [ ] Sponsor yalnızca kendi sponsorluklarını görebiliyor mu?
- [ ] Yetim/çocuk verileri maskeleniyor mu?
- [ ] Gönüllü yalnızca kendi başvurularını ve görevlerini görebiliyor mu?
- [ ] Personel yalnızca kendi görevlerine erişiyor mu?
- [ ] Koordinatör sadece kendi ekibine erişiyor mu?
- [ ] Kullanıcı rol değişiklikleri audit log'a düşüyor mu?
- [ ] Panel erişimleri server-side doğrulanıyor mu?
- [ ] Public kayıt spam/rate limit ile korunuyor mu?
- [ ] Hesap oluşturma KVKK onayı alıyor mu?

## Deployment security

- [ ] HTTPS zorunlu.
- [ ] Security headers ayarlandı.
- [ ] Dependency audit süreci var.
- [ ] Production build doğrulanıyor.
- [ ] Test kullanıcıları production ortamında kullanılmıyor.
- [ ] Test kullanıcıları production öncesi silindi veya devre dışı bırakıldı.
- [ ] Server guard + RLS doğrulaması, UI görünürlüğünden bağımsız olarak geçerli.
