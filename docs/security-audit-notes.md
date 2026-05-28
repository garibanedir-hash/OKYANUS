# Security Audit Notes

Son kontrol tarihi: 29 Mayis 2026

Bu not, `npm audit` sonucunda kalan PostCSS uyarisi icin proje kararini kayit altina alir.

## Mevcut Durum

- `next` surumu `16.2.6` olarak sabitlenmistir.
- `eslint-config-next` surumu `16.2.6` olarak sabitlenmistir.
- Root seviyesindeki `postcss` surumu `8.5.14` olarak kuruludur.
- `next/node_modules/postcss` surumu Next paketinin kendi kilitli bagimliligi nedeniyle `8.4.31` olarak kalmaktadir.
- `npm audit` bu nested PostCSS bagimliligi icin 2 moderate uyarisi vermektedir.

## Neden Force Fix Kullanilmiyor?

`npm audit fix --force`, bu uyarinin otomatik cozum yolu olarak Next'i `9.3.3` surumune dusurmeyi onermektedir. Bu, modern Next.js 16 uygulamasi icin kirici ve kabul edilemez bir major downgrade oldugundan kullanilmayacaktir.

## Override Denemesi

`overrides.next.postcss` ile yalnizca Next'in nested PostCSS bagimliligini hedefleyen override denenmistir. Ancak npm bu override'i dependency tree icinde `invalid` duruma dusurdugu icin kalici olarak birakilmamistir.

Bu nedenle proje, dependency tree'yi gecersiz hale getiren override yerine Next'in upstream paket guncellemesini takip edecektir.

## CI / Production Audit Politikasi

CI ve production guvenlik kontrolunde yuksek ve kritik seviye aciklari yakalamak icin su komut kullanilacaktir:

```bash
npm run audit:security
```

Bu komut `npm audit --audit-level=high` calistirir. Mevcut kalan PostCSS uyarisi moderate seviyede oldugu icin build/CI bloklamaz, ancak tam audit raporunda gorunmeye devam eder.

Tam audit raporu icin:

```bash
npm run audit:full
```

## Takip Karari

- Yeni Next patch veya minor surumu yayinlandiginda `next` ve `eslint-config-next` birlikte tekrar kontrol edilecektir.
- Yeni surum Next'in nested PostCSS bagimliligini guvenli surume tasiyorsa proje patch/minor olarak guncellenecektir.
- Force downgrade, route guard, Supabase auth, PayTR, receipt PDF, private storage veya production build guvenligini riske atacak sekilde kullanilmayacaktir.

## Ozet Risk Degerlendirmesi

Kalan uyarinin kaynagi uygulamanin root PostCSS kurulumu degil, Next `16.2.6` paketinin icindeki upstream nested bagimliliktir. Root PostCSS guvenli surumdedir. Risk upstream dependency olarak takip edilmektedir.
