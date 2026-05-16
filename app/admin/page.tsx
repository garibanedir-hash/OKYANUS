import Link from "next/link";
import { ArrowUpRight, ClipboardList, FileCheck2, Inbox, MessageSquare, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import type { QuickAction } from "@/data/adminAnalyticsMock";
import { dailyDonations, topCampaigns } from "@/data/adminAnalyticsMock";
import { operationFlowItems, operationKpis, recentWorkRecords } from "@/data/adminOperationsMock";
import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminLineChart } from "@/components/admin/AdminLineChart";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";

const quickActions: QuickAction[] = [
  { label: "Yeni İş Kaydı", href: "/admin/is-kayitlari", description: "Faaliyet ve süreç kaydı aç", iconName: "report" },
  { label: "Görevlendirme Aç", href: "/admin/gorevlendirmeler", description: "Saha veya ofis görevi planla", iconName: "project" },
  { label: "Masraf Talebi", href: "/admin/harcama-masraf", description: "Harcama kaydı incele", iconName: "donation" },
  { label: "Rezervasyon", href: "/admin/toplanti-rezervasyonu", description: "Toplantı alanı ayır", iconName: "settings" },
  { label: "Makbuzları İncele", href: "/admin/makbuzlar", description: "Bekleyen makbuzları takip et", iconName: "report" },
  { label: "Gönüllü Havuzu", href: "/admin/gonullu-havuzu", description: "Uygun gönüllüleri gör", iconName: "volunteer" }
];

const iconMap = {
  "İşlem Bekleyenler": Inbox,
  "Takibimdeki Görevler": ClipboardList,
  "Bugünkü Bağış Hareketi": WalletCards,
  "Bekleyen Gönüllü Başvuruları": UsersRound,
  "Onay Bekleyen Makbuz": ReceiptText,
  "Açık Mesaj / Talep": MessageSquare
};

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader
        eyebrow="Genel Bakış"
        title="Operasyon İş Akışı"
        description="İş kayıtları, görevler, bağış hareketleri, makbuzlar, rezervasyonlar ve personel takipleri tek merkezden izlenir. Bu ekran demo verilerle çalışır."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {operationKpis.map((stat) => {
          const Icon = iconMap[stat.label as keyof typeof iconMap] ?? FileCheck2;
          return (
            <article key={stat.label} className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-ink-muted">{stat.label}</p>
                  <p className="mt-1 text-2xl font-black text-dark-navy">{stat.value}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-soft-blue text-deep-blue"><Icon aria-hidden className="h-4 w-4" /></span>
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-ink-muted">{stat.helper}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminChartCard title="Akış Şeması" description="Operasyon ekibinin takip ettiği son görev ve iş akışları.">
          <AdminTable headers={["ID", "Başlık", "Sorumlu", "Modül", "Durum", "Tarih", "İşlem"]} recordCount={operationFlowItems.length}>
            {operationFlowItems.map((item) => (
              <tr key={item.id}>
                <td className="font-bold text-dark-navy">{item.id}</td>
                <td className="font-bold text-dark-navy">{item.title}</td>
                <td>{item.owner}</td>
                <td>{item.module}</td>
                <td><AdminStatusBadge status={item.status} /></td>
                <td>{item.date}</td>
                <td><Link className="focus-ring inline-flex rounded-md p-1 text-ocean-green hover:bg-soft-blue" href="/admin/is-kayitlari"><ArrowUpRight aria-hidden className="h-4 w-4" /></Link></td>
              </tr>
            ))}
          </AdminTable>
        </AdminChartCard>

        <AdminChartCard title="Son İş Kayıtları" description="Bağış, görev, makbuz ve mesaj hareketleri.">
          <div className="grid gap-2">
            {recentWorkRecords.map((record) => (
              <Link key={record.id} href="/admin/is-kayitlari" className="focus-ring flex items-center justify-between gap-3 rounded-md border border-border-soft px-3 py-2 hover:bg-soft-gray">
                <div>
                  <p className="text-sm font-extrabold text-dark-navy">{record.title}</p>
                  <p className="text-xs font-semibold text-ink-muted">{record.id} · {record.type} · {record.time}</p>
                </div>
                <AdminStatusBadge status={record.status} />
              </Link>
            ))}
          </div>
          <div className="mt-3 rounded-md bg-soft-gray px-3 py-2 text-xs font-semibold text-ink-muted">
            Okunmamış iş kaydı bulunmadığında bu alan sade boş durum mesajı gösterecek şekilde hazırlanmıştır.
          </div>
        </AdminChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr_0.8fr]">
        <AdminChartCard title="Hızlı Erişim" description="Operasyon ekipleri için sık kullanılan ekranlar.">
          <AdminQuickActions actions={quickActions} />
        </AdminChartCard>
        <AdminChartCard title="Bugünkü Operasyon Özeti" description="Demo gün içi iş yükü dağılımı.">
          <div className="grid gap-2 sm:grid-cols-3">
            <AdminMiniStat label="Açık iş kaydı" value={18} />
            <AdminMiniStat label="Masraf talebi" value={6} />
            <AdminMiniStat label="Rezervasyon" value={3} />
          </div>
        </AdminChartCard>
        <div className="grid gap-3">
          <AdminPanelNotice title="Demo mod aktif">
            Gerçek veri kaydı, ödeme ve CRUD yoktur. RLS/auth güvenliği korunarak demo veri gösterilir.
          </AdminPanelNotice>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminChartCard
          title="Bağış Akışı"
          description="Günlük bağış tutarı ve işlem adedi. Adminin finansal hareketi hızlı okuması için tutulur."
          actions={["7 gün", "30 gün", "90 gün"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={`focus-ring rounded-md px-2.5 py-1 text-[0.68rem] font-extrabold ${index === 0 ? "bg-deep-blue text-white" : "bg-soft-gray text-ink-muted"}`}
            >
              {label}
            </button>
          ))}
        >
          <AdminLineChart data={dailyDonations} />
        </AdminChartCard>

        <AdminChartCard
          title="Kampanya Performansı"
          description="En çok destek alan kampanyaların miktar ve destekçi karşılaştırması."
        >
          <AdminBarChart data={topCampaigns} />
        </AdminChartCard>
      </section>
    </div>
  );
}
