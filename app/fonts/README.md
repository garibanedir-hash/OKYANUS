# Kurumsal Font Dosyaları

Bu klasör Okyanus İnsani Yardım Derneği kurumsal fontlarının proje içi kaynağıdır.

Beklenen dosyalar:

- `Gilroy-Regular.ttf`
- `Gilroy-Medium.ttf`
- `Gilroy-Bold.ttf`
- `Gilroy-Black.ttf`

WOFF2 varyantları da kabul edilir:

- `Gilroy-Regular.woff2`
- `Gilroy-Medium.woff2`
- `Gilroy-Bold.woff2`
- `Gilroy-Black.woff2`

`app/layout.tsx` mevcut `.ttf` dosyalarını `next/font/local` ile kullanır. Makbuz PDF generator da önce `.ttf` dosyalarını server-side okuyup PDF içine embed eder; bulunamazsa WOFF2 dosya adlarına güvenli fallback dener.

Font dosyaları lisanslı ve kullanıma uygun olmalıdır. Dosyalar kaldırılırsa site build'i için `app/layout.tsx` font pathleri yeniden güvenli fallback moduna alınmalıdır.
