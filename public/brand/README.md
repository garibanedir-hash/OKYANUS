# Brand Asset Kullanımı

Bu klasör Okyanus İnsani Yardım Derneği'nin resmi dijital marka assetleri için kullanılır.

## Dosyalar

- `logo.png`: Açık zeminlerde kullanılan renkli ana logo. Şimdilik güvenli ana kaynaktır.
- `logo-white.png`: Koyu lacivert zeminlerde kullanılan beyaz/negatif logo. Şimdilik güvenli ana kaynaktır.
- `mark.png`: Çok küçük alanlarda veya amblem gereken yerlerde kullanılan işaret. Şimdilik güvenli ana kaynaktır.
- `favicon.svg`: İdeal tarayıcı favicon dosyasıdır. Mümkünse lacivert zeminli ve görünür kontrastlı hazırlanmalıdır.
- `favicon.png`: Tarayıcı favicon dosyası. `favicon.svg` yoksa kullanılır.
- `mark-white.png`: Beyaz amblem/favicon alternatifi. Varsa favicon fallback sırasına girer.
- `logo.svg`: Yalnızca tasarımcıdan gelen orijinal vektör logo dosyasıysa tercih edilmelidir.
- `logo-white.svg`: Yalnızca tasarımcıdan gelen orijinal beyaz/negatif vektör logo dosyasıysa tercih edilmelidir.
- `mark.svg`: Yalnızca tasarımcıdan gelen orijinal vektör amblem dosyasıysa tercih edilmelidir.
- `social-preview.png`: OpenGraph/sosyal paylaşım görseli.
- `brand-pattern.svg`: Gerektiğinde kontrollü arka plan deseni.

## Kullanım İlkeleri

- Açık zeminlerde `logo.png` kullanılmalıdır.
- Koyu lacivert zeminlerde `logo-white.png` kullanılmalıdır.
- Sadece amblem gereken küçük alanlarda `mark.png` kullanılmalıdır.
- Şimdilik PNG dosyaları güvenli kaynak olarak kullanılmaktadır.
- PNG'den otomatik dönüştürülmüş SVG dosyaları kullanılmamalıdır.
- SVG dosyaları yalnızca tasarımcıdan gelen orijinal vektör kaynaklar olduğunda tercih edilmelidir.
- Orijinal SVG/AI/EPS/PDF logo dosyaları sağlandığında `OfficialLogo` componenti SVG öncelikli hale getirilebilir.
- Logo oranları korunmalı; logo üzerine gölge, gradient, efekt veya renk filtresi uygulanmamalıdır.
- `logo-white.png` yoksa koyu zeminde renkli logo ters renge çevrilmemelidir; uygulama fallback marka gösterimine döner.
- Favicon önceliği: `favicon.svg`, `favicon.png`, `mark-white.png`, `mark.png`.
- Beyaz amblem favicon olarak kullanılacaksa lacivert `#0F2547` zeminli özel favicon tercih edilmelidir.
- Şeffaf beyaz favicon açık tarayıcı arayüzlerinde görünmeyebilir.
- `social-preview.png` varsa OpenGraph/Twitter preview icin kullanilir; yoksa sistem `logo.png` ile guvenli fallback uretir.
