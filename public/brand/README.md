# Brand Asset Kullanımı

Bu klasör Okyanus İnsani Yardım Derneği'nin resmi dijital marka assetleri için kullanılır.

## Dosyalar

- `logo.png`: Açık zeminlerde kullanılan renkli ana logo. Şimdilik güvenli ana kaynaktır.
- `logo-white.png`: Koyu lacivert zeminlerde kullanılan beyaz/negatif logo. Şimdilik güvenli ana kaynaktır.
- `mark.png`: Çok küçük alanlarda veya amblem gereken yerlerde kullanılan işaret. Şimdilik güvenli ana kaynaktır.
- `favicon.png`: Tarayıcı favicon dosyası. Varsa öncelikli kullanılır.
- `logo.svg`: Yalnızca tasarımcıdan gelen orijinal vektör logo dosyasıysa tercih edilmelidir.
- `logo-white.svg`: Yalnızca tasarımcıdan gelen orijinal beyaz/negatif vektör logo dosyasıysa tercih edilmelidir.
- `mark.svg`: Yalnızca tasarımcıdan gelen orijinal vektör amblem dosyasıysa tercih edilmelidir.
- `favicon.svg`: Orijinal vektör favicon dosyası varsa PNG alternatifi olarak kullanılabilir.
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
- `favicon.png` yoksa mevcut Next.js favicon davranışı bozulmadan devam eder.
- `social-preview.png` yoksa OpenGraph image alanı otomatik eklenmez.
