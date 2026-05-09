# Güvenlik Checklist

## Auth

- [ ] Admin route'ları auth gerektiriyor.
- [ ] MFA ihtiyacı değerlendirildi.
- [ ] Oturum süresi ve güvenli çıkış tanımlandı.
- [ ] Supabase env değişkenleri tanımlandı mı?
- [ ] Session refresh test edildi mi?
- [ ] Password reset flow planlandı mı?

## RBAC

- [ ] Roller net tanımlandı.
- [ ] UI aksiyonları role göre sınırlandı.
- [ ] Backend/server action yetki kontrolü eklendi.
- [ ] Admin role validation server-side yapılacak mı?

## RLS

- [ ] Public read tabloları ayrıldı.
- [ ] Hassas tablolar public read'e kapatıldı.
- [ ] RLS policy'leri staging ortamında test edildi.
- [ ] RLS policy testleri yapıldı mı?

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

## Environment variables

- [ ] Gizli anahtarlar client bundle'a girmiyor.
- [ ] Production/staging env ayrıldı.
- [ ] Secret rotation planlandı.
- [ ] Secret/service role key client tarafına sızmıyor mu?
- [ ] Production secret management planlandı mı?

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
