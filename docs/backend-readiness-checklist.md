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

- [ ] `/admin`, `/panel`, `/koordinator`, `/personel` için proxy/server guard hazırlığı tamamlandı.
- [ ] `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` demo erişimi, `false` auth guard davranışı net.
- [ ] Public login/register ve admin login server action'ları Supabase Auth'a hazır.
- [ ] Role redirect fallback stratejisi belirlendi.
- [ ] Authenticated ownership policy tasarımı hazır.
- [ ] Admin/role-based policy tasarımı hazır.
- [ ] Audit log policy tasarımı hazır.
- [ ] Export yetki/audit modeli hazır.

## 8D Öncesi Ek Kontroller

- [ ] `profiles`, `user_accounts`, `admin_roles`, `role_permissions` read-only doğrulaması RLS ile test edildi.
- [ ] İlk Super Admin kurulum akışı staging ortamında doğrulandı.
- [ ] Bağışçı/gönüllü/koordinatör/personel test hesaplarıyla beklenen panel yönlendirmeleri çalışıyor.
