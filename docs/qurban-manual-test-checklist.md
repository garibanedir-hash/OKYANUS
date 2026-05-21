# Kurban Manuel Test Checklist

Bu liste 9C.1 Kurban Modülü Stabilizasyon ve Son Düzeltmeler aşamasında ödeme entegrasyonu açılmadan önce kullanılmalıdır.

## Migration ve Veri Hazırlığı

- [ ] `010_qurban_module.sql` staging ortamında çalıştı mı?
- [ ] `011_qurban_order_flow.sql` staging ortamında çalıştı mı?
- [ ] En az bir aktif `qurban_campaigns` kampanyası var mı?

## Public Akış

- [ ] `/kurban` sayfası açılıyor mu?
- [ ] `/kurban/[slug]` kampanya detayı açılıyor mu?
- [ ] Kampanya detayındaki "Bu Kampanyaya Kurban Bağışı Yap" linki doğru `?kampanya=slug` query ile `/kurban/bagis` sayfasına gidiyor mu?
- [ ] `/kurban/bagis` formu açılıyor mu?
- [ ] URL'de `?kampanya=slug` varsa doğru kampanya seçili geliyor mu?
- [ ] Hisse/adet seçildiğinde tutar açık şekilde hesaplanıyor mu?
- [ ] Vekalet olmadan submit engelleniyor mu?
- [ ] KVKK olmadan submit engelleniyor mu?
- [ ] Honeypot alanı görünür kullanıcı deneyimini etkilemeden çalışıyor mu?

## Başarılı Başvuru

- [ ] Başarılı submit sonrası "Kurban bağış başvurunuz alınmıştır." mesajı görünüyor mu?
- [ ] Başarılı submit sonrası `order_no` gösteriliyor mu?
- [ ] Başarı ekranında vekalet durumunun kaydedildiği bilgisi var mı?
- [ ] Başarı ekranında ödeme durumunun "Ödeme bekleniyor" olduğu bilgisi var mı?
- [ ] Ödeme entegrasyonu tamamlandığında sürecin aktifleşeceği açıklanıyor mu?
- [ ] Admin tarafında kayıt altına alındığına dair kurumsal not var mı?

## Veritabanı Kontrolleri

- [ ] `qurban_orders` kaydı oluştu mu?
- [ ] `qurban_delegations.accepted = true` kaydı oluştu mu?
- [ ] `qurban_delegations.accepted_at` dolu mu?
- [ ] `qurban_delegations.status = accepted` mı?
- [ ] `qurban_shares` kayıtları `share_count` kadar oluştu mu?
- [ ] `qurban_campaigns.quota_reserved` doğru miktarda arttı mı?
- [ ] `qurban_status_logs` içinde order, delegation, share ve quota olayları oluştu mu?

## Admin ve Panel Kontrolleri

- [ ] Admin kurban bağışları ekranında yeni kayıt görünüyor mu?
- [ ] Admin kurban bağışları ekranında kişisel veri maskeli mi?
- [ ] Admin kurban dashboard metrikleri yeni kayıtları yansıtıyor mu veya güvenli mock fallback gösteriyor mu?
- [ ] Girişli donor ile oluşturulan kayıt `/panel/kurbanlarim` içinde görünüyor mu?
- [ ] Guest kayıtlar `/panel/kurbanlarim` içinde otomatik görünmüyor mu?
- [ ] Koordinatör kurban operasyon ekranı demo/read-only olduğunu belli ediyor mu?
- [ ] Personel kurban görevleri ekranı demo/read-only olduğunu belli ediyor mu?

## Smoke ve Güvenlik

- [ ] `npm run test:supabase` sonucu `Public read OK: 7` mi?
- [ ] `npm run test:supabase` sonucu `Protected OK: 35` mi?
- [ ] `npm run test:supabase` sonucu `Security warning: 0` mı?
- [ ] Public/anon yalnızca aktif `qurban_campaigns` kayıtlarını okuyabiliyor mu?
- [ ] Public/anon `qurban_orders`, `qurban_delegations`, `qurban_shares`, `qurban_operations`, `qurban_distribution_logs`, `qurban_status_logs`, `qurban_notifications` ve `qurban_exports` tablolarını okuyamıyor mu?

## Production Öncesi Onay

- [ ] Vekalet metni dernek yönetimi, hukuk danışmanı ve dini danışman tarafından onaylandı mı?
- [ ] KVKK metinleri hukuk/KVKK danışmanı tarafından kontrol edildi mi?
- [ ] 9D ödeme entegrasyonu öncesi webhook signature, idempotency, tutar doğrulama ve quota release planı hazır mı?
