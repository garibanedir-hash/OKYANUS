# 9C Kurban Order, Vekalet ve Hisse Rezervasyon Akışı

Bu doküman kurban bağışı formundan ödeme öncesi başvuru, vekalet kabulü ve hisse/adet rezervasyonu oluşturma akışını açıklar.

## Kurban Order Create Akışı

Route:

- `/kurban/bagis`

Server action:

- `app/kurban/bagis/actions.ts`
- `createQurbanOrderAction(formData)`

Server-only write katmanı:

- `lib/data/qurbanWriteRepository.ts`

DB migration:

- `supabase/migrations/011_qurban_order_flow.sql`

Akış:

1. Form alanları server-side doğrulanır.
2. Kampanya service role ile okunur.
3. Kampanyanın `active` olduğu doğrulanır.
4. `unit_price` kampanyadan alınır; client tarafından gönderilen tutara güvenilmez.
5. `total_amount = unit_price * share_count` server/DB tarafında hesaplanır.
6. Kontenjan kontrolü yapılır.
7. `create_qurban_order` RPC çağrılır.
8. `qurban_orders`, `qurban_delegations`, `qurban_shares`, `qurban_status_logs` kayıtları tek DB transaction içinde oluşturulur.
9. `qurban_campaigns.quota_reserved` artırılır.
10. Başarılı sonuçta kullanıcıya `order_no` gösterilir.

## Vekalet Kabulü

Vekalet onayı olmadan order oluşturulmaz.

Kaydedilen alanlar:

- `qurban_delegations.accepted = true`
- `accepted_at = now()`
- `status = accepted`
- `delegation_text = campaign.delegation_text`
- `kvkk_accepted = true`
- `source = web`

Vekalet metni production öncesi dernek yönetimi, hukuk danışmanı ve dini danışman tarafından onaylanmalıdır.

## Hisse Rezervasyonu

`share_count` kadar `qurban_shares` kaydı oluşturulur.

Format:

- `order_no`: `QUR-2026-AB12CD`
- `share_no`: `QUR-2026-AB12CD-01`
- `share_no`: `QUR-2026-AB12CD-02`

`qurban_shares.share_no` unique tutulur. Ayrıca `order_id + share_index` unique index ile korunur.

## Payment Pending Durumu

9E ile ortak payment intent altyapısı hazırlanmıştır; bu hâlâ gerçek ödeme entegrasyonu değildir.

Varsayılan durumlar:

- `payment_status = pending`
- `order_status = payment_pending`
- `delegation_status = accepted`
- `receipt_status = payment_pending`

Ödeme yapılmadan kesim ve dağıtım durumları ilerletilmez.

Kurban siparişi ileride `payment_intents.context_type = qurban_order` ve `context_id = qurban_orders.id` ile ortak ödeme modeline bağlanır. Bu aşamada public başvuru sonrası payment intent otomatik oluşturulması zorunlu değildir.

9E.1 stabilizasyonunda admin ve panel ekranları ödeme bekliyor durumunu read-only gösterir; gerçek ödeme butonu, provider API çağrısı veya webhook doğrulaması yoktur.

## 9C.1 Stabilizasyon Notları

9C.1 ödeme öncesi kayıt akışını kullanıcı ve operasyon ekipleri için daha anlaşılır hale getirir:

- `/kurban`, `/kurban/[slug]` ve `/kurban/bagis` metinleri "kayıt alınıyor, ödeme bekliyor" durumuna göre güncellendi.
- Kampanya seçimi `?kampanya=slug` query'sini kullanır ve seçilen kampanya formda önden seçilir.
- Hisse/adet seçimi kalan kontenjan ve 20 adet sınırına göre kullanıcıya açıklanır.
- Başarı ekranında "Kurban bağış başvurunuz alınmıştır.", sipariş no, vekalet kaydı, ödeme bekliyor bilgisi ve admin kayıt notu gösterilir.
- Admin bağışları ekranında kişisel veriler maskeli kalır; filtreler demo/read-only olarak işaretlenir.
- Bağışçı panelinde guest kayıtların otomatik görünmeyeceği açıklanır.
- Koordinatör ve personel ekranları demo/read-only operasyon takip yüzeyi olarak kalır.

## Guest Donor ve Logged-in Donor Farkı

Girişsiz kullanıcı:

- Kurban başvurusu oluşturabilir.
- `donor_account_id = null` kalır.
- Kayıt admin ekranında görünür.
- `/panel/kurbanlarim` içinde otomatik görünmez.

Girişli bağışçı:

- Aktif `user_accounts` kaydı donor/bağışçı rolüyle eşleşirse `donor_account_id` bağlanır.
- Kayıt RLS üzerinden `/panel/kurbanlarim` içinde görüntülenebilir.

E-posta tek başına güvenlik kaynağı olarak kullanılmaz.

## Admin Görünürlüğü

Admin route:

- `/admin/kurban/bagislar`

Admin/super_admin hesabı authenticated RLS üzerinden `qurban_orders` kayıtlarını okuyabilir. Kişisel veriler UI tarafında maskeli gösterilmeye devam eder.

## Bağışçı Panel Görünürlüğü

Panel route:

- `/panel/kurbanlarim`

Panel, giriş yapan kullanıcının `donor_account_id` ile ilişkili kayıtlarını okur. Guest kayıtların sonradan hesapla eşleştirilmesi sonraki aşamaya bırakılmıştır.

## Quota Rezervasyon Mantığı

RPC içinde kampanya satırı `for update` ile kilitlenir. Böylece aynı anda gelen başvurularda `quota_reserved + share_count > quota_total` kontrolü transaction içinde yapılır.

Başarılı kayıt sonrası:

