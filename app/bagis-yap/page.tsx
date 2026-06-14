import type { Metadata } from "next";
import { BookOpen, ClipboardCheck, CreditCard, PackageCheck, ShieldCheck, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DonationForm } from "@/components/forms/DonationForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { Button } from "@/components/ui/Button";
import { createGeneralDonationPaymentIntentAction } from "@/app/bagis-yap/actions";
import { DonationCtaButton } from "@/components/donations/DonationCtaButton";
import { DonationModePanel } from "@/components/donations/DonationModePanel";
import { getDonationMode } from "@/lib/donations/donationMode";
import { getTurnstilePublicConfig } from "@/lib/security/turnstilePublic";

export const metadata: Metadata = {
  title: "Bağış Yap",
  description: "Okyanus Derneği için genel bağış, gıda, eğitim, yetim ve acil yardım bağış ön kayıt formu."
};

const impactItems: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: BookOpen, title: "Eğitim Desteği", text: "Öğrencilerin kırtasiye ve eğitim materyali ihtiyaçlarına katkı" },
  { icon: Utensils, title: "Temel İhtiyaç", text: "Ailelerin gıda ve temel ihtiyaç desteklerine katkı" },
  { icon: PackageCheck, title: "Saha Hazırlığı", text: "Yardım paketlerinin planlı ve kayıtlı şekilde hazırlanmasına katkı" },
  { icon: ShieldCheck, title: "Aile Desteği", text: "Mahremiyet ve emanet bilinciyle yürütülen destek süreçlerine katkı" }
];

const trustNotes: Array<{ icon: LucideIcon; text: string }> = [
  { icon: ShieldCheck, text: "Bağış bilgileriniz güvenle işlenir." },
  { icon: ClipboardCheck, text: "Bağışlar proje bazlı kayıt altına alınır." },
  { icon: BookOpen, text: "Dilerseniz destek olmak istediğiniz alanı seçebilirsiniz." },
  { icon: CreditCard, text: "Tanıtım döneminde bağış bilgilendirmesi ekibimiz tarafından yönlendirilir." }
];

type DonatePageProps = {
  searchParams?: Promise<{ proje?: string; durum?: string; mesaj?: string }>;
};

export default async function DonatePage({ searchParams }: DonatePageProps) {
  const params = await searchParams;
  const donationMode = getDonationMode();
  const isOnlineMode = donationMode === "online";

  return (
    <>
      <PageHero
        eyebrow="Bağış Yap"
        title="Emanetinizi güvenle destek alanına dönüştürün"
        description={
          isOnlineMode
            ? "Bağış ön kayıt akışı, güvenli ödeme ve proje bazlı raporlama sistemine bağlanabilecek şekilde hazırlandı."
            : "Bağış bilgilendirme sürecimiz şu anda güvenli iletişim kanalları üzerinden yönlendiriliyor."
        }
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
                {impactItems.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-extrabold text-deep-blue">{title}</p>
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
                      Bağış türü, tutar, bağışçı bilgisi ve not alanı ayrı ele alınır; destekleriniz proje ve faaliyet başlıklarıyla düzenli şekilde takip edilir.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-brand border border-primary-blue/20 bg-soft-blue p-6 shadow-card">
                <h2 className="text-xl font-bold text-dark-navy">Ödeme sağlayıcı bağımsız hazırlık</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  {isOnlineMode
                    ? "Genel bağış kayıtları, seçilen destek alanı ve proje bilgisiyle birlikte güvenli ödeme akışına hazırlanır."
                    : "Bu modda online ödeme formu gösterilmez; destek olmak istediğiniz alan için ekibimiz WhatsApp veya iletişim kanalları üzerinden size yardımcı olur."}
                </p>
              </div>
              <div className="mt-6 rounded-brand border border-ocean-green/20 bg-mint-green/50 p-6 shadow-card">
                <h2 className="text-xl font-bold text-dark-navy">Kurban bağışı</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Kurban bağışı yapmak için Kurban Çalışmaları sayfasına geçebilirsiniz. Vekalet, kesim ve dağıtım akışı bu modülde ayrıca takip edilir.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/kurban" variant="secondary" showIcon>
                    Kurban Çalışmaları
                  </Button>
                  <DonationCtaButton label="Kurban Bağışı Yap" context={{ source: "qurban" }} onlineHref="/kurban/bagis" variant="ghost" />
                </div>
              </div>
              <div className="mt-6 rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <h2 className="text-xl font-bold text-dark-navy">Yetim hamiliği</h2>
                <p className="mt-2 leading-7 text-slate-600">
                  Düzenli destekle bir yetimin hayatına umut olun. Çocuk mahremiyetini koruyan sponsorluk süreci ayrı modülde takip edilir.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href="/yetim-hamiligi" variant="secondary" showIcon>
                    Yetim Hamiliği
                  </Button>
                  <DonationCtaButton label="Başvuru" context={{ source: "orphan" }} onlineHref="/yetim-hamiligi/basvuru" variant="ghost" />
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
            {isOnlineMode ? (
              <DonationForm
                initialProjectSlug={params?.proje}
                action={createGeneralDonationPaymentIntentAction}
                formError={params?.durum === "hata" ? params?.mesaj ?? "Bağış ön kaydı oluşturulamadı." : undefined}
                formNotice={params?.durum === "alindi" ? "Bağış ön kaydınız alındı." : undefined}
                turnstile={getTurnstilePublicConfig("donation")}
              />
            ) : (
              <DonationModePanel context={{ source: "general" }} onlineHref="/bagis-yap" />
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
