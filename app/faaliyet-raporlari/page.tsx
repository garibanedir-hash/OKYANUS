import type { Metadata } from "next";
import { reports } from "@/data/reports";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { ReportCard } from "@/components/sections/ReportCard";

export const metadata: Metadata = {
  title: "Faaliyet Raporları",
  description: "Okyanus İnsani Yardım Derneği faaliyet raporları ve dönemsel çalışma özetleri."
};

export default function ReportsPage() {
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
            description="Bu sayfa şimdilik demo verilerle hazırlanmıştır. İleride PDF dosyaları ve CMS içerikleri aynı modele bağlanabilir."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
