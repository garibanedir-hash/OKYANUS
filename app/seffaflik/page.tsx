import type { Metadata } from "next";
import { ClipboardCheck, FileText, HeartHandshake, MessageCircleHeart, ShieldCheck, UserCheck } from "lucide-react";
import { transparencyFaqs } from "@/data/transparencyFaqs";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FAQItem } from "@/components/ui/FAQItem";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { TransparencySection } from "@/components/sections/TransparencySection";

export const metadata: Metadata = {
  title: "Şeffaflık",
  description: "Okyanus Derneği'nin emanet bilinci, bağış takibi, faaliyet raporları ve güven yaklaşımı."
};

const transparencyItems = [
  { icon: HeartHandshake, title: "Emanet bilinci", text: "Her destek, yalnızca bir işlem değil; güvene dayalı bir sorumluluk olarak ele alınır." },
  { icon: ClipboardCheck, title: "Bağışların kayıt altına alınması", text: "Bağış türü, destek alanı ve proje bağlantısı ayrı alanlarda takip edilebilecek şekilde kurgulanır." },
  { icon: ShieldCheck, title: "Proje bazlı takip", text: "Desteklerin ilgili proje veya faaliyet alanıyla eşleşmesi, raporlama altyapısının temelini oluşturur." },
  { icon: FileText, title: "Faaliyet raporları", text: "Dönemsel raporlar, yapılan çalışmaların anlaşılır ve görünür olmasını sağlar." },
  { icon: UserCheck, title: "Gönüllü koordinasyonu", text: "Gönüllü başvuruları ilgi alanı, şehir ve ekip ihtiyacına göre değerlendirilir." },
  { icon: MessageCircleHeart, title: "İnsan onurunu koruyan yardım dili", text: "İletişim dili, görsel kullanım ve saha süreçleri insan mahremiyetini gözetir." }
];

export default function TransparencyPage() {
  return (
    <>
      <PageHero
        eyebrow="Şeffaflık"
        title="Emanetin görünür ve takip edilebilir olması gerekir"
        description="Bağışçı ve gönüllülerimizin güvenini; kayıt, proje bazlı takip, faaliyet raporları ve insan onurunu koruyan yardım anlayışıyla güçlendiriyoruz."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/faaliyet-raporlari" showIcon>
            Faaliyet Raporlarını İncele
          </Button>
          <Button href="/bagis-yap" variant="ghost" showIcon>
            Bağış Akışını Gör
          </Button>
        </div>
      </PageHero>
      <section className="bg-warm-white py-16">
        <Container>
          <SectionHeading
            eyebrow="Şeffaflık Anlayışımız"
            title="Süreçleri sadece iyi niyetle değil, düzenli sistemle de yürütürüz"
            description="Bu sayfadaki yapı frontend seviyesinde hazırlanmıştır; gerçek operasyon verileri, raporlar ve entegrasyonlarla genişletilebilir."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {transparencyItems.map((item) => (
              <TransparencySection key={item.title} {...item} />
            ))}
          </div>
        </Container>
      </section>
      <section className="bg-soft-gray py-16">
        <Container className="max-w-4xl">
          <SectionHeading
            eyebrow="Güven Soruları"
            title="Sık sorulan güven soruları"
            description="Bağış, gönüllülük ve veri güvenliğiyle ilgili temel sorulara sade cevaplar."
          />
          <div className="mt-8 grid gap-4">
            {transparencyFaqs.map((faq) => (
              <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
