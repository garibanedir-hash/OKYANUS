import { mockContactMessages } from "@/data/adminMock";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

export default function AdminContactMessagesPage() {
  const subjects = Array.from(new Set(mockContactMessages.map((item) => item.subject)));
  const countByStatus = (status: string) => mockContactMessages.filter((item) => item.status === status).length;

  return (
    <div className="grid gap-6">
      <AdminSectionHeader
        eyebrow="İletişim Yönetimi"
        title="İletişim Mesajları"
        description="Form mesajları gerçek backend bağlandığında bu ekranda takip edilecek şekilde modellenmiştir."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMiniStat label="Yeni mesaj" value={countByStatus("Yeni")} />
        <AdminMiniStat label="Okunmuş mesaj" value={countByStatus("Okundu")} />
        <AdminMiniStat label="Yanıtlanan mesaj" value={countByStatus("Yanıtlandı")} />
        <AdminMiniStat label="Arşivlenen mesaj" value={countByStatus("Arşivlendi")} />
      </section>
      <AdminFilterBar>
        <label className="text-sm font-bold text-dark-navy">Durum<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option><option>Yeni</option><option>Okundu</option><option>Yanıtlandı</option><option>Arşivlendi</option></select></label>
        <label className="text-sm font-bold text-dark-navy">Konu<select className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2"><option>Tümü</option>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
        <label className="text-sm font-bold text-dark-navy">Arama<input className="focus-ring mt-2 w-full rounded-2xl border border-border-soft px-4 py-2" placeholder="Ad, e-posta veya konu" /></label>
      </AdminFilterBar>
      <AdminChartCard title="Son gelen mesajlar" description="İletişim ekibinin hızlı önceliklendirmesi için kısa önizleme.">
        <div className="grid gap-3">
          {mockContactMessages.slice(0, 2).map((message) => (
            <div key={message.id} className="rounded-2xl bg-soft-gray p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-bold text-dark-navy">{message.subject}</p>
                <AdminStatusBadge status={message.status} />
              </div>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{message.message}</p>
            </div>
          ))}
        </div>
      </AdminChartCard>
      <AdminTable headers={["Ad Soyad", "E-posta", "Konu", "Mesaj", "Durum", "Tarih", "İşlemler"]}>
        {mockContactMessages.map((message) => (
          <tr key={message.id}>
            <td className="px-4 py-3 font-bold text-dark-navy">{message.fullName}</td>
            <td className="px-4 py-3 text-ink-muted">{message.email}</td>
            <td className="px-4 py-3 text-ink-muted">{message.subject}</td>
            <td className="max-w-xs px-4 py-3 text-ink-muted">{message.message}</td>
            <td className="px-4 py-3"><AdminStatusBadge status={message.status} /></td>
            <td className="px-4 py-3 text-ink-muted">{message.submittedAt}</td>
            <td className="px-4 py-3"><AdminActionButton>Yanıtla</AdminActionButton></td>
          </tr>
        ))}
      </AdminTable>
    </div>
  );
}
