import { BarChart3, CircleDollarSign, HeartHandshake, UsersRound } from "lucide-react";
import {
  dailyDonations,
  dashboardStats,
  donationSummary,
  quickActions,
  recentActivities,
  supporterGrowth,
  systemStatus,
  topCampaigns,
  volunteerTrends
} from "@/data/adminAnalyticsMock";
import { formatCurrency } from "@/lib/format";
import { AdminActivityFeed } from "@/components/admin/AdminActivityFeed";
import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminKpiCard } from "@/components/admin/AdminKpiCard";
import { AdminLineChart } from "@/components/admin/AdminLineChart";
import { AdminMiniStat } from "@/components/admin/AdminMiniStat";
import { AdminPanelNotice } from "@/components/admin/AdminPanelNotice";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

const rangeFilters = ["Son 7 gün", "Son 30 gün", "Son 90 gün", "Bu yıl"];

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-8">
      <AdminSectionHeader
        eyebrow="Genel Bakış"
        title="Operasyon Kontrol Merkezi"
        description="Bu panel şu an demo/frontend modunda çalışır. Supabase Auth, proxy tabanlı route guard ve RLS entegrasyonu için altyapı hazırlanmıştır. Gerçek kullanımda admin route’ları oturum ve rol kontrolüyle korunacaktır."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => (
          <AdminKpiCard key={stat.title} stat={stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <AdminChartCard
          title="Günlere Göre Bağış Akışı"
          description="Günlük bağış tutarı ve işlem adedi demo verilerle izlenir."
          actions={rangeFilters.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`focus-ring rounded-full px-3 py-1.5 text-xs font-bold ${index === 0 ? "bg-deep-blue text-white" : "bg-soft-gray text-ink-muted"}`}
            >
              {filter}
            </button>
          ))}
        >
          <AdminLineChart data={dailyDonations} />
        </AdminChartCard>

        <div className="grid gap-4">
          <AdminPanelNotice title="Demo mod aktif">
            Bu yönetim paneli gerçek veri kaydetmez. Auth, RLS, ödeme ve veritabanı entegrasyonları bir sonraki gerçek backend aşamasında bağlanacaktır.
          </AdminPanelNotice>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <AdminMiniStat label="Bugünkü bağış" value={formatCurrency(donationSummary.todayAmount)} />
            <AdminMiniStat label="Bugünkü işlem" value={donationSummary.todayCount} />
            <AdminMiniStat label="Ortalama bağış" value={formatCurrency(donationSummary.averageDonation)} />
            <AdminMiniStat label="Son 30 gün trendi" value={donationSummary.thirtyDayTrend} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminChartCard
          title="En Çok Destek Alan Kampanyalar"
          description="Kampanya bazlı toplanan miktar ve destekçi sayısı."
        >
          <AdminBarChart data={topCampaigns} />
        </AdminChartCard>

        <AdminChartCard
          title="Operasyon İçgörüleri"
          description="Destekçi büyümesi ve gönüllü şehir yoğunluğu."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-soft-gray p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-dark-navy">
                <UsersRound aria-hidden className="h-4 w-4 text-ocean-green" />
                Destekçi Büyümesi
              </div>
              <div className="mt-4 grid gap-2">
                {supporterGrowth.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-muted">{item.label}</span>
                    <span className="font-extrabold text-deep-blue">{item.supporters}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-soft-gray p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-dark-navy">
                <HeartHandshake aria-hidden className="h-4 w-4 text-ocean-green" />
                Gönüllü Şehirleri
              </div>
              <div className="mt-4 grid gap-2">
                {volunteerTrends.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-muted">{item.label}</span>
                    <span className="font-extrabold text-deep-blue">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AdminChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AdminChartCard title="Son Aktiviteler" description="Panelde izlenmesi gereken son demo işlemler.">
          <AdminActivityFeed activities={recentActivities} />
        </AdminChartCard>
        <AdminChartCard title="Hızlı İşlemler" description="Operasyon ekipleri için sık kullanılan kısa yollar.">
          <AdminQuickActions actions={quickActions} />
        </AdminChartCard>
      </section>

      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
            <BarChart3 aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-dark-navy">Sistem Durumu</h2>
            <p className="text-sm text-ink-muted">Gerçek backend öncesi panel hazırlık durumu.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {systemStatus.map((item) => (
            <div key={item.label} className="rounded-2xl bg-soft-gray p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-bold text-dark-navy">{item.label}</p>
                <AdminStatusBadge status={item.status} />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-muted">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <CircleDollarSign aria-hidden className="h-5 w-5 text-ocean-green" />
          <p className="font-bold text-dark-navy">Bağış ve ödeme entegrasyonu henüz aktif değil; bu ekran operasyon mimarisini göstermek için demo veriyle çalışır.</p>
        </div>
      </section>
    </div>
  );
}
