# Hukuki Final Kontrol Checklist

Bu checklist 14C kapanışı öncesi hukukçu, dernek yönetimi ve teknik sorumlunun birlikte kontrol etmesi için hazırlanmıştır. Teknik altyapı hukuki uyuma yardımcı olur; nihai hukuki uygunluk iddiası yerine geçmez.

## Kurumsal Bilgiler

- [ ] Dernek resmi adı doğrulandı.
- [ ] Resmi adres nihai metinlere eklenecek mi kararlaştırıldı.
- [ ] Dernek sicil no, vergi no ve yetkili iletişim bilgileri kesinleştirildi.
- [ ] Veri sorumlusu bilgisi nihai metinlerde doğru ve güncel.
- [ ] Public metinlerde bilinmeyen resmi bilgi uydurulmadı.

## Hukuki Metinler

- [ ] KVKK Aydınlatma Metni hukukçu tarafından okundu.
- [ ] Açık Rıza Metni KVKK Aydınlatma Metni'nden ayrı değerlendirildi.
- [ ] Gizlilik Politikası teknik hizmet sağlayıcı ve WhatsApp yönlendirmesiyle uyumlu.
- [ ] Çerez Politikası aktif çerez kategorileriyle uyumlu.
- [ ] Bağış Bilgilendirme ve Şartları mevcut `DONATION_MODE` davranışıyla uyumlu.
- [ ] Online ödeme açılmadan önce bağış ve mesafeli bağış/online ödeme metinleri tekrar kontrol edilecek.
- [ ] Gönüllü Başvuru Aydınlatma Metni formda alınan veri alanlarıyla uyumlu.
- [ ] İletişim Formu Aydınlatma Metni iletişim formu işleme amacıyla uyumlu.
- [ ] Görsel/medya kullanımı için ayrıca açık rıza gerekip gerekmediği kararlaştırıldı.

## Form Onayları ve Kayıt İzleri

- [ ] İletişim formunda KVKK/aydınlatma beyanı zorunlu.
- [ ] Gönüllü formunda KVKK/aydınlatma beyanı ve gerekli açık rıza ayrı alanlarda.
- [ ] Duyuru/bilgilendirme izni ayrı ve opsiyonel.
- [ ] Kayıt formunda Kullanım Şartları kabulü KVKK/onay alanlarından ayrı.
- [ ] Form submitlerinde `consent_text_version` tutuluyor.
- [ ] Form submitlerinde `consent_given_at` tutuluyor.
- [ ] Form submitlerinde `consent_user_agent` tutuluyor.
- [ ] Ham IP toplanmıyorsa bu karar hukukçu ve yönetim tarafından kabul edildi.
- [ ] `consent_metadata` içinde form context bilgisi tutuluyor.

## Çerez Tercihleri

- [ ] İlk ziyarette çerez banner'ı görünüyor.
- [ ] Zorunlu çerezler kapatılamıyor.
- [ ] İşlevsel, analitik ve pazarlama kategorileri ayrı yönetiliyor.
- [ ] Kullanıcı çerez tercihlerini footer üzerinden tekrar açabiliyor.
- [ ] Çerez tercihleri localStorage/cookie ile saklanıyor.
- [ ] İlk sürümde public DB write açılmadığı teyit edildi.
- [ ] Analitik veya pazarlama aracı eklendiğinde politika ve tercih sürümü güncellenecek.

## Migration ve DB Kontrolleri

- [ ] `024_legal_consent_and_cookie_preferences.sql` staging ortamında uygulandı.
- [ ] `site_cookie_consents` tablosu oluştu.
- [ ] `site_cookie_consents` RLS enabled/forced ve public/anon erişime kapalı.
- [ ] `contact_messages` consent kolonlarını içeriyor.
- [ ] `volunteer_applications` consent kolonlarını içeriyor.
- [ ] `payment_intents` consent kolonlarını içeriyor.
- [ ] `qurban_orders` consent kolonlarını içeriyor.
- [ ] `sponsorship_applications` consent kolonlarını içeriyor.
- [ ] `npm run test:supabase` sonucu `Security warning: 0` veriyor.
- [ ] Migration sonrası `Missing table: 0` sonucu alındı.

## SQL Kontrol Snippetleri

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'site_cookie_consents';
```

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'contact_messages',
    'volunteer_applications',
    'qurban_orders',
    'sponsorship_applications',
    'payment_intents'
  )
  and (
    column_name like '%consent%'
    or column_name in ('kvkk_acknowledged', 'explicit_consent_given', 'communication_permission_given')
  )
order by table_name, column_name;
```

## Yayın Öncesi Kararlar

- [ ] Hukukçu son okuma tamamlandı.
- [ ] Yönetim son onayı alındı.
- [ ] Teknik sorumlu migration ve test sonuçlarını onayladı.
- [ ] Online ödeme açılmadan önce hukuki metinlerin tekrar gözden geçirileceği kabul edildi.
- [ ] Çerez/analitik sağlayıcı eklenirse bu checklist yeniden çalıştırılacak.
