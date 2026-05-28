# Kurumsal Font Dosyaları

Bu klasör Okyanus İnsani Yardım Derneği kurumsal fontlarının proje içi kaynağıdır.

Beklenen dosyalar:

- `Gilroy-Regular.woff2`
- `Gilroy-Medium.woff2`
- `Gilroy-Bold.woff2`
- `Gilroy-Black.woff2`

TTF fallback kabul edilir:

- `Gilroy-Regular.ttf`
- `Gilroy-Medium.ttf`
- `Gilroy-Bold.ttf`
- `Gilroy-Black.ttf`

Bu projede şu an dosyalar TrueType formatında ve çift uzantılı olarak bulunur:

- `Gilroy-Regular.woff2.ttf`
- `Gilroy-Medium.woff2.ttf`
- `Gilroy-Bold.woff2.ttf`
- `Gilroy-Black.woff2.ttf`

`app/layout.tsx` bu mevcut dosyaları `next/font/local` ile kullanır. Makbuz PDF generator da aynı dosyaları server-side okuyup PDF içine embed eder.

Font dosyaları lisanslı ve kullanıma uygun olmalıdır. Dosyalar kaldırılırsa site build'i için `app/layout.tsx` font pathleri yeniden güvenli fallback moduna alınmalıdır.
