import type { Metadata } from "next";
import { BookOpen, ClipboardCheck, CreditCard, PackageCheck, ShieldCheck, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DonationForm } from "@/components/forms/DonationForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Bağış Yap",
  description: "Okyanus Derneği için genel bağış, gıda, eğitim, yetim ve acil yardım bağış ön kayıt formu."
};

const impactItems: Array<{ icon: LucideIcon; amount: string; text: string }> = [
  { icon: BookOpen, amount: "100 TL", text: "Bir öğrencinin kırtasiye desteğine katkı" },
  { icon: Utensils, amount: "250 TL", text: "Bir ailenin temel ihtiyaç desteğine katkı" },
  { icon: PackageCheck, amount: "500 TL", text: "Gıda kolisi desteğine katkı" },
  { icon: ShieldCheck, amount: "1000 TL", text: "Kapsamlı aile destek paketine katkı" }
];

const trustNotes: Array<{ icon: LucideIcon; text: string }> = [
  { icon: ShieldCheck, text: "Bağış bilgileriniz güvenle işlenir." },
  { icon: ClipboardCheck, text: "Bağışlar proje bazlı kayıt altına alınır." },
  { icon: BookOpen, text: "Dilerseniz destek olmak istediğiniz alanı seçebilirsiniz." },
  { icon: CreditCard, text: "Bu ekran şu an demo/frontend akışı olarak hazırlanmıştır." }
];

type DonatePageProps = {
  searchParams?: Promise<{ proje?: string }>;
};

export default async function DonatePage({ searchParams }: DonatePageProps) {
  const params = await searchParams;
  return (
    <>
      <PageHero
        eyebrow="Bağış Yap"
        title="Emanetinizi güvenle destek alanına dönüştürün"
        description="Bağış ön kayıt akışı, ileride güvenli ödeme ve proje bazlı raporlama sistemine bağlanabilecek şekilde hazırlandı."
      />
      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Bağış Akışı"
                title="Bağışınız neye dönüşür?"
                description="Her tutar küçük ya da büyük fark etmeden, planlı ve kayıtlı bir dayanışma sürecinin parçası olur."
              />
              <div className="mt-8 grid gap-4">
                {impactItems.map(({ icon: Icon, amount, text }) => (
                  <div key={amount} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-extrabold text-deep-blue">{amount}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-brand bg-white p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-soft-blue text-deep-blue">
                    <ShieldCheck aria-hidden className="h-6 w-6" />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-dark-navy">Şeffaf bağış süreci</h2>
                    <p className="mt-2 leading-7 text-slate-600">
                      Bağış türü, tutar, bağışçı bilgisi ve not alanı ayrı tutulur; ileride ödeme, makbuz ve proje raporu modüllerine bağlanabilir.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-xl font-bold text-dark-navy">Güven notları</h2>
                <div className="mt-5 grid gap-3">
                  {trustNotes.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3 text-sm font-semibold leading-6 text-ink-muted">
                      <Icon aria-hidden className="mt-0.5 h-5 w-5 text-ocean-green" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DonationForm initialProjectSlug={params?.proje} />
          </div>
        </Container>
      </section>
    </>
  );
}
