import type { Metadata } from "next";
import { CheckCircle2, ClipboardList, MessageCircle, Route, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { createVolunteerApplicationAction } from "@/app/gonullu-ol/actions";

export const metadata: Metadata = {
  title: "Gönüllü Ol",
  description: "Okyanus Derneği gönüllü başvuru formu ve gönüllülük alanları."
};

const areas = ["Saha faaliyetleri", "Organizasyon desteği", "Sosyal medya / tasarım", "Eğitim desteği", "Lojistik destek"];
const reasons: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: UsersRound, title: "Topluluğa dahil olun", text: "Güvenli ve planlı bir gönüllü ağı içinde üretin." },
  { icon: Route, title: "Doğru alanda destek verin", text: "İlgi alanınıza uygun ekiplerde görev alın." },
  { icon: MessageCircle, title: "Süreçten haberdar olun", text: "Faaliyetler ve ihtiyaçlar hakkında düzenli bilgi alın." }
];
const process = [
  ["Başvuru", "Form üzerinden ilgi alanınızı ve iletişim bilgilerinizi paylaşırsınız."],
  ["Ön görüşme", "Ekibimiz sizi tanır, uygun zaman ve beklentileri birlikte netleştirir."],
  ["Ekip yönlendirmesi", "Yetkinlik ve ilgi alanınıza göre uygun gönüllü ekibine yönlendirilirsiniz."],
  ["Faaliyet katılımı", "Planlanan saha veya organizasyon çalışmalarına güvenli şekilde dahil olursunuz."]
];

type VolunteerPageProps = {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
};

export default async function VolunteerPage({ searchParams }: VolunteerPageProps) {
  const params = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="Gönüllü Ol"
        title="Emeğiniz, iyilik yolculuğunun güçlü bir parçası olabilir"
        description="İyilik sadece maddi destekle sınırlı değildir. Vaktiniz, emeğiniz, bilginiz ve kalbiniz de bu yolculuğun parçası olabilir."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Neden Gönüllülük?"
              title="İyilik sadece maddi destekle sınırlı değildir"
              description="Vaktiniz, emeğiniz, mesleki bilginiz ve saha desteğiniz Okyanus'un iyilik yolculuğunda güçlü bir karşılık bulabilir."
            />
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {reasons.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl bg-soft-gray p-4">
                  <Icon aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
                  <div>
                    <p className="font-bold text-dark-navy">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <h2 className="mt-10 text-2xl font-bold text-dark-navy">Hangi alanlarda destek olabilirsiniz?</h2>
            <div className="mt-5 grid gap-3">
              {areas.map((area) => (
                <div key={area} className="flex items-center gap-3 rounded-2xl bg-soft-gray p-4">
                  <CheckCircle2 aria-hidden className="h-5 w-5 text-ocean-green" />
                  <span className="font-semibold text-dark-navy">{area}</span>
                </div>
              ))}
            </div>
          </div>
          <VolunteerForm
            action={createVolunteerApplicationAction}
            formNotice={
              params?.durum === "alindi"
                ? "Başvurunuz bize ulaştı. En kısa sürede sizinle iletişime geçerek iyilik yolculuğundaki uygun alanı birlikte değerlendireceğiz."
                : undefined
            }
            formError={params?.durum === "hata" ? params?.mesaj ?? "Gönüllü başvurunuz kaydedilemedi." : undefined}
          />
          </div>
        </Container>
      </section>
      <section className="bg-soft-gray py-16">
        <Container>
          <SectionHeading
            eyebrow="Gönüllülük Süreci"
            title="Başvurudan faaliyete sade ve güvenli bir akış"
            description="Gönüllülerin doğru alana, doğru beklentiyle ve güvenli bir hazırlıkla dahil olmasını önemsiyoruz."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {process.map(([title, text], index) => (
              <article key={title} className="rounded-brand bg-white p-6 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                  <ClipboardList aria-hidden className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm font-bold text-primary-blue">0{index + 1}</p>
                <h3 className="mt-2 text-xl font-bold text-dark-navy">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
