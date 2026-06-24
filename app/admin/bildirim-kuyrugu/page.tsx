import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { notificationChannelLabels, notificationQueueStatusLabels } from "@/data/paymentMock";
import { getAdminNotificationQueueWithSource } from "@/lib/data/paymentRepository";
import { formatDate } from "@/lib/format";

type AdminNotificationQueuePageProps = {
  searchParams?: Promise<{ channel?: string; status?: string; q?: string }>;
};

function formatOptionalDate(value?: string) {
  return value ? formatDate(value) : "-";
}

function DisabledDemoButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="inline-flex min-h-8 cursor-not-allowed items-center justify-center rounded-md border border-border-soft bg-soft-gray px-2.5 py-1 text-[0.72rem] font-extrabold text-ink-muted"
    >
      {children}
    </button>
  );
}

export default async function AdminNotificationQueuePage({ searchParams }: AdminNotificationQueuePageProps) {
  const params = await searchParams;
  const { data: notifications, source } = await getAdminNotificationQueueWithSource();
  const filteredNotifications = notifications.filter((item) => {
    const channelMatch = !params?.channel || params.channel === "all" || item.channel === params.channel;
    const statusMatch = !params?.status || params.status === "all" || item.status === params.status;
    const query = params?.q?.toLowerCase();
    const queryMatch =
      !query ||
      item.templateKey.toLowerCase().includes(query) ||
      item.paymentIntentNo?.toLowerCase().includes(query) ||
      item.recipientEmailMasked.toLowerCase().includes(query);

    return channelMatch && statusMatch && queryMatch;
  });

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="Bağış ve destek"
        title="Bildirim Kuyruğu"
        description="Ödeme, makbuz, kurban ve yetim hamiliği bilgilendirmeleri için ortak kuyruk görünümü. Gerçek e-posta, SMS veya WhatsApp gönderimi bu aşamada yapılmaz."
      />
      <div className="w-fit rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
        {source === "supabase" ? "Gerçek kayıt" : "Kayıt yok"}
      </div>
      <form>
        <AdminFilterBar>
          <label>
            Arama
            <input name="q" defaultValue={params?.q ?? ""} placeholder="Şablon / ödeme no" />
          </label>
          <label>
            Kanal
            <select name="channel" defaultValue={params?.channel ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(notificationChannelLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Durum
            <select name="status" defaultValue={params?.status ?? "all"}>
              <option value="all">Tümü</option>
              {Object.entries(notificationQueueStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className="focus-ring inline-flex h-8 items-center rounded-md bg-ocean-green px-3 text-xs font-extrabold text-white">
              Filtrele
            </button>
            <a href="/admin/bildirim-kuyrugu" className="focus-ring inline-flex h-8 items-center rounded-md border border-border-soft bg-white px-3 text-xs font-extrabold text-deep-blue">
              Temizle
            </a>
          </div>
        </AdminFilterBar>
      </form>
      <AdminTable
        headers={["Kanal", "Şablon", "Alıcı maskeli", "Bağlam", "Ödeme No", "Durum", "Planlanan", "Gönderim", "Hata", "İşlem"]}
        recordCount={filteredNotifications.length}
        empty={!filteredNotifications.length}
      >
        {filteredNotifications.map((item) => (
          <tr key={item.id}>
            <td>{item.channelLabel}</td>
            <td className="font-bold text-dark-navy">{item.templateKey}</td>
            <td>
              {item.recipientEmailMasked}
              <span className="block text-xs text-ink-muted">{item.recipientPhoneMasked}</span>
            </td>
            <td>{item.contextTypeLabel}</td>
            <td>{item.paymentIntentNo ?? "-"}</td>
            <td><AdminStatusBadge status={item.statusLabel} /></td>
            <td>{formatOptionalDate(item.scheduledAt)}</td>
            <td>{formatOptionalDate(item.sentAt)}</td>
            <td>{item.errorMessage ?? "-"}</td>
            <td><DisabledDemoButton>Tekrar gönder</DisabledDemoButton></td>
          </tr>
        ))}
      </AdminTable>
      <AdminPanelNotice title="Bildirim kuyruğu notu">
        10C finalization akışı paid/failed/cancelled sonuçlarında context bazlı notification template kaydı üretir. SMTP, SMS, WhatsApp provider bağlantısı ve otomatik retry işleyicisi sonraki entegrasyon aşamasında eklenecektir; tekrar gönderim aksiyonu pasif demodur.
      </AdminPanelNotice>
    </div>
  );
}
