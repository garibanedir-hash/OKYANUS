# Koordinatör ve Personel Panelleri

## Koordinatör Panelinin Amacı

Koordinatör paneli, admin yetkisi vermeden ekip ve faaliyet koordinasyonunu yönetmek için tasarlanmıştır. Koordinatör yalnızca kendi sorumlu olduğu faaliyet/proje alanlarını, ekibini, görevlerini, rapor taslaklarını ve mesajlarını görmelidir.

## Personel Panelinin Amacı

Personel paneli en sınırlı iç operasyon alanıdır. Personel sadece kendisine atanan görevleri, görev yorumlarını, kendi mesajlarını, ilgili faaliyet bilgisini ve profilini görebilir.

## Görev Takibi

- Koordinatör ekibine görev atayabilir.
- Personel görevi başlatabilir, beklemeye alabilir, tamamlandı olarak işaretleyebilir ve not ekleyebilir.
- Durum değişiklikleri production ortamında audit log’a yazılmalıdır.

## İç İletişim

Mesajlaşma katılımcı bazlı olmalıdır. Koordinatör ekip/faaliyet konuşmalarına; personel ise sadece dahil olduğu konuşmalara erişmelidir.

## Yetki Sınırları

Koordinatör göremez:

- Tüm bağışçı kişisel verileri
- Secret/admin ayarları
- Tüm kullanıcı yetkileri
- Yetkisiz export alanları

Personel göremez:

- Tüm bağış kayıtları
- Tüm kullanıcılar
- Yetim sponsorluk detayları
- Admin ayarları
- Export alanları

## Admin Tarafından Yetki Verilmesi

Admin kullanıcılar `role_permissions`, `panel_access_rules`, `coordinator_assignments` ve `staff_assignments` üzerinden panel erişimini yönetmelidir.

## Audit Log İlişkisi

Koordinatör görev atadığında, personel görev durumunu değiştirdiğinde, panel erişimi verildiğinde veya rol değiştiğinde audit log tutulmalıdır.
