import type { Metadata } from "next";
import { BellRing, CheckCircle2, ClipboardCheck, CreditCard, FileText, ShieldCheck, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DonationCtaButton } from "@/components/donations/DonationCtaButton";

export const metadata: Metadata = {
  title: "Yetim Hamiliği Süreci",
  description: "Yetim hamiliği başvuru, eşleşme, düzenli destek ve güvenli bilgilendirme süreci."
};

const steps: Array<{ title: string; text: string; icon: LucideIcon }> = [
  { title: "Başvuru alınır", text: "Sponsor adayının iletişim ve destek tercihleri güvenli ön başvuru olarak değerlendirilir.", icon: ClipboardCheck },
  { title: "Sponsor profili oluşturulur", text: "KVKK ve iletişim tercihleri ile düzenli destek niyeti kayıt altına alınır.", icon: UserCheck },
  { title: "Uygun sponsorluk eşleşmesi yapılır", text: "Eşleşme çocuk mahremiyeti ve saha değerlendirmesi gözetilerek yetkili ekip tarafından hazırlanır.", icon: ShieldCheck },
  { title: "Düzenli destek süreci başlar", text: "Destek niyeti, bağışçı bilgilendirmesi ve takip adımları yetkili ekip tarafından kayıt altında yürütülür.", icon: CreditCard },
  { title: "Güvenli güncellemeler paylaşılır", text: "Sponsor panelinde yalnızca güvenli özetler ve periyodik durum bilgileri görünür.", icon: BellRing },
  { title: "Makbuz ve bilgilendirme izlenir", text: "Makbuz, iletişim ve raporlama adımları dernek kayıt düzeni içinde güvenli şekilde takip edilir.", icon: FileText }
];

export default function OrphanSponsorshipProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="Sponsorluk Süreci"
        title="Yetim hamiliği süreci kontrollü adımlarla ilerler"
        description="Başvuru, eşleşme, düzenli destek, güvenli güncelleme ve bilgilendirme adımları birbirinden ayrılmış durumlarla takip edilir."
      >
        <div className="flex flex-wrap gap-3">
          <DonationCtaButton label="Yetim Hamiliğine Başvur" context={{ source: "orphan" }} onlineHref="/yetim-hamiligi/basvuru" showIcon />
          <Button href="/yetim-hamiligi" variant="ghost">
            Programa Dön
          </Button>
        </div>
      </PageHero>

      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Adım Adım"
            title="Güvenli ve sürdürülebilir takip"
            description="Bu süreç çocuğun mahremiyetini koruyarak sponsorun desteğini anlaşılır ve izlenebilir hale getirmek için tasarlanmıştır."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map(({ title, text, icon: Icon }, index) => (
              <article key={title} className="rounded-lg border border-border-soft bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Icon aria-hidden className="h-6 w-6 text-ocean-green" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-green text-xs font-black text-ocean-green">{index + 1}</span>
                </div>
                <h2 className="mt-5 text-lg font-extrabold text-dark-navy">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-muted">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-brand border border-border-soft bg-white p-6 shadow-card">
            <div className="flex items-start gap-3">
              <CheckCircle2 aria-hidden className="mt-1 h-5 w-5 text-ocean-green" />
              <p className="text-sm font-semibold leading-7 text-ink-muted">
                Yetim hamiliği süreci çocuğun mahremiyetini ve bağışçının bilgilendirme hakkını birlikte gözetir. Açık kimlik, adres ve hassas aile bilgileri public alanda paylaşılmaz.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
