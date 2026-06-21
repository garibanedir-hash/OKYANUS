import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OfficialLogo } from "@/components/brand/OfficialLogo";
import { CookiePreferencesButton } from "@/components/legal/CookiePreferencesButton";
import { contactInfo } from "@/data/contactInfo";
import { getLegalPagePath } from "@/data/legalPages";
import { activeSocialLinks } from "@/data/socialLinks";
import { resolveDonationTarget } from "@/lib/donations/donationTarget";
import type { DonationPublicConfig } from "@/lib/donations/donationTarget";

const quickLinks = [
  ["Hakkımızda", "/hakkimizda"],
  ["Tüzük", "/tuzuk"],
  ["SSS", "/sss"],
  ["Faaliyetler", "/faaliyetler"],
  ["Projeler", "/projeler"],
  ["Kurban", "/kurban"],
  ["Yetim Hamiliği", "/yetim-hamiligi"],
  ["Sponsorluk Süreci", "/yetim-hamiligi/surec"],
  ["Bağış Yap", "/bagis-yap"],
  ["Gönüllü Ol", "/gonullu-ol"],
  ["Şeffaflık", "/seffaflik"],
  ["Faaliyet Raporları", "/faaliyet-raporlari"],
  ["İletişim", "/iletisim"]
];

const activityLinks = ["Gıda ve Erzak Desteği", "Yetim Hamiliği", "Kurban Çalışmaları", "Gönüllülük", "Faaliyet Raporları"];
const legalLinks = [
  ["KVKK Aydınlatma Metni", getLegalPagePath("kvkk-aydinlatma-metni")],
  ["Gizlilik Politikası", getLegalPagePath("gizlilik-politikasi")],
  ["Çerez Politikası", getLegalPagePath("cerez-politikasi")],
  ["Bağış Bilgilendirme", getLegalPagePath("bagis-bilgilendirme-ve-sartlari")],
  ["İletişim", "/iletisim"]
];

export function Footer({ donationConfig }: { donationConfig: DonationPublicConfig }) {
  const donationTarget = resolveDonationTarget(donationConfig, { source: "general" }, "/bagis-yap");
  const donationLinkProps = {
    href: donationTarget.href,
    target: donationTarget.isExternal ? "_blank" : undefined,
    rel: donationTarget.isExternal ? "noopener noreferrer" : undefined
  };

  return (
    <footer className="bg-dark-navy text-white">
      <Container className="py-14">
        <div className="mb-10 grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint-green">Bir damla destek, büyüyen bir iyiliğe dönüşür</p>
            <h2 className="mt-2 text-2xl font-bold">Bağışınız ve emeğiniz güvenle takip edilen projelere ulaşır.</h2>
          </div>
          <Button {...donationLinkProps} variant="light" showIcon>
            Bağış Yap
          </Button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_1fr]">
          <div>
            <OfficialLogo variant="white" context="footer" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              İhtiyaç sahiplerine umut, güven ve destek ulaştırmak için bağışçı, gönüllü ve saha ekiplerimizle birlikte çalışıyoruz.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
              {activeSocialLinks.length ? (
                <div className="flex flex-wrap gap-2">
                  {activeSocialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-ring rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-mint-green hover:text-deep-blue"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              ) : (
                "Sosyal medya hesaplarımız netleştirildiğinde bu alanda paylaşılacaktır."
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-mint-green">Hızlı Linkler</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  {href === "/bagis-yap" ? (
                    <a
                      href={donationTarget.href}
                      target={donationTarget.isExternal ? "_blank" : undefined}
                      rel={donationTarget.isExternal ? "noopener noreferrer" : undefined}
                      className="focus-ring rounded-full transition hover:text-white"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className="focus-ring rounded-full transition hover:text-white">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-mint-green">Faaliyet Alanları</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              {activityLinks.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-mint-green">Yasal ve Güven</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              {legalLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="focus-ring rounded-full transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <CookiePreferencesButton />
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-mint-green">İletişim</h2>
            <ul className="mt-5 space-y-4 text-sm text-white/72">
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 text-mint-green" />
                {contactInfo.address}
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 h-4 w-4 text-mint-green" />
                <a href={contactInfo.phoneHref} className="focus-ring rounded-full transition hover:text-white">
                  {contactInfo.phoneDisplay}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 text-mint-green" />
                <a href={contactInfo.emailHref} className="focus-ring rounded-full transition hover:text-white">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-white/60">
          © 2026 Okyanus İnsani Yardım Derneği. Tüm hakları saklıdır.
        </div>
      </Container>
    </footer>
  );
}
