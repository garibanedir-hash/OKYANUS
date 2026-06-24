import type { Metadata } from "next";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Sık Sorulan Sorular",
  description:
    "Okyanus İnsani Yardım Derneği'nin kuruluş amacı, yardım takibi, faaliyet bölgeleri, yurt dışı çalışma modeli ve bağımsızlığı hakkında sık sorulan sorular.",
  alternates: {
    canonical: "/sss"
  }
};

const faqItems = [
  {
    question: "Okyanus Derneği ne zaman ve hangi amaçla kuruldu?",
    answer:
      "Okyanus İnsani Yardım Derneği, 2024 yılında insani yardım çalışmalarını bağımsız ve sivil bir anlayışla yürütmek amacıyla kurulmuştur. Dernek; bölge, din, dil, ırk veya mezhep ayrımı gözetmeden savaş, doğal afet, yoksulluk ve benzeri mağduriyetler nedeniyle desteğe ihtiyaç duyan kişilere ulaşmayı hedefler."
  },
  {
    question: "Yardım sonrası takip ve denetleme nasıl yapılıyor?",
    answer:
      "Yardım faaliyetleri kayıt altına alınır; saha notları, görsel kayıtlar ve süreç bilgileri kurum içi arşivde takip edilir. Dernek çalışmaları ilgili mevzuat ve yetkili kurum denetimleri çerçevesinde yürütülür. Bağışçı bilgilendirmelerinde kişisel veriler ve ihtiyaç sahiplerinin mahremiyeti korunur."
  },
  {
    question: "Yardım faaliyetleri hangi bölgelerde gerçekleştiriliyor?",
    answer:
      "Çalışmalar, ihtiyaç ve imkan değerlendirmesine göre Türkiye'de ve yurt dışında farklı bölgelerde planlanabilir. Öncelikli hatlar arasında Gazze ve Filistinlilerin yoğun bulunduğu yakın coğrafya ile kriz, afet veya yoksulluk nedeniyle destek ihtiyacı oluşan bölgeler yer alabilir. Güncel faaliyet bilgileri doğrulanan kayıtlarla paylaşılır."
  },
  {
    question: "Yurt dışında yardımlar nasıl gerçekleştiriliyor?",
    answer:
      "Yurt dışı faaliyetleri, saha şartları, yerel koordinasyon, güvenlik değerlendirmesi ve ihtiyaç tespiti dikkate alınarak yürütülür. Yardımların hazırlanması, ulaştırılması ve raporlanması süreçlerinde görsel kayıtlar ve teslimat bilgileri titizlikle arşivlenir."
  },
  {
    question: "Derneğinizin herhangi bir cemaat, grup veya parti ile bağlantısı var mı?",
    answer:
      "Okyanus İnsani Yardım Derneği herhangi bir cemaat, grup veya siyasi partiye bağlı değildir. Çalışmalarını bağışçıların, gönüllülerin ve paydaşların desteğiyle bağımsız bir sivil toplum kuruluşu olarak yürütür."
  }
];

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Kurumsal"
        title="Sık Sorulan Sorular"
        description="Okyanus İnsani Yardım Derneği hakkında en çok merak edilen konular."
      />

      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-3">
            {faqItems.map((item, index) => (
              <details
                key={item.question}
                open={index === 0}
                className="group rounded-2xl border border-border-soft bg-white p-5 shadow-sm"
              >
                <summary className="focus-ring flex cursor-pointer list-none items-start justify-between gap-4 rounded-xl text-left [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 gap-3">
                    <HelpCircle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ocean-green" />
                    <span className="font-extrabold leading-6 text-dark-navy">{item.question}</span>
                  </span>
                  <ChevronDown aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-ink-muted transition group-open:rotate-180" />
                </summary>
                <p className="mt-4 border-t border-border-soft pt-4 text-sm leading-7 text-ink-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
