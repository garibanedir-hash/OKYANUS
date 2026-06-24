import type { Metadata } from "next";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Okyanus İnsani Yardım Derneği'nin misyonu, vizyonu, çalışma ilkeleri, etik değerleri ve hesap verebilirlik anlayışı.",
  alternates: {
    canonical: "/hakkimizda"
  }
};

const aboutCards = [
  {
    title: "Okyanus İnsani Yardım Derneği",
    text: "Okyanus İnsani Yardım Derneği; kriz, doğal afet, savaş ve yoksulluk gibi nedenlerle temel ihtiyaçlara erişmekte zorlanan insanlara destek olmak amacıyla kurulmuş, Türkiye merkezli bağımsız bir sivil toplum kuruluşudur."
  },
  {
    title: "Misyonumuz",
    text: "İnsani yardım çalışmalarını ayrım gözetmeme, insan onuruna saygı, emanet bilinci ve şeffaflık ilkeleriyle yürütmek; acil desteklerin yanında sürdürülebilir ve yerel kapasiteyi güçlendiren çözümler geliştirmek."
  },
  {
    title: "Vizyonumuz",
    text: "İnsan onurunun ve temel hakların korunduğu, yardım süreçlerinin güvenle izlenebildiği ve dayanışmanın kalıcı iyiliğe dönüştüğü bir çalışma kültürü oluşturmak."
  }
];

const workPrinciples = [
  "Ayrım gözetmeden ihtiyaç sahibine ulaşmayı esas almak.",
  "Bağışçı emanetini kayıtlı, takip edilebilir ve sorumlu şekilde yönetmek.",
  "Kriz anlarında hızlı hareket ederken saha güvenliği ve yerel koordinasyonu gözetmek.",
  "Yardım dilinde insan onurunu, mahremiyeti ve hassasiyetleri korumak.",
  "Faaliyet bilgilerini doğrulanan kayıtlarla paylaşmak."
];

const transparencyItems = [
  "Bağış ve destek süreçlerinin proje veya faaliyet başlığıyla ilişkilendirilmesi.",
  "Gider, gelir ve saha notlarının kurum içi kayıt mantığıyla takip edilmesi.",
  "Paydaş ve bağışçı iletişiminde açık, ölçülü ve doğrulanabilir bilgilendirme yapılması.",
  "Şikayet, öneri ve geri bildirim kanallarının önemsenmesi."
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Hakkımızda"
        title="İnsani yardımı emanet bilinci ve şeffaflıkla ele alıyoruz"
        description="Okyanus İnsani Yardım Derneği, ihtiyaç sahiplerinin onurunu ve bağışçıların emanetini aynı hassasiyetle gözeten bağımsız bir dayanışma yapısıdır."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="/biz-kimiz" variant="secondary" showIcon>
            Kurumsal Kimlik
          </Button>
          <Button href="/seffaflik" variant="ghost" showIcon>
            Şeffaflık Anlayışımız
          </Button>
        </div>
      </PageHero>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Kurumsal Bakış"
            title="Okyanus İnsani Yardım Derneği"
            description="Yardım çalışmalarımızı iyi niyetin ötesine taşıyan şey; planlı hareket etmek, kayıt tutmak, insan onurunu korumak ve süreçleri hesap verebilir şekilde yönetmektir."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {aboutCards.map((item) => (
              <article key={item.title} className="rounded-brand border border-slate-200 bg-white p-7 shadow-card">
                <h2 className="text-2xl font-bold text-dark-navy">{item.title}</h2>
                <p className="mt-4 leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-8 rounded-[1.75rem] bg-soft-gray p-7 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-ocean-green">Çalışma İlkelerimiz</p>
              <h2 className="mt-3 text-3xl font-bold text-dark-navy">Emanet, mahremiyet ve yerel ihtiyaç hassasiyeti</h2>
              <p className="mt-4 leading-8 text-slate-600">
                Çalışma ilkelerimiz; bağışçı güvenini, gönüllü emeğini ve ihtiyaç sahiplerinin mahremiyetini koruyan bir yardım yaklaşımı kurmak için belirlenmiştir.
              </p>
            </div>
            <div className="grid gap-3">
              {workPrinciples.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white p-4">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ocean-green" />
                  <span className="font-semibold leading-6 text-dark-navy">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Şeffaflık ve Hesap Verebilirlik"
                title="Güven, doğrulanabilir bilgiyle güçlenir"
                description="Bağışçıların ve paydaşların güvenini korumak için yardım süreçlerinde kayıt, kontrol, geri bildirim ve raporlama kültürü önemsenir."
              />
            </div>
            <div className="grid gap-4">
              {transparencyItems.map((item) => (
                <div key={item} className="flex gap-4 rounded-2xl border border-border-soft bg-white p-5 shadow-sm">
                  <ClipboardCheck aria-hidden className="mt-1 h-5 w-5 shrink-0 text-ocean-green" />
                  <p className="leading-7 text-ink-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
