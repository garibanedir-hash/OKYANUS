# İç Operasyon, Görev ve İletişim Sistemi

Bu doküman Okyanus İnsani Yardım Derneği admin panelinde görev atama, iç mesajlaşma ve personel koordinasyonu için hazırlanan frontend/demo mimariyi açıklar. Bu aşamada gerçek backend veya gerçek zamanlı mesajlaşma yoktur.

## Amaç

- Adminlerin personel veya diğer adminlere görev atayabilmesi.
- Görevlerin durum, öncelik, termin ve ilişkili modül bilgisiyle takip edilmesi.
- Proje, bağış, gönüllü başvurusu, iletişim mesajı ve faaliyet raporlarıyla bağlantılı iç koordinasyon kurulması.
- Personel arası mesajlaşma ve görev yorumları için veri modeli hazırlamak.
- Supabase Realtime ve notification altyapısına geçişi kolaylaştırmak.

## Görev Akışı

1. Yetkili kullanıcı görev oluşturur.
2. Görev bir personele veya role atanır.
3. Görev ilgili entity ile bağlanır: proje, bağış, gönüllü başvurusu, iletişim mesajı, faaliyet raporu veya genel.
4. Atanan kişi durum günceller ve iç not ekler.
5. Durum değişiklikleri audit log’a düşer.
6. Görev tamamlandığında kapanış tarihi kaydedilir.

## Mesajlaşma Akışı

1. Konuşma oluşturulur veya görev üzerinden otomatik açılır.
2. Katılımcılar belirlenir.
3. Mesajlar ilgili görev veya entity ile bağlanabilir.
4. Okundu bilgisi ayrı kayıtlarla tutulur.
5. Supabase Realtime aşamasında kanal erişimleri katılımcı listesine göre sınırlandırılır.

## Roller ve Erişim Sınırları

- Super Admin: Tüm görev, mesaj ve personel kayıtlarını yönetebilir.
- Bağış Sorumlusu: Bağış ilişkili görev ve konuşmalara erişebilir.
- Gönüllü Koordinatörü: Gönüllü başvurusu ilişkili görev ve konuşmalara erişebilir.
- Raporlama Sorumlusu: Rapor ve metrik görevlerini yönetebilir.
- İçerik Editörü: İçerik ilişkili görevlerini görebilir ve yorumlayabilir.

## Bildirim Hazırlığı

İleride şu olaylar bildirim üretebilir:

- Yeni görev atandı
- Görev termin tarihi yaklaştı
- Görev gecikti
- Görev yorumu eklendi
- Yeni iç mesaj geldi
- Personel rolü değiştirildi

## Supabase Realtime Planı

- `internal_conversations` ve `internal_messages` için katılımcı bazlı RLS gereklidir.
- Realtime kanalları conversation id ve user id kontrolüyle sınırlandırılmalıdır.
- Mesaj içeriğinde hassas bağışçı verisi paylaşımı engellenmelidir.

## Audit Log İlişkisi

Loglanacak işlemler:

- Görev oluşturma
- Görev atama
- Görev durumu değiştirme
- Görev yorumu ekleme
- İç mesaj gönderme
- Konuşma arşivleme
- Personel rolü değiştirme

## KVKK ve Kurum İçi Gizlilik

- Bağışçı ve gönüllü kişisel verileri iç mesajlarda gereksiz paylaşılmamalıdır.
- Mesaj ve görev içerikleri rol bazlı erişimle sınırlandırılmalıdır.
- Personel ayrıldığında hesap erişimi kapatılmalı, audit kayıtları korunmalıdır.

## Production Öncesi Gereklilikler

- Auth ve RBAC aktif olmalı.
- RLS politikaları test edilmeli.
- Audit log yazımı zorunlu hale getirilmeli.
- Rate limiting ve abuse kontrolleri eklenmeli.
- Realtime kanal yetkileri doğrulanmalı.
- Yedekleme ve saklama politikaları belirlenmelidir.
