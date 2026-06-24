import { ClipboardList, FileCheck2, Inbox, MessageSquare, ReceiptText, UsersRound, WalletCards } from "lucide-react";
import type { QuickAction } from "@/data/adminAnalyticsMock";
import { getAdminReadOnlyContentMetrics } from "@/lib/data/adminRepository";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
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

const operationalStats = [
  { label: "İşlem Bekleyenler", value: 0, helper: "Gerçek kayıt geldikçe güncellenir" },
  { label: "Takibimdeki Görevler", value: 0, helper: "Atanmış görev bulunmuyor" },
  { label: "Bugünkü Bağış Hareketi", value: "0 TL", helper: "Online ödeme kapalı; WhatsApp yönlendirme aktif" },
  { label: "Bekleyen Başvuru", value: 0, helper: "Yeni başvuru bulunmuyor" },
  { label: "Onay Bekleyen Makbuz", value: 0, helper: "Bekleyen makbuz bulunmuyor" },
  { label: "Açık Mesaj / Talep", value: 0, helper: "Yanıt bekleyen kayıt bulunmuyor" }
];

export default async function AdminDashboardPage() {
  const contentMetrics = await getAdminReadOnlyContentMetrics();

  return (
    <div className="grid gap-5">
      <AdminSectionHeader
        eyebrow="Genel Bakış"
        title="Operasyon İş Akışı"
        description="İş kayıtları, görevler, bağış hareketleri, makbuzlar, rezervasyonlar ve personel takipleri tek merkezden izlenir."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {operationalStats.map((stat) => {
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

      <section className="rounded-lg border border-border-soft bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-ocean-green">Read-only içerik</p>
            <h2 className="mt-1 text-lg font-extrabold text-dark-navy">Public içerik sayaçları</h2>
          </div>
          <span className="rounded bg-soft-blue px-3 py-1 text-xs font-extrabold text-deep-blue">
            Gerçek kayıt sayaçları
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <AdminMiniStat label="Yayındaki proje" value={contentMetrics.data.projectCount} />
          <AdminMiniStat label="Yayındaki haber" value={contentMetrics.data.newsCount} />
          <AdminMiniStat label="Yayındaki rapor" value={contentMetrics.data.reportCount} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminChartCard title="Akış Şeması" description="Operasyon ekibinin takip ettiği son görev ve iş akışları.">
          <AdminTable headers={["ID", "Başlık", "Sorumlu", "Modül", "Durum", "Tarih", "İşlem"]} recordCount={0} empty>
            {null}
          </AdminTable>
        </AdminChartCard>

        <AdminChartCard title="Son İş Kayıtları" description="Bağış, görev, makbuz ve mesaj hareketleri.">
          <div className="grid gap-2">
            <div className="rounded-md border border-dashed border-border-soft px-3 py-5 text-sm font-semibold leading-6 text-ink-muted">
              Henüz iş kaydı bulunmuyor. Gerçek kayıtlar oluşturulduğunda bu alanda görüntülenecektir.
            </div>
          </div>
        </AdminChartCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr_0.8fr]">
        <AdminChartCard title="Hızlı Erişim" description="Operasyon ekipleri için sık kullanılan ekranlar.">
          <AdminQuickActions actions={quickActions} />
        </AdminChartCard>
        <AdminChartCard title="Bugünkü Operasyon Özeti" description="Gün içi iş yükü gerçek kayıtlar oluştuğunda özetlenir.">
          <div className="grid gap-2 sm:grid-cols-3">
            <AdminMiniStat label="Açık iş kaydı" value={0} />
            <AdminMiniStat label="Masraf talebi" value={0} />
            <AdminMiniStat label="Rezervasyon" value={0} />
          </div>
        </AdminChartCard>
        <div className="grid gap-3">
          <AdminPanelNotice title="Operasyon notu">
            Gerçek kayıtlar eklendiğinde dashboard sayaçları ve listeler bu alanda güncellenecektir.
          </AdminPanelNotice>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <AdminChartCard
          title="Bağış Akışı"
          description="Bağış kayıtları oluştuğunda günlük hareket burada izlenir."
        >
          <div className="rounded-md border border-dashed border-border-soft px-4 py-8 text-center text-sm font-semibold leading-6 text-ink-muted">
            Henüz grafik oluşturacak bağış kaydı bulunmuyor.
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Kampanya Performansı"
          description="Kampanya verileri oluştuğunda karşılaştırmalı özet burada görünür."
        >
          <div className="rounded-md border border-dashed border-border-soft px-4 py-8 text-center text-sm font-semibold leading-6 text-ink-muted">
            Kampanya performansı için henüz doğrulanmış kayıt bulunmuyor.
          </div>
        </AdminChartCard>
      </section>
    </div>
  );
}
