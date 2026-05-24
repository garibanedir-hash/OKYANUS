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
- [ ] Admin public içerik CRUD işlemleri sadece `admin` veya `super_admin` rolüyle yapılabiliyor mu?

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
- [ ] 8F read-only public bağlantılar sadece `projects`, `news_posts` ve `reports` gibi düşük riskli public tablolara gidiyor mu?
- [ ] Hassas tablolar read-only entegrasyon bahanesiyle public erişime açılmadı mı?
- [ ] 9A write policy'leri yalnızca public içerik tabloları için authenticated admin/super_admin kapsamıyla açıldı mı?
- [ ] Public/anon insert/update/delete kesinlikle kapalı mı?
- [ ] Hard delete yerine archive/status update kullanılıyor mu?
- [ ] Kurban modülünde public/anon yalnızca aktif `qurban_campaigns` kayıtlarını okuyabiliyor mu?
- [ ] `qurban_orders`, `qurban_delegations`, `qurban_shares`, `qurban_operations`, `qurban_distribution_logs`, `qurban_status_logs`, `qurban_notifications` ve `qurban_exports` public erişime kapalı mı?
- [ ] Kurban modülünde insert/update/delete policy sonraki aşamaya bırakıldı mı?
- [ ] Bağışçı, koordinatör ve personel kurban kayıtları ownership/assignment kapsamıyla sınırlandırıldı mı?
- [ ] Kurban başvuru yazımı public tablo insert yerine server-side `create_qurban_order` RPC ile yapılıyor mu?
- [ ] `create_qurban_order` RPC anon/authenticated rollerden revoke edildi mi?
- [ ] Kurban kontenjan rezervasyonu transaction içinde satır kilidiyle kontrol ediliyor mu?
- [ ] 9C.1 sonrası public kurban sayfalarında gereksiz teknik veri kaynağı veya hassas operasyon detayı gösterilmiyor mu?
- [ ] Guest kurban başvuruları panelde e-posta ile otomatik eşleştirilmiyor mu?
- [ ] Yetim hamiliği modülünde public/anon yalnızca aktif `sponsorship_programs` kayıtlarını okuyabiliyor mu?
- [ ] `orphan_profiles`, `sponsorships`, `sponsorship_applications`, `sponsorship_matches`, `sponsorship_payments`, `orphan_updates`, `orphan_sponsorship_notes`, `orphan_assignments`, `sponsorship_notifications`, `sponsorship_exports` ve `sponsorship_status_logs` public erişime kapalı mı?
- [ ] Yetim hamiliği başvuru yazımı public insert policy yerine server-side action ve server-only repository ile yapılıyor mu?
- [ ] Sponsor yalnızca kendi `sponsor_account_id` veya hesap e-postasıyla ilişkili başvuruları okuyabiliyor mu?
- [ ] Sponsor güvenli yetim özetini yalnızca kendi sponsorship ilişkisi üzerinden okuyabiliyor mu?
- [ ] Koordinatör/personel yalnızca kendisine atanmış yetim/sponsorluk görevlerini okuyabiliyor mu?
- [ ] Ortak ödeme tabloları (`payment_intents`, `payment_events`, `payment_provider_events`, `receipts`, `notification_queue`, `payment_status_logs`) public/anon erişime kapalı mı?
- [ ] Authenticated donor yalnızca kendi `donor_account_id` ilişkili payment intent ve receipt kayıtlarını okuyabiliyor mu?
- [ ] Admin/super_admin dışında payment event, provider event, notification queue ve payment status log okunamıyor mu?
- [ ] `sponsored_orphans_safe_view` `security_invoker = true` ve anon erişime kapalı mı?
- [ ] Supabase Security Advisor 9E.1 sonrası payment ve safe view için uyarısız mı?

## Form validation

- [ ] Client-side validasyon eklendi.
- [ ] Server-side validasyon eklendi.
- [ ] Hata mesajları erişilebilir yazıldı.
- [ ] Kurban formunda vekalet ve KVKK onayı olmadan kayıt oluşmuyor mu?
- [ ] Kurban formu honeypot alanı bot submitlerini gerçek kayıt oluşturmadan karşılıyor mu?
- [ ] Yetim hamiliği başvuru formunda KVKK onayı olmadan kayıt oluşmuyor mu?
- [ ] Yetim hamiliği başvuru formu honeypot alanı bot submitlerini gerçek kayıt oluşturmadan karşılıyor mu?

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

- [ ] 9E'de canlı provider webhook endpoint'i açılmadığı doğrulandı.
- [ ] Gelecek webhook için signature doğrulama planı eklendi.
- [ ] Payment intent ve provider event idempotency alanları hazırlandı.
- [ ] Tutar ve para birimi server-side doğrulama planı hazırlandı.
- [ ] Kart numarası, CVV veya banka şifresi gibi hassas ödeme verisi saklanmadığı doğrulandı.
- [ ] Provider raw payload yalnızca güvenli özet olarak tutulacak; secret veya tam kart verisi loglanmayacak.

## Audit logs

- [ ] Kritik admin işlemleri loglanıyor.
- [ ] Loglarda hassas veri maskeleniyor.
- [ ] Audit log silme kapalı.
- [ ] Export işlemleri audit log'a düşüyor mu?
- [ ] Personel rol değişiklikleri audit log'a düşüyor mu?
- [ ] Public içerik create/update/archive işlemleri audit helper'a best-effort yazılıyor mu?
- [ ] Kurban vekalet, ödeme, kesim, dağıtım ve export işlemleri production öncesi audit planına eklendi mi?
- [ ] Kurban order create, vekalet kabulü, hisse rezervasyonu ve quota rezervasyonu status/audit log'a düşüyor mu?
- [ ] Kurban başarı ekranında ödeme bekliyor durumu ve admin kayıt notu teknik detay vermeden gösteriliyor mu?
- [ ] Yetim hamiliği başvuru, eşleştirme, sponsorship oluşturma ve orphan sponsorlu durum geçişleri status/audit log'a düşüyor mu?