- `qurban_campaigns.quota_reserved += share_count`
- `updated_at = now()`

## Audit Log

Authenticated kullanıcı varsa audit helper best-effort çalışır.

Action türleri:

- `qurban.order.create`
- `qurban.delegation.accept`
- `qurban.share.reserve`
- `qurban.quota.reserve`

Audit log hatası ana başvuru akışını patlatmaz. Guest başvurularda audit yerine `qurban_status_logs` ana iz kaydı olarak kullanılır.

## Güvenlik ve RLS Notları

- Public/anon insert doğrudan tablolara açılmaz.
- Public/anon hassas kurban tablolarını okuyamaz.
- Yazma işlemi sadece server action üzerinden yapılır.
- Service role key sadece server-only dosyalarda kullanılır.
- Client component içinde service role veya secret env yoktur.
- `create_qurban_order` RPC `anon` ve `authenticated` rollerinden revoke edilmiştir; service role ile server-side çağrılır.

## Ödeme Entegrasyonuna Geçmeden Önce

- Payment provider webhook signature doğrulanmalı.
- Idempotency key tasarımı yapılmalı.
- Ödeme başarılıysa `payment_status`, `order_status` ve hisse durumları atomik güncellenmeli.
- 9E ortak modelde payment paid olduğunda `qurban_orders.payment_status = paid`, `qurban_orders.order_status = payment_confirmed`, `qurban_shares.status = payment_confirmed` ve `quota_reserved` değerinden `quota_completed` finalizasyonu server-side transaction ile yapılmalı.
- Payment paid sonrası `receipts.status` en az `pending` veya `prepared` durumuna alınmalı.
- Payment paid sonrası `notification_queue` içine ödeme/makbuz bilgilendirme kaydı eklenmeli.
- Başarısız/iptal ödeme için `qurban_shares.status` geri alma, `qurban_orders.payment_status = failed/cancelled` ve gerekirse `quota_reserved` azaltma stratejisi belirlenmeli.
- Quota release işlemi ödeme başarısız/iptal event'i ile aynı transaction veya idempotent job içinde yapılmalı.
- Makbuz ve bildirim entegrasyonu audit log ile bağlanmalı.
- Guest kayıtları donor hesabıyla eşleştirme süreci tasarlanmalı.
- Vekalet metni dernek yönetimi, hukuk danışmanı ve dini danışman onayı olmadan production'da kesin metin olarak kullanılmamalı.
- `docs/qurban-manual-test-checklist.md` staging ortamında tamamlanmalı.

## 10A PayTR Test Hazırlığı

- Kurban siparişi için payment intent varsa `/panel/kurbanlarim` içinde “Ödemeye Devam Et” bağlantısı PayTR test route'una yönlenebilir.
- `merchant_oid`, payment intent referansından üretilir ve `provider_reference` olarak saklanır.
- PayTR success callback sonrası bu aşamada ödeme niyeti `paid` yapılır, makbuz hazırlık kaydı ve sistem bildirim kuyruğu hazırlanır.
- Kurban iş kuralı finalizasyonu sonraki aşamada atomik işlem olmalıdır: `qurban_orders.payment_status = paid`, `qurban_orders.order_status = payment_confirmed`, `qurban_shares.status = payment_confirmed`, `quota_reserved -> quota_completed`.
- Failed/cancelled callback sonrası quota release planı idempotent ve transaction güvenli tasarlanmalıdır.
- Ok/fail dönüş sayfaları kurban siparişini onaylamaz veya iptal etmez; karar yalnızca callback ile verilir.

## 10B Kurban Payment Intent Akışı

- `createQurbanOrderAction` başarılı order sonrası `buildQurbanPaymentContext` ile PayTR provider'lı payment intent oluşturur.
- Payment intent oluşturulamazsa kurban siparişi bozulmaz; başarı ekranında ödeme bağlantısının daha sonra hazırlanabileceği belirtilir.
- Başarı ekranında varsa Ödeme No ve `/odeme/paytr/[intentNo]` bağlantısı gösterilir.
- Aynı `qurban_orders.id` için bekleyen/başlatılmış payment intent varsa yeni kayıt açılmaz, mevcut intent tekrar kullanılır.
- PayTR paid callback sonrası sipariş ödeme durumu ve hisse durumları sınırlı olarak güncellenir.
- `quota_completed` artışı ve failed/cancelled quota release işlemi 10C aşamasında transaction güvenli RPC/job ile yapılmalıdır.

## 10C Kurban Payment Finalization

10C ile kurban ödeme sonucu `016_payment_finalization_and_context_state.sql` içindeki RPC fonksiyonlarıyla transaction içinde uygulanır.

- `finalize_qurban_payment` payment intent ve kurban order satırını kilitler.
- Paid sonucunda `qurban_orders.payment_status = paid` ve `qurban_orders.order_status = payment_confirmed` yapılır.
- İlgili `qurban_shares.status = payment_confirmed` olur.
- `quota_reserved = greatest(quota_reserved - share_count, 0)` ve `quota_completed = quota_completed + share_count` uygulanır.
- Duplicate paid callback order zaten `payment_confirmed` ise quota değerlerini tekrar değiştirmez.
- `release_qurban_payment_reservation` failed/cancelled/refunded sonucunda order ve hisseleri cancelled yapar.
- Release akışında `quota_reserved` azaltılır, `quota_completed` artırılmaz.
- Receipt hazırlık kaydı ve `qurban_payment_confirmed` / failed-cancelled template bildirimi idempotent üretilir.

Canlı ödeme, gerçek makbuz PDF ve gerçek SMS/e-posta gönderimi bu aşamada kapalıdır.
