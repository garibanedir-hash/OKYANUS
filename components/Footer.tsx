import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OfficialLogo } from "@/components/brand/OfficialLogo";

const quickLinks = [
  ["Hakkımızda", "/hakkimizda"],
  ["Faaliyetler", "/faaliyetler"],
  ["Projeler", "/projeler"],
  ["Bağış Yap", "/bagis-yap"],
  ["Gönüllü Ol", "/gonullu-ol"],
  ["Şeffaflık", "/seffaflik"],
  ["Faaliyet Raporları", "/faaliyet-raporlari"],
  ["İletişim", "/iletisim"]
];

const activityLinks = ["Acil Yardım", "Gıda Desteği", "Eğitim Desteği", "Yetim Destekleri", "Kış Yardımları"];
const legalLinks = [
  ["Gizlilik Politikası", "/gizlilik-politikasi"],
  ["KVKK Aydınlatma Metni", "/kvkk-aydinlatma-metni"],
  ["Çerez Politikası", "/cerez-politikasi"],
  ["Bağış Şartları", "/bagis-sartlari"]
];

export function Footer() {
  return (
    <footer className="bg-dark-navy text-white">
      <Container className="py-14">
        <div className="mb-10 grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mint-green">Bir damla destek, büyüyen bir iyiliğe dönüşür</p>
            <h2 className="mt-2 text-2xl font-bold">Bağışınız ve emeğiniz güvenle takip edilen projelere ulaşır.</h2>
          </div>
          <Button href="/bagis-yap" variant="light" showIcon>
            Bağış Yap
          </Button>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_1fr]">
          <div>
            <OfficialLogo variant="white" context="footer" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
              İhtiyaç sahiplerine umut, güven ve destek ulaştırmak için bağışçı, gönüllü ve saha ekiplerimizle birlikte çalışıyoruz.
            </p>
            <div className="mt-6 flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label="Sosyal medya hesabı"
                  className="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-ocean-green"
                >
                  <Icon aria-hidden className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-mint-green">Hızlı Linkler</h2>
            <ul className="mt-5 space-y-3 text-sm text-white/72">
              {quickLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="focus-ring rounded-full transition hover:text-white">
                    {label}
                  </Link>
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
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-mint-green">İletişim</h2>
            <ul className="mt-5 space-y-4 text-sm text-white/72">
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 text-mint-green" />
                İstanbul, Türkiye
              </li>
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 h-4 w-4 text-mint-green" />
                +90 212 000 00 00
              </li>
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 text-mint-green" />
                bilgi@okyanusyardim.org
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
