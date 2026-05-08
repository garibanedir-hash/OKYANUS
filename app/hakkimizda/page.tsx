import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Okyanus İnsani Yardım Derneği'nin misyonu, vizyonu, değerleri ve şeffaflık anlayışı."
};

const values = ["Emanet bilinci", "İnsan onuruna saygı", "Şeffaflık", "Sürdürülebilir destek", "Gönüllülük", "Dayanışma"];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        title="Derin, kapsayıcı ve izlenebilir bir iyilik anlayışı"
        description="Okyanus İnsani Yardım Derneği; bağışçıların emanetini, gönüllülerin emeğini ve ihtiyaç sahiplerinin mahremiyetini aynı hassasiyetle gözeten bir dayanışma hareketidir."
      >
        <Button href="/seffaflik" variant="ghost" showIcon>
          Şeffaflık Anlayışımız
        </Button>
      </PageHero>
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
        <SectionHeading
          eyebrow="Biz Kimiz?"
          title="Güven veren bir dayanışma zemini kuruyoruz"
          description="Amacımız, iyi niyeti planlı çalışmaya; bağış ve gönüllü emeğini ölçülebilir, saygın ve sürdürülebilir desteğe dönüştürmek."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {[
            ["Misyon", "Gıda, eğitim, sağlık, yetim ve acil yardım alanlarında ihtiyaç sahiplerine düzenli, saygın ve takip edilebilir destek ulaştırmak."],
            ["Vizyon", "Türkiye'de ve dünyada güven duyulan, etkisi ölçülebilen ve iyiliği sürdürülebilir kılan bir insani yardım kurumu olmak."],
            ["Neden Okyanus?", "Okyanus; derinlik, süreklilik ve sınırları aşan iyilik demektir. Bir damlanın büyüyerek çok hayata temas edebileceğine inanıyoruz."]
          ].map(([title, text]) => (
            <article key={title} className="rounded-brand border border-slate-200 bg-white p-7 shadow-card">
              <h2 className="text-2xl font-bold text-dark-navy">{title}</h2>
              <p className="mt-4 leading-7 text-slate-600">{text}</p>
            </article>
          ))}
        </div>
        <div className="mt-12 grid gap-8 rounded-[1.75rem] bg-soft-gray p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-green">Değerlerimiz</p>
            <h2 className="mt-3 text-3xl font-bold text-dark-navy">Emanet ve şeffaflık anlayışımız</h2>
            <p className="mt-4 leading-8 text-slate-600">
              Bağışları kayıt altına almak, faaliyetleri raporlamak ve destekçileri düzenli bilgilendirmek kurumsal sorumluluğumuzun temelidir.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                <CheckCircle2 aria-hidden className="h-5 w-5 text-ocean-green" />
                <span className="font-semibold text-dark-navy">{value}</span>
              </div>
            ))}
          </div>
        </div>
        </Container>
      </section>
    </>
  );
}
