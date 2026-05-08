import type { Metadata } from "next";
import { news } from "@/data/news";
import { NewsCard } from "@/components/NewsCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";

export const metadata: Metadata = {
  title: "Haberler ve Duyurular",
  description: "Okyanus Derneği faaliyet haberleri, gönüllü buluşmaları ve kampanya duyuruları."
};

export default function NewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Haberler / Duyurular"
        title="Yaşayan, sahada olan ve düzenli paylaşan bir kurum"
        description="Faaliyetlerden, gönüllü buluşmalarından ve kampanya çağrılarından güncel notları bu alanda takip edebilirsiniz."
      />
      <section className="bg-warm-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="Güncel Notlar"
            title="Faaliyetlerden, kampanyalardan ve gönüllü buluşmalarından haberler"
            description="Detay sayfası mimarisi için link yapısı hazırlandı; mock haber verileri ileride CMS içerikleriyle değiştirilebilir."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {news.map((item) => (
              <NewsCard key={item.slug} {...item} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
