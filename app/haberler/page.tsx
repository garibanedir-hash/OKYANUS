import type { Metadata } from "next";
import { NewsCard } from "@/components/NewsCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageHero } from "@/components/sections/PageHero";
import { getNewsPosts } from "@/lib/data/newsRepository";

export const metadata: Metadata = {
  title: "Haberler ve Duyurular",
  description: "Okyanus Derneği faaliyet haberleri, gönüllü buluşmaları ve kampanya duyuruları."
};

export default async function NewsPage() {
  const news = await getNewsPosts();

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
            description="Yayına alınan haber ve duyurular doğrulanan içeriklerle bu alanda paylaşılır."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {news.length ? (
              news.map((item) => (
                <NewsCard key={item.slug} {...item} />
              ))
            ) : (
              <div className="rounded-brand border border-border-soft bg-white p-6 text-sm font-semibold leading-6 text-ink-muted md:col-span-3">
                Yayında olan haber bulunmuyor.
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
