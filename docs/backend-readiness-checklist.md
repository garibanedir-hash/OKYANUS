# Backend Readiness Checklist

8C'ye geçmeden önce backend hazırlığının güvenlik odağında tamamlandığını kontrol etmek için kullanılır.

## Supabase Key Kullanımı

- [ ] Smoke test yalnızca `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` veya `NEXT_PUBLIC_SUPABASE_ANON_KEY` kullanıyor.
- [ ] `SUPABASE_SECRET_KEY` ve `SUPABASE_SERVICE_ROLE_KEY` smoke test içinde kullanılmıyor.
- [ ] Service role yalnızca server-side admin/service işlemlerinde kullanılıyor.

## RLS Lockdown

- [ ] `006_lockdown_sensitive_tables.sql` staging ortamında çalıştırıldı.
- [ ] Hassas tablolar public read'e kapalı.
- [ ] Public SELECT policy kalıntıları hassas tablolardan temizlendi.
- [ ] Public tablolar sadece yayınlanmış/public kayıtları döndürüyor.

## Hassas Veri Alanları

- [ ] Bağış verileri varsayılan kapalı.
- [ ] Gönüllü başvuruları varsayılan kapalı.
- [ ] İletişim mesajları varsayılan kapalı.
- [ ] Görev ve iç mesaj tabloları varsayılan kapalı.
- [ ] Personel/kullanıcı/rol tabloları varsayılan kapalı.
- [ ] Sponsorluk ve çocuk verileri varsayılan kapalı.

## 8C Hazırlığı

- [ ] Authenticated ownership policy tasarımı hazır.
- [ ] Admin/role-based policy tasarımı hazır.
- [ ] Audit log policy tasarımı hazır.
- [ ] Export yetki/audit modeli hazır.
