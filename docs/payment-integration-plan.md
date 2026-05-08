# Ödeme Entegrasyonu Ön Hazırlık Planı

## Bağış akışının genel mantığı

Bağışçı public bağış formunda tutar, bağış türü, proje ve iletişim bilgilerini girer. Sistem önce `donations` tablosunda `pending` durumunda bir kayıt oluşturur, ardından ödeme sağlayıcısına yönlendirir.

## Bağış formundan ödeme sağlayıcısına gidiş

1. Form doğrulanır.
2. Bağış kaydı oluşturulur.
3. Ödeme oturumu veya ödeme formu başlatılır.
4. Kullanıcı ödeme sağlayıcısına yönlendirilir veya gömülü ödeme ekranını kullanır.

## Callback / webhook dönüşü

Ödeme sağlayıcısı ödeme sonucunu webhook ile güvenli server endpoint’e gönderir. Webhook imzası doğrulanmadan ödeme durumu güncellenmemelidir.

## Başarılı ödeme sonrası

- `donations.status = completed`
- `donations.payment_status = paid`
- `donation_transactions` kaydı oluşturulur.
- Proje bazlı bağışsa ilgili proje toplamları güncellenir veya hesaplanır.
- Makbuz süreci başlatılır.
- Bağışçıya bilgilendirme e-postası gönderilir.

## Başarısız ödeme senaryosu

- `payment_status = failed`
- `donation_status = failed`
- Kullanıcıya tekrar deneme veya farklı ödeme yöntemi seçme imkanı sunulur.

## İptal/iade senaryosu

- İptal: ödeme tamamlanmadan kullanıcı akışı terk ederse `cancelled`.
- İade: tamamlanan ödeme iade edilirse `refunded`.
- İade süreçleri muhasebe ve bağış şartları metinleriyle uyumlu olmalıdır.

## Makbuz oluşturma mantığı

- Makbuz ödeme başarıyla tamamlandıktan sonra oluşturulur.
- Makbuz numarası benzersiz olmalıdır.
- PDF dosyası private storage’da tutulmalıdır.
- Bağışçıya güvenli bağlantı veya e-posta ile iletilebilir.

## Bağışçı bilgilendirme e-postası

E-posta içeriği:

- Bağış tutarı
- Bağış türü
- İlgili proje
- İşlem tarihi
- Makbuz durumu
- Kurumsal teşekkür metni

## Proje bazlı bağış takibi

Her bağış opsiyonel `project_id` ile ilişkilendirilir. Proje ilerleme oranı doğrudan bağış kayıtlarından hesaplanabilir veya performans için periyodik aggregate tablo kullanılabilir.

## Güvenlik gereklilikleri

- Webhook signature doğrulama
- Idempotency key kullanımı
- Server-side tutar doğrulama
- Client tarafına gizli anahtar koymama
- Rate limiting
- İşlem logları

## KVKK ve hassas veri notları

- Kart bilgisi sistemde tutulmamalıdır.
- Bağışçı verisi minimum seviyede alınmalıdır.
- E-posta/telefon gibi alanlar yetkisiz rollere gösterilmemelidir.
- Veri saklama süresi resmi politika ile belirlenmelidir.

## Sağlayıcı alternatifleri

- Banka sanal POS
- Türkiye’de kullanılabilecek ödeme aracıları
- Manuel EFT/havale bildirim sistemi

Bu doküman gerçek entegrasyon yapmaz; yalnızca mimari hazırlık içindir.
