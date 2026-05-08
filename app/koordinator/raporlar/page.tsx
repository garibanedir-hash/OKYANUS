import { reports } from "@/data/reports";
import { ReportCard } from "@/components/sections/ReportCard";
import { AdminSectionHeader } from "@/components/admin/AdminSectionHeader";

export default function CoordinatorReportsPage() {
  return <div className="grid gap-6"><AdminSectionHeader eyebrow="Rapor taslakları" title="Faaliyet Raporları" description="Koordinatörün sorumlu olduğu faaliyet raporu taslakları için demo görünüm." actionLabel="Taslak Oluştur" /><section className="grid gap-5 md:grid-cols-2">{reports.slice(0, 3).map((report) => <ReportCard key={report.slug} report={report} />)}</section></div>;
}
