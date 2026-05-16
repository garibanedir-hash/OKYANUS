import { topCampaigns, dailyDonations } from "@/data/adminAnalyticsMock";
import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminChartCard } from "@/components/admin/AdminChartCard";
import { AdminLineChart } from "@/components/admin/AdminLineChart";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function AdminChartsPage() {
  return (
    <div className="grid gap-5">
      <AdminSectionHeader eyebrow="Analitik" title="Grafikler" description="Grafikler operasyon ekranlarında ikincil analiz desteği olarak tutulur." />
      <section className="grid gap-4 xl:grid-cols-2">
        <AdminChartCard title="Günlere Göre Bağış Akışı"><AdminLineChart data={dailyDonations} /></AdminChartCard>
        <AdminChartCard title="Kampanya Performansı"><AdminBarChart data={topCampaigns} /></AdminChartCard>
      </section>
    </div>
  );
}
