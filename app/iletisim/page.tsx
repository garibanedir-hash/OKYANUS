import type { Metadata } from "next";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { createContactMessageAction } from "@/app/iletisim/actions";
import { getTurnstilePublicConfig } from "@/lib/security/turnstilePublic";
import { contactInfo } from "@/data/contactInfo";
import { activeSocialLinks, socialLinks } from "@/data/socialLinks";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Okyanus Derneği iletişim formu, adres, telefon ve e-posta bilgileri.",
  alternates: {
    canonical: "/iletisim"
  }
};

const contactItems: Array<{ icon: LucideIcon; title: string; text: string; href?: string }> = [
  { icon: MapPin, title: "Adres", text: contactInfo.address },
  { icon: Phone, title: "Telefon", text: contactInfo.phoneDisplay, href: contactInfo.phoneHref },
  { icon: Mail, title: "E-posta", text: contactInfo.email, href: contactInfo.emailHref }
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
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="İletişim Bilgileri"
                title="Açık, ulaşılabilir ve takip edilebilir iletişim"
                description="Mesajlarınızı ilgili ekiplere yönlendirmek ve en kısa sürede dönüş yapmak için bilgilerinizi kayıt altına alıyoruz."
              />
              <div className="mt-8 grid gap-4">
                {contactItems.map(({ icon: Icon, title, text, href }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-green text-ocean-green">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-dark-navy">{title}</p>
                      {href ? (
                        <a href={href} className="focus-ring mt-1 inline-flex rounded-full font-semibold text-deep-blue transition hover:text-ocean-green">
                          {text}
                        </a>
                      ) : (
                        <p className="mt-1 text-slate-600">{text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-card">
                <p className="text-sm font-bold text-dark-navy">Sosyal medya</p>
                {activeSocialLinks.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeSocialLinks.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="focus-ring inline-flex items-center gap-2 rounded-full bg-soft-blue px-4 py-2 text-sm font-bold text-deep-blue transition hover:bg-mint-green"
                      >
                        {item.label}
                        <ExternalLink aria-hidden className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  {socialLinks
                    .filter((item) => !item.isActive)
                    .map((item) => (
                      <span key={item.label} className="rounded-full border border-border-soft bg-soft-gray px-3 py-1.5 text-xs font-bold text-ink-muted">
                        {item.label}
                      </span>
                    ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Sosyal medya hesap bağlantıları netleştirildiğinde bu alana eklenecektir; boş veya geçici link kullanılmaz.
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
