# 8E Manuel Rol ve Route Test Checklist

Bu checklist staging ortamında test kullanıcılarıyla yapılacak manuel doğrulama içindir. Production kişisel verisi kullanılmaz, gerçek bağış/CRUD/upload yapılmaz.

| Test | Kullanıcı | Giriş | Beklenen yönlendirme | Yasaklı route kontrolleri | Not |
| --- | --- | --- | --- | --- | --- |
| 1 | Super Admin | `/admin/giris` | `/admin` | Yok veya public dışı yetkiler role göre sınırlı | Admin route guard `profiles` veya `user_accounts` üzerinden doğrulamalı. |
| 2 | Bağışçı | `/giris` | `/panel/bagisci` | `/admin`, `/koordinator`, `/personel` yasak | Bağışçı yalnızca kendi panel/veri kapsamını görmeli. |
| 3 | Gönüllü | `/giris` | `/panel/gonullu` | `/admin`, `/koordinator`, `/personel` yasak | Gönüllü yalnızca kendi gönüllü panel/veri kapsamını görmeli. |
| 4 | Koordinatör | `/giris` | `/koordinator` | `/admin`, `/panel/bagisci`, `/personel` yasak | Koordinatör yalnızca assignment kapsamını görmeli. |
| 5 | Personel | `/giris` | `/personel` | `/admin`, `/koordinator`, bağışçı verileri yasak | Personel yalnızca kendi görev/mesaj/profil kapsamını görmeli. |
| 6 | Oturumsuz kullanıcı | Yok | `/admin` -> `/admin/giris`; `/panel` -> `/giris`; `/koordinator` -> `/giris`; `/personel` -> `/giris` | Tüm korumalı route'lar oturumsuz kapalı | Redirect query içinde `redirectedFrom` korunabilir. |

## Ek Kontroller

| Kontrol | Beklenen |
| --- | --- |
| Yetkisiz rol | `/giris?durum=yetkisiz` veya ilgili admin login mesajı |
| Eksik Supabase env | Korumalı route güvenli şekilde login ekranına gider |
| `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` local/dev | Demo önizleme açık kalabilir |
| `NEXT_PUBLIC_ADMIN_DEMO_MODE=true` production | Paneller açık kalmamalı; production demo mode etkisizdir |
| `/admin/giris` | Guard dışında kalır |
| `/giris` ve `/kayit` | Guard dışında kalır |
| `/tadilat` | Redirect loop dışında kalır |
