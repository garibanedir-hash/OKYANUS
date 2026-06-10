import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { ReportCard } from "@/components/sections/ReportCard";
import { getPublishedReports } from "@/lib/data/reportsRepository";

export const metadata: Metadata = {
  title: "Faaliyet Raporları",
  description: "Okyanus İnsani Yardım Derneği faaliyet raporları ve dönemsel çalışma özetleri."
};

export default async function ReportsPage() {
  const reports = await getPublishedReports();

  return (
    <>
      <PageHero
        eyebrow="Şeffaflık"
        title="Faaliyet Raporları"
        description="Okyanus İnsani Yardım Derneği olarak emanet bilinciyle yürüttüğümüz çalışmaların görünür, takip edilebilir ve anlaşılır olmasına önem veriyoruz."
      />
      <section className="bg-warm-white py-16">
        <Container>
          <SectionHeading
            eyebrow="Rapor Arşivi"
            title="Yıllara ve faaliyet alanlarına göre rapor yapısı"
            description="Yayınlanan raporlar ve dönemsel çalışma özetleri bu alanda ziyaretçilerle paylaşılır."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reports.length ? (
              reports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))
            ) : (
              <div className="rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted md:col-span-2">
                Yayında olan faaliyet raporu bulunmuyor.
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
