# Admin Dashboard Geliştirme Notları

## Dashboard'un amacı

Admin dashboard, Okyanus İnsani Yardım Derneği operasyonlarının tek ekrandan izlenebilmesi için tasarlanmış demo kontrol merkezidir. Amaç; bağış, kampanya, gönüllülük, raporlama ve sistem durumunu gerçek backend öncesinde yönetilebilir bir bilgi mimarisiyle göstermektir.

## KPI kartları mantığı

KPI kartları günlük ve dönemsel operasyonu hızlı okumak için hazırlanmıştır:

- Bugünkü bağış tutarı
- Bugünkü bağış işlemi
- Aktif kampanya sayısı
- Yeni gönüllü başvurusu
- Toplam destekçi
- Tamamlanan proje

Her kart başlık, ana değer, kısa açıklama, trend göstergesi ve ikon içerir.

## Kullanılan mock analytics veri yapıları

Kaynak: `data/adminAnalyticsMock.ts`

- `dailyDonations`
- `monthlyDonations`
- `topCampaigns`
- `donationSummary`
- `dashboardStats`
- `recentActivities`
- `quickActions`
- `systemStatus`
- `supporterGrowth`
- `volunteerTrends`

Bu veriler gerçek backend bağlandığında API veya server action katmanından gelecektir.

## Grafik alanları

Grafikler `recharts` ile hazırlanmıştır:

- Günlere Göre Bağış Akışı: area chart
- En Çok Destek Alan Kampanyalar: horizontal bar chart

Grafikler responsive çalışır ve Okyanus marka tokenlarını kullanır.

## Hızlı işlemler mantığı

Hızlı işlemler admin ekibinin sık kullandığı alanlara yönlendirme sağlar:

- Yeni Proje Ekle
- Yeni Haber Ekle
- Yeni Rapor Oluştur
- Bağışları Gör
- Gönüllü Başvurularını İncele
- Site Ayarlarını Aç

Şu an gerçek kayıt yapmaz; ilgili admin ekranına yönlendirir.

## Son aktiviteler yapısı

Activity feed, sistemdeki önemli olayları zaman sırasıyla gösterir:

- Yeni bağış
- Gönüllü başvurusu
- Rapor taslağı
- Haber yayını
- Proje güncellemesi

Gerçek backend aşamasında bu alan audit log veya activity log tablosundan beslenebilir.

## Gelecekte gerçek backend ile bağlantı

Önerilen bağlantı sırası:

1. Dashboard KPI endpoint'i
2. Donation analytics query'leri
3. Campaign performance aggregate query'leri
4. Volunteer application summary query'leri
5. Audit/activity log feed
6. Role-based quick action visibility

## İleride eklenebilecek modüller

- Makbuz yönetimi
- Ödeme kayıtları
- Bağışçı listesi
- Gönüllü havuzu
- Medya dosyaları
- Audit log ekranı
- Admin kullanıcı yönetimi
- Gelişmiş export / raporlama
