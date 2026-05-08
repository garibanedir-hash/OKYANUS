import type { Metadata } from "next";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Okyanus Derneği iletişim formu, adres, telefon ve e-posta bilgileri."
};

const contactItems: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: MapPin, title: "Adres", text: "İstanbul, Türkiye" },
  { icon: Phone, title: "Telefon", text: "+90 212 000 00 00" },
  { icon: Mail, title: "E-posta", text: "bilgi@okyanusyardim.org" }
];

export default function ContactPage() {
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
                <div className="mt-4 flex gap-3">
                  {[Facebook, Instagram, Twitter].map((Icon, index) => (
                    <a
                      key={index}
                      href="#"
                      aria-label="Okyanus sosyal medya hesabı"
                      className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-soft-blue text-deep-blue transition hover:bg-ocean-green hover:text-white"
                    >
                      <Icon aria-hidden className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex h-64 items-center justify-center rounded-[1.75rem] border border-dashed border-primary-blue/30 bg-white text-center text-sm font-semibold text-slate-500">
                Harita alanı placeholder
              </div>
            </div>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
