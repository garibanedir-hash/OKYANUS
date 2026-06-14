import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { createContactMessageAction } from "@/app/iletisim/actions";
import { getTurnstilePublicConfig } from "@/lib/security/turnstilePublic";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Okyanus Derneği iletişim formu, adres, telefon ve e-posta bilgileri."
};

const contactItems: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: MapPin, title: "Adres", text: "İstanbul, Türkiye" },
  { icon: Phone, title: "Telefon", text: "+90 212 000 00 00" },
  { icon: Mail, title: "E-posta", text: "bilgi@okyanus.org.tr" }
];

type ContactPageProps = {
  searchParams?: Promise<{ durum?: string; mesaj?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;

  return (
    <>
      <PageHero
        eyebrow="İletişim"
        title="Bize ulaşın, birlikte iyiliği büyütelim"
        description="Bağış, gönüllülük, proje desteği veya kurumsal iş birlikleriyle ilgili sorularınız için bizimle iletişime geçebilirsiniz."
      />
      <section className="bg-soft-gray py-16 sm:py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="İletişim Bilgileri"
                title="Açık, ulaşılabilir ve takip edilebilir iletişim"
                description="Mesajlarınızı ilgili ekiplere yönlendirmek ve en kısa sürede dönüş yapmak için bilgilerinizi kayıt altına alıyoruz."
              />
              <div className="mt-8 grid gap-4">
                {contactItems.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-dark-navy">{title}</p>
                      <p className="mt-1 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-card">
                <p className="text-sm font-bold text-dark-navy">Sosyal medya</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Resmi sosyal medya hesaplarımız netleştikçe bu alanda paylaşılacaktır. Güncel duyurular için iletişim formu, telefon ve e-posta kanallarımızdan bize ulaşabilirsiniz.
                </p>
              </div>
              <div className="mt-6 rounded-[1.75rem] border border-border-soft bg-white p-6 shadow-card">
                <p className="text-sm font-bold text-dark-navy">Çalışma ve iletişim merkezi</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Adres ve ziyaret bilgileri güncellendikçe bu alanda duyurulacaktır. Şimdilik bağış, gönüllülük ve proje iş birlikleri için iletişim formu üzerinden ekibimize ulaşabilirsiniz.
                </p>
              </div>
            </div>
            <ContactForm
              action={createContactMessageAction}
              formNotice={
                params?.durum === "alindi"
                  ? "Mesajınız bize ulaştı. İlgili ekibimiz talebinizi inceleyip en kısa sürede sizinle iletişime geçecektir."
                  : undefined
              }
              formError={params?.durum === "hata" ? params?.mesaj ?? "Mesajınız kaydedilemedi." : undefined}
              turnstile={getTurnstilePublicConfig("contact")}
            />
          </div>
        </Container>
      </section>
    </>
  );
}
