# Okyanus İnsani Yardım Derneği Marka Rehberi

## Marka Özü

Okyanus İnsani Yardım Derneği; toplumsal faydayı merkeze alan, ihtiyaç sahiplerine sürdürülebilir destek sağlamayı hedefleyen bir insani yardım kuruluşudur.

Marka kavramları:

- Güven
- Şeffaflık
- Umut
- Dayanışma
- Sürdürülebilir destek
- İnsan odaklı yardım

Temel ifade:

> İyilik Paylaştıkça Okyanusa Dönüşür.

## Logo Rasyoneli

Logo; okyanus, dayanışma ve insan odaklı yardımlaşma fikrini temsil eder. Akışkan dalga formu süreklilik, birliktelik ve umut duygusunu ifade eder. Merkezdeki insan figürü yardımın odağındaki insanı simgeler.

Gerçek logo assetleri sağlanana kadar web arayüzünde kullanılan BrandMark geçici dijital logo temsilidir. Nihai logo yerine geçmez.

## Logo Kullanım İlkeleri

- Logo oranları bozulmamalıdır.
- Logo üzerine gölge, efekt veya farklı renk uygulanmamalıdır.
- Açık zeminde renkli logo kullanılmalıdır.
- Koyu zeminde beyaz/negatif kullanım tercih edilmelidir.
- Logo çevresinde güvenli boşluk korunmalıdır.
- Düşük kaliteli PDF kırpımları veya ekran görüntüleri logo asseti olarak kullanılmamalıdır.

## Kurumsal Renkler

Ana kurumsal renkler:

| Renk | HEX | RGB | Kullanım |
| --- | --- | --- | --- |
| Koyu Lacivert | `#0F2547` | 15, 37, 71 | Başlıklar, koyu alanlar, güven ve kurumsallık |
| Turkuaz | `#1F8083` | 31, 128, 131 | Vurgu, CTA, ikon, bağlantı ve umut hissi |

Web token eşlemesi:

| Token | Değer | Not |
| --- | --- | --- |
| `deep-blue` | `#0F2547` | Ana kurumsal lacivert |
| `dark-navy` | `#0F2547` | Metin ve koyu zemin |
| `primary-blue` | `#1F8083` | Turkuaz vurgu |
| `ocean-green` | `#1F8083` | CTA ve durum vurguları |
| `soft-blue` | `#E8F2F3` | Hafif yüzey |
| `mint-green` | `#DCEFED` | Yumuşak vurgu |
| `warm-white` | `#FFFEFD` | Ana zemin |
| `soft-gray` | `#F5F7F8` | Kart ve bölüm zemini |

## Tipografi Yaklaşımı

Kurumsal rehberde temel yazı tipleri:

- Gilroy-Black
- Gilroy-Bold
- Brittany Signature

Kurumsal font dosyaları için proje standardı:

```text
app/fonts/Gilroy-Regular.woff2
app/fonts/Gilroy-Medium.woff2
app/fonts/Gilroy-Bold.woff2
app/fonts/Gilroy-Black.woff2
```

TTF fallback dosyaları `app/fonts/Gilroy-Regular.ttf`, `app/fonts/Gilroy-Medium.ttf`, `app/fonts/Gilroy-Bold.ttf` ve `app/fonts/Gilroy-Black.ttf` olarak kabul edilir. Bu projede mevcut font dosyaları TrueType formatında ve `Gilroy-Regular.woff2.ttf`, `Gilroy-Medium.woff2.ttf`, `Gilroy-Bold.woff2.ttf`, `Gilroy-Black.woff2.ttf` adlarıyla bulunur.

Font dosyaları projede yoksa web arayüzü güvenli fallback kullanır:

```text
Inter, Arial, system-ui, sans-serif
```

`next/font/local` entegrasyonu `app/layout.tsx` içinde sabit module-scope çağrı olarak aktiftir ve `--font-gilroy` değişkenini üretir. Regular/Medium/Bold/Black ağırlıkları bulunduğu için body, başlıklar, butonlar ve güçlü UI alanları kontrollü şekilde Gilroy sistemine alınmıştır. Brittany Signature dijital UI içinde ana metin fontu olarak kullanılmamalı; gerekiyorsa sınırlı marka uygulamalarında değerlendirilmelidir.

PDF makbuz üreticisi `pdf-lib` ve `@pdf-lib/fontkit` ile Gilroy fontlarını PDF içine embed eder. Embed başarısız olursa üretim durmaz; Helvetica fallback ve güvenli Türkçe normalizasyon devreye girer.

## Dijital Uygulama İlkeleri

- Lacivert + turkuaz ana eksen olmalıdır.
- Gradient kullanımı sınırlı ve kontrollü olmalıdır.
- Beyaz alan güçlü tutulmalıdır.
- Kartlar temiz, açık ve kurumsal görünmelidir.
- CTA alanlarında sade dalga formu kullanılabilir.
- Formlar label odaklı, erişilebilir ve sakin olmalıdır.
- Renk tek başına anlam taşımaz; metin/ikon ile desteklenir.

## Web UI Renk Tokenları

Tüm web UI renkleri Tailwind tokenları ve CSS değişkenleri üzerinden yönetilir. Hard-coded renkler minimumda tutulmalıdır.

Öncelikli tokenlar:

- `bg-deep-blue`
- `text-dark-navy`
- `text-ocean-green`
- `bg-ocean-green`
- `bg-soft-blue`
- `bg-mint-green`
- `border-border-soft`

## Fotoğraf/Görsel Kullanım İlkeleri

- İnsan onurunu koruyan, umut veren ve doğal ışıklı görseller tercih edilir.
- Yardım alan kişi pasif veya acındırılan bir figür olarak gösterilmez.
- Gönüllü emeği, saha koordinasyonu, yardım kolisi, eğitim desteği ve düzenli takip hissi öne çıkarılır.
- Çocuk görsellerinde mahremiyet ve izin hassasiyeti esastır.
- Gerçek fotoğraf yoksa sade placeholder, dalga formu, ikon kartı veya marka pattern kullanılabilir.

## Sosyal Medya ve Saha Materyali Dili

Kurumsal saha ve sosyal medya dilinin ortak özellikleri:

- Beyaz zemin
- Lacivert alt dalga formu
- Turkuaz vurgu
- Logo merkezli sade kullanım
- Net hiyerarşi
- “İyilik Paylaştıkça Okyanusa Dönüşür” mesajı

Bu dil web CTA alanlarında, kart alt çizgilerinde, bakım sayfasında ve görsel placeholderlarda kontrollü şekilde uygulanır.

## Kaçınılacak Kullanımlar

- Logo oranını bozmak
- Logoya gölge, glow veya efekt uygulamak
- Eski mavi/yeşil tonları hard-code etmek
- Aşırı gradient ve dekoratif karmaşa
- Karanlık, dramatik ve duygu sömürüsü yapan görseller
- Çocuk/sponsorluk verilerini açık kimlik bilgisiyle göstermek
- “Çaresiz”, “zavallı”, “perişan” gibi insan onurunu zedeleyen ifadeler
