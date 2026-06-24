import type { Metadata } from "next";
import { HandHeart, Scale, ShieldCheck, UsersRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Biz Kimiz?",
  description:
    "Okyanus İnsani Yardım Derneği'nin bağımsızlık, faaliyet anlayışı, etik değerler, denetim, risk analizi ve uyum yaklaşımı.",
  alternates: {
    canonical: "/biz-kimiz"
  }
};

const identitySections = [
  {
    icon: UsersRound,
    title: "Bağımsız ve Sivil Yapı",
    text: "Okyanus İnsani Yardım Derneği; herhangi bir siyasi yapı, grup veya çıkar odağına bağlı olmadan, sivil toplum sorumluluğu ve insani yardım ilkeleriyle hareket eder."
  },
  {
    icon: HandHeart,
    title: "Faaliyet Anlayışımız",
    text: "Yardımı yalnızca dönemsel bir destek olarak değil; insan onurunu koruyan, yerel ihtiyaçları dikkate alan ve sürdürülebilirliği önemseyen bir emanet sorumluluğu olarak görürüz."
  },
  {
    icon: Scale,
    title: "Etik Değerlerimiz",
    text: "Tarafsızlık, ayrım gözetmeme, insan haklarına saygı, mahremiyet, hesap verebilirlik ve bağışçı emanetine sadakat kurumsal yaklaşımımızın temelini oluşturur."
  },
  {
    icon: ShieldCheck,
    title: "Denetim, Risk Analizi ve Uyum",
    text: "İş birlikleri, saha uygulamaları ve bağış süreçleri; yasal yükümlülükler, kurumsal sorumluluk, risk değerlendirmesi ve kayıtlı takip anlayışı dikkate alınarak yürütülür."
  }
];

const principles = [
  "İnsani yardım süreçlerinde ihtiyaç sahibinin onurunu ve mahremiyetini korumak.",
  "Bağış ve destekleri kayıtlı, takip edilebilir ve sorumlu biçimde yönetmek.",
  "Saha çalışmalarında yerel gerçekliği, güvenliği ve koordinasyonu gözetmek.",
  "Paydaşlarla açık, ölçülü ve doğrulanabilir iletişim kurmak."
];

export default function WhoWeArePage() {
  return (
    <>
      <PageHero
        eyebrow="Biz Kimiz?"
        title="Bağımsız, sivil ve hak temelli bir yardım anlayışı"
        description="Okyanus; bağış, gönüllülük ve saha koordinasyonunu insani yardım ilkeleriyle bir araya getiren, kâr amacı gütmeyen bir sivil toplum kuruluşudur."
      >
        <Button href="/hakkimizda" variant="ghost" showIcon>
          Hakkımızda
        </Button>
      </PageHero>

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Kurumsal Kimlik"
            title="Çalışmalarımızı ilke, kayıt ve emanet bilinciyle yürütürüz"
            description="Bu sayfa, derneğin kendini nasıl konumlandırdığını ve faaliyetlerinde hangi temel sorumlulukları gözettiğini açıklar."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {identitySections.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-brand border border-border-soft bg-white p-6 shadow-card">
                <Icon aria-hidden className="h-7 w-7 text-ocean-green" />
                <h2 className="mt-4 text-xl font-extrabold text-dark-navy">{title}</h2>
                <p className="mt-3 leading-7 text-ink-muted">{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <SectionHeading
              eyebrow="Faaliyet İlkeleri"
              title="Saha çalışmalarında güven ve sorumluluk"
              description="Faaliyetlerimizin odağında hızlı görünmekten çok doğru, onurlu, kayıtlı ve sürdürülebilir destek üretmek vardır."
            />
            <div className="grid gap-3">
              {principles.map((item) => (
                <div key={item} className="rounded-2xl border border-border-soft bg-warm-white p-5 text-sm font-semibold leading-7 text-dark-navy shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