## PII masking

- [ ] E-posta maskeleme var.
- [ ] Telefon maskeleme var.
- [ ] Export dosyalarında PII sınırlandı.
- [ ] Export kişisel verileri maskeliyor mu?
- [ ] Kurban bağışçı ekranlarında e-posta/telefon maskeli gösteriliyor mu?
- [ ] Kurban export ekranında kişisel veri maskeleme varsayılan açık mı?
- [ ] Admin kurban bağışları ekranında donor adı, e-posta ve telefon maskeli mi?
- [ ] Yetim hamiliği admin ve panel ekranlarında çocuk açık kimliği, açık adresi, okul adı, telefon ve aile detayı gösterilmiyor mu?
- [ ] Sponsor panelinde yalnızca yetim kodu, güvenli ad/rumuz, yaş grubu, bölge ve eğitim özeti gösteriliyor mu?
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
- [ ] Read-only public sorgular yalnızca publishable/anon key ile yapılıyor; service role key kullanılmıyor.
- [ ] Kurban write akışı service role kullanıyorsa sadece server-only repository içinde mi?
- [ ] Kurban form client component'i secret veya service role env import etmiyor mu?
- [ ] Kurban order write repository `server-only` sınırında kalıyor mu?
- [ ] Yetim hamiliği repository'si read-only/mock çalışıyor ve client tarafına service role taşımıyor mu?
- [ ] Yetim hamiliği write repository `server-only` sınırında kalıyor ve service role client tarafına taşınmıyor mu?
- [ ] Payment write repository `server-only` sınırında kalıyor ve service role client tarafına taşınmıyor mu?
- [ ] PayTR helper ve callback kodu server-only kalıyor, `PAYTR_MERCHANT_KEY`/`PAYTR_MERCHANT_SALT` client bundle'a taşınmıyor mu?
- [ ] Public bağış, kurban ve yetim formları payment tablolara doğrudan client-side yazmıyor mu?
- [ ] `.env.local` Git'e dahil değil ve Vercel production env değerleri public/server ayrımıyla tanımlı mı?
- [ ] Production öncesi `NEXT_PUBLIC_ADMIN_DEMO_MODE=false` ve `SITE_MAINTENANCE_MODE` durumu doğrulanıyor mu?

## Error handling

- [ ] Kullanıcıya güvenli hata mesajı gösteriliyor.
- [ ] Teknik detaylar public ekrana basılmıyor.
- [ ] Kritik hatalar loglanıyor.
- [ ] Supabase read-only hata/timeout durumunda public sayfa mock fallback veya empty state ile açılıyor.
- [ ] Read-only repository logları secret/key/token/şifre içermiyor.
- [ ] Kurban Supabase read hatalarında admin/panel ekranları güvenli mock fallback veya boş state ile açılıyor mu?
- [ ] Yetim hamiliği Supabase read hatalarında public/admin/panel ekranları güvenli mock fallback veya boş state ile açılıyor mu?

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
- [ ] Bağışçı yalnızca kendi kurban siparişi ve vekalet durumunu görebiliyor mu?
- [ ] Sponsor yalnızca kendi sponsorluklarını görebiliyor mu?
- [ ] Yetim/çocuk verileri maskeleniyor mu?
- [ ] Yetim hamiliği güncellemelerinde açık adres, okul adı, kimlik, telefon, aile detayı ve hassas fotoğraf engelleniyor mu?
- [ ] Gönüllü yalnızca kendi başvurularını ve görevlerini görebiliyor mu?
- [ ] Personel yalnızca kendi görevlerine erişiyor mu?
- [ ] Koordinatör sadece kendi ekibine erişiyor mu?
- [ ] Koordinatör/personel yalnızca kendisine atanmış kurban operasyonlarını görebiliyor mu?
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
- [ ] `npm run test:supabase` production öncesi `Security warning: 0` veriyor.

## PayTR Test Entegrasyon Güvenliği

- [ ] `/odeme/paytr/[intentNo]` yalnızca PayTR iframe gösteriyor; kart alanı geliştirmiyor.
- [ ] `/api/paytr/callback` session kullanmıyor ve sadece hash doğrulamasıyla işlem yapıyor.
- [ ] PayTR ok/fail sayfaları ödeme onayı veya iptali yapmıyor.
- [ ] Duplicate callback idempotent işleniyor.
- [ ] Callback payload summary hassas secret veya tam kart verisi içermiyor.
- [ ] Production öncesi `PAYTR_TEST_MODE=false` geçişi yazılı onay ve test tamamlanmadan yapılmıyor.

## 10B Payment Intent Başlatma Güvenliği

- [ ] Genel bağış payment intent server action ile oluşturuluyor; client doğrudan payment tablolarına yazmıyor.
- [ ] Kurban payment intent tutarı server-side oluşturulan order toplamından geliyor.
- [ ] Yetim sponsorship payment intent tutarı server-side sponsorship/program değerinden geliyor.
- [ ] Aynı context için bekleyen intent tekrar kullanılıyor; duplicate pending kayıt oluşmuyor.
- [ ] PayTR env eksikliği kullanıcıya güvenli ve teknik detay içermeyen mesajla gösteriliyor.
- [ ] Public ödeme sayfasında merchant key/salt, hash veya teknik callback detayı gösterilmiyor.
